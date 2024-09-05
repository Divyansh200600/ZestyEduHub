import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaTimes, FaEnvelope, FaRegEdit } from 'react-icons/fa';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, firestore, storage } from '../../../utils/firebaseConfig';
import { collection, doc, getDoc, setDoc, query, where, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DynamicProfile from './DynamicProfile'; // Import DynamicProfile
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const Sidebar = () => {
  const [active, setActive] = useState('group');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [userData, setUserData] = useState({ name: '', username: '' });
  const [userGroups, setUserGroups] = useState([]);
  const [allZests, setAllZests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(''); // NEW
  const [friendModalIsOpen, setFriendModalIsOpen] = useState(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({});
  const navigate = useNavigate(); // For navigating programmatically

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData({
            name: userDocSnap.data()?.name || '',
            username: userDocSnap.data()?.username || ''
          });
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData.username) {
      // Fetch user's groups
      const q = query(collection(firestore, 'groups'), where('username', '==', userData.username));
      const unsubscribeGroups = onSnapshot(q, (querySnapshot) => {
        const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserGroups(groups);
      });

      // Fetch all users (Zests)
      const qZests = query(collection(firestore, 'users'));
      const unsubscribeZests = onSnapshot(qZests, (querySnapshot) => {
        const zests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllZests(zests);
      });

      // Fetch user's friends
      const user = auth.currentUser;
      const userFriendsRef = collection(firestore, `users/${user.uid}/friends`);
      const unsubscribeFriends = onSnapshot(userFriendsRef, (querySnapshot) => {
        const friends = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserFriends(friends.filter(friend => friend.status === 'accepted'));
      });

      // Fetch invitations
      const qInvitations = query(collection(firestore, 'invitations'), where('recipient', '==', userData.username));
      const unsubscribeInvitations = onSnapshot(qInvitations, (querySnapshot) => {
        const invites = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvitations(invites);
      });

      return () => {
        unsubscribeGroups();
        unsubscribeZests();
        unsubscribeFriends();
        unsubscribeInvitations();
      };
    }
  }, [userData.username]);

  const handleClick = (section) => {
    setActive(section);
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const openFriendModal = () => setFriendModalIsOpen(true);
  const closeFriendModal = () => setFriendModalIsOpen(false);

  const openInvitationModal = () => setInvitationModalOpen(true);
  const closeInvitationModal = () => setInvitationModalOpen(false);

  const handleInvitationClick = () => setInvitationModalOpen(true);

  const handleImageChange = (event) => {
    setGroupImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    closeModal();

    // Generate a random group ID
    const groupId = `hub-${Math.random().toString(36).substring(2, 7)}`;

    // Prepare group details
    const groupDetails = {
      id: groupId,
      name: groupName,
      inviteLink: `http://localhost:3000/invite/${groupId}`,
      ownerName: userData.name,
      username: userData.username,
    };

    // Save group details to Firestore
    await setDoc(doc(firestore, 'groups', groupId), groupDetails);

    // Upload group icon if provided
    if (groupImage) {
      const imageRef = ref(storage, `groupData/groupIcons/${groupId}`);
      const uploadTask = await uploadBytes(imageRef, groupImage);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // Optionally update group details with image URL
      await setDoc(doc(firestore, 'groups', groupId), { iconUrl: downloadURL }, { merge: true });
    }

    // Clear the input fields
    setGroupName('');
    setGroupImage(null);
  };

  const handleSendFriendRequest = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user && user.uid && selectedFriend) {
      const usersRef = collection(firestore, 'users');
      const selectedFriendQuery = query(usersRef, where('username', '==', selectedFriend));
      const selectedFriendSnapshot = await getDocs(selectedFriendQuery);

      if (!selectedFriendSnapshot.empty) {
        const friendRequest = {
          sender: userData.username,
          recipient: selectedFriend,
          status: 'pending'
        };

        // Add a friend request to the invitations collection
        await setDoc(doc(firestore, 'invitations', `${userData.username}-${selectedFriend}`), friendRequest);

        setSelectedFriend('');
        toast.success('Friend request sent successfully!');
      } else {
        toast.error('User not found!');
      }
    }
    setLoading(false);
  };

  const handleAcceptInvitation = async (invitationId) => {
    const user = auth.currentUser;
    if (user && user.uid) {
      const invitationDoc = doc(firestore, 'invitations', invitationId);
      const invitationSnap = await getDoc(invitationDoc);
      if (invitationSnap.exists()) {
        // Extract the sender from the invitation
        const { sender } = invitationSnap.data();

        // Add friend to user's friends collection
        const userFriendsCol = collection(firestore, `users/${user.uid}/friends`);
        await setDoc(doc(userFriendsCol, sender), { username: sender, status: 'accepted' });

        // Remove the invitation
        await deleteDoc(invitationDoc);
        setInvitations(invitations.filter(invite => invite.id !== invitationId));

        // Additionally update the sender's friends list
        const senderQuery = query(collection(firestore, 'users'), where('username', '==', sender));
        const senderSnapshot = await getDocs(senderQuery);
        if (!senderSnapshot.empty) {
          const senderDoc = senderSnapshot.docs[0];
          const friendColInSender = collection(firestore, `users/${senderDoc.id}/friends`);
          await setDoc(doc(friendColInSender, userData.username), { username: userData.username, status: 'accepted' });
        }

        toast.success('Friend request accepted successfully!');
      }
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    const user = auth.currentUser;
    if (user && user.uid) {
      const invitationDoc = doc(firestore, 'invitations', invitationId);
      const inviteData = (await getDoc(invitationDoc)).data();

      await deleteDoc(invitationDoc);
      setInvitations(invitations.filter(invite => invite.id !== invitationId));

      // Additionally remove from sender's invitation list
      if (inviteData) {
        const senderQuery = query(collection(firestore, 'users'), where('username', '==', inviteData.sender));
        const senderSnapshot = await getDocs(senderQuery);
        if (!senderSnapshot.empty) {
          const senderDocs = senderSnapshot.docs || [];
          if (senderDocs.length > 0) {
            const senderDoc = senderDocs[0];
            const inviteInSenderRef = doc(firestore, `users/${senderDoc.id}/friends`, userData.username);
            await deleteDoc(inviteInSenderRef);
          }
        }
      }

      toast.success('Friend request rejected successfully!');
    }
  };

  const handleProfileLoaded = (username, profile) => {
    setProfiles(prevProfiles => ({
      ...prevProfiles,
      [username]: profile,
    }));
  };

  // New function to handle friend click
  const handleFriendClick = (friend) => {
    setSelectedFriend(friend.username); // NEW
    navigate(`/dashboard/$me/${friend.username}`, {
      state: { username: friend.username, uid: friend.id },
    });
  };

  // NEW function to handle group click
  const handleGroupClick = (group) => {
    setSelectedGroup(group.id);
    navigate(`/dashboard/${group.name}/${group.id}`, {
      state: { groupName: group.name, groupId: group.id }
    });
  };
  

  const filteredZests = allZests.filter(zest => {
    return zest.username !== userData.username
      && zest.username.includes(searchTerm.replace('@', '').toLowerCase())
      && !userFriends.some(friend => friend.username === zest.username); // Check if already a friend
  });

  return (
    <aside className="w-64 bg-gray-800 text-white shadow-md h-screen flex flex-col">
      <ToastContainer />
      {/* Switcher */}
      <div className="p-4 border-b border-gray-700">
        <div className="mt-2 flex justify-between">
          <button
            className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-md shadow-md transform transition-all duration-300 ease-in-out ${active === 'group' ? 'neon-effect' : 'hover:from-blue-600 hover:to-blue-800'}`}
            onClick={() => handleClick('group')}
          >
            Group
          </button>
          <button
            className={`bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-md shadow-md transform transition-all duration-300 ease-in-out ${active === 'friends' ? 'neon-effect' : 'hover:from-green-600 hover:to-teal-700'}`}
            onClick={() => handleClick('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      {/* Dynamic Content Based on Active Section */}
      <div className="p-4 flex-grow overflow-y-auto">
        {active === 'group' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Group Options</h3>
            <div className="flex space-x-2 mb-4">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center text-sm"
                onClick={openModal}
              >
                <FaRegEdit className="mr-1" /> Create
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center text-sm">
                <FaUsers className="mr-1" /> Join
              </button>
            </div>

            {/* List of created groups */}
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                {userGroups.map(group => (
                  <div key={group.id} onClick={() => handleGroupClick(group)} 
                    className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer ${selectedGroup === group.id ? 'bg-gray-700' : ''}`}>
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      {group.iconUrl ? (
                        <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-white">{group.name.charAt(0)}</span>
                      )}
                    </div>
                    <span>{group.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'friends' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Friends Options</h3>
            <div className="flex space-x-2 mb-4">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-green-700 transition-all flex items-center text-sm"
                onClick={openFriendModal}
                disabled={loading}
              >
                <FaUserPlus className="mr-1" /> {loading ? 'Sending...' : 'Add'}
              </button>
              <button
                className={`bg-yellow-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-yellow-700 transition-all flex items-center text-sm ${invitations.length > 0 ? 'bg-yellow-500' : ''}`}
                onClick={handleInvitationClick}
              >
                <FaEnvelope className="mr-1" /> Invitations ({invitations.length})
              </button>
            </div>

            {userFriends.length === 0 ? (
              <p>You don't have any friends yet. Click on "Add" to find friends.</p>
            ) : (
              <div>
                <div className="flex flex-col space-y-2">
                  {userFriends.map(friend => (
                    <div key={friend.id} onClick={() => handleFriendClick(friend)} 
                      className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer ${selectedFriend === friend.username ? 'bg-gray-700' : ''}`}>
                      <DynamicProfile
                        username={friend.username}
                        onProfileLoaded={profile => handleProfileLoaded(friend.username, profile)}
                      />
                      <span className="text-white ml-2">
                        {profiles[friend.username]?.name || friend.name || friend.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Group Creation */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Create Group"
        className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-gray-900 text-white p-6 rounded-lg w-80 relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
          >
            <FaTimes className="text-white" />
          </button>
          <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
          <form onSubmit={handleSubmit}>
            <label className="block mb-2">
              Group Name
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1 block w-full p-2 rounded bg-gray-700"
                required
              />
            </label>
            <label className="block mb-2">
              Group Icon
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full p-2 rounded bg-gray-700"
              />
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all w-full"
            >
              Create Group
            </button>
          </form>
        </div>
      </Modal>

      {/* Modal for Adding Friend */}
      <Modal
        isOpen={friendModalIsOpen}
        onRequestClose={closeFriendModal}
        contentLabel="Add Friend"
        className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-gray-900 text-white p-6 rounded-lg w-80 relative">
          <button
            onClick={closeFriendModal}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
          >
            <FaTimes className="text-white" />
          </button>
          <h2 className="text-lg font-semibold mb-4">Add Friend</h2>
          <input
            type="text"
            placeholder="Search by @username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700"
          />
          <div className="flex flex-col space-y-2 mb-4">
            {filteredZests.map(zest => (
              <div key={zest.id} className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white">{zest.name ? zest.name.charAt(0) : ''}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFriend(zest.username);
                    handleSendFriendRequest();
                  }}
                  className="bg-green-600 text-white px-2 py-1 rounded-md shadow-md hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal for Invitations */}
      <Modal
        isOpen={invitationModalOpen}
        onRequestClose={closeInvitationModal}
        contentLabel="Manage Invitations"
        className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-gray-900 text-white p-6 rounded-lg w-80 relative">
          <button
            onClick={closeInvitationModal}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
          >
            <FaTimes className="text-white" />
          </button>
          <h2 className="text-lg font-semibold mb-4">Invitations</h2>
          <div className="flex flex-col space-y-2 mb-4">
            {invitations.length === 0 ? (
              <p>You have no invitations at the moment.</p>
            ) : (
              invitations.map(invite => (
                <div key={invite.id} className="flex items-center space-x-2 bg-gray-800 p-2 rounded-md">
                  <span>{invite.sender}</span>
                  <button
                    onClick={() => handleAcceptInvitation(invite.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded-md shadow-md hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvitation(invite.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </aside>
  );
};

export default Sidebar;