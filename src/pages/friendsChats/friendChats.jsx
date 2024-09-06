import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/dashboardFeatures/header/header';
import Sidebar from '../../components/dashboardFeatures/sidebar/sidebar';
import { firestore } from '../../utils/firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FriendDetailPage = () => {
  const { id: chatId } = useParams(); // Get the chatId from the route
  const [friendProfile, setFriendProfile] = useState({ name: 'Unknown', photo: 'https://firebasestorage.googleapis.com/v0/b/vr-study-group.appspot.com/o/duggu-store%2Fkawaii-ben.gif?alt=media&token=46095e90-ebbf-48ea-9a27-04af3f501db1' });
  const [currentUserProfile, setCurrentUserProfile] = useState({ name: 'Your Name', photo: 'https://firebasestorage.googleapis.com/v0/b/vr-study-group.appspot.com/o/duggu-store%2Fkawaii-ben.gif?alt=media&token=46095e90-ebbf-48ea-9a27-04af3f501db1' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const auth = getAuth();
  const currentUser = auth.currentUser ? auth.currentUser.uid : null;
  const fallbackPhotoUrl = 'https://firebasestorage.googleapis.com/v0/b/vr-study-group.appspot.com/o/duggu-store%2Fkawaii-ben.gif?alt=media&token=46095e90-ebbf-48ea-9a27-04af3f501db1';

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      const userDoc = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        return userSnapshot.data();
      } else {
        return { name: 'Unknown', photo: fallbackPhotoUrl };
      }
    };

    const fetchChatDetails = async () => {
      const [userAId, userBId] = chatId.split('_');
      const friendId = userAId === currentUser ? userBId : userAId;

      // Fetch profiles for the current user and the friend
      const currentUserData = await fetchUserProfile(currentUser);
      const friendData = await fetchUserProfile(friendId);

      setCurrentUserProfile(currentUserData);
      setFriendProfile(friendData);

      // Fetch messages
      const messagesRef = collection(firestore, 'friendsChats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

      return () => unsubscribe();
    };

    if (currentUser) {
      fetchChatDetails();
    }
  }, [chatId, currentUser, fallbackPhotoUrl]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        const messagesRef = collection(firestore, 'friendsChats', chatId, 'messages');
        await addDoc(messagesRef, {
          text: newMessage,
          timestamp: new Date(),
          senderId: currentUser,
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message', error);
      }
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Handle case when current user isn't available
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-300">
              <img src={friendProfile.profilePhoto || fallbackPhotoUrl} alt={friendProfile.name} className="w-full h-full rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{friendProfile.name}</h1>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-white rounded-lg shadow-md">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start mb-4 ${msg.senderId === currentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-center ${msg.senderId === currentUser ? 'order-2' : 'order-1'}`}>
                  <img
                    src={msg.senderId === currentUser ? (currentUserProfile.profilePhoto || fallbackPhotoUrl) : (friendProfile.profilePhoto || fallbackPhotoUrl)}
                    alt={msg.senderId === currentUser ? currentUserProfile.name : friendProfile.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className={`p-2 rounded-lg ${msg.senderId === currentUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <p className="font-semibold">{msg.senderId === currentUser ? currentUserProfile.name : friendProfile.name}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex items-center p-4 bg-white rounded-lg shadow-md mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-l-lg"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
              Send
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default FriendDetailPage;