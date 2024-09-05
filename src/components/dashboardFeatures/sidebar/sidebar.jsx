import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaRegListAlt, FaRegEdit, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import { auth, firestore, storage } from '../../../utils/firebaseConfig';
import { collection, doc, getDoc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

Modal.setAppElement('#root');

const Sidebar = () => {
  const [active, setActive] = useState('group');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [userData, setUserData] = useState({ name: '', username: '' });
  const [userGroups, setUserGroups] = useState([]);

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
      const q = query(collection(firestore, 'groups'), where('username', '==', userData.username));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserGroups(groups);
      });

      return () => unsubscribe();
    }
  }, [userData.username]);

  const handleClick = (section) => {
    setActive(section);
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

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

    console.log('Group details:', groupDetails);

    // Save group details to Firestore
    await setDoc(doc(firestore, 'groups', groupId), groupDetails);

    // Upload group icon if provided
    if (groupImage) {
      const imageRef = ref(storage, `groupData/groupIcons/${groupId}`);
      const uploadTask = await uploadBytes(imageRef, groupImage);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log('File available at', downloadURL);

      // Optionally update group details with image URL
      await setDoc(doc(firestore, 'groups', groupId), { iconUrl: downloadURL }, { merge: true });
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white shadow-md h-screen flex flex-col">
      {/* Switcher */}
      <div className="p-4 border-b border-gray-700">
        <div className="mt-2 flex justify-between">
          <button
            className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 ease-in-out ${active === 'group' ? 'neon-effect' : 'hover:from-blue-600 hover:to-blue-800'}`}
            onClick={() => handleClick('group')}
          >
            Group
          </button>
          <button
            className={`bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 ease-in-out ${active === 'friends' ? 'neon-effect' : 'hover:from-green-600 hover:to-teal-700'}`}
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
            <div className="flex space-x-4">
              <button
                className="bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center"
                onClick={openModal}
              >
                <FaRegEdit className="mr-2" /> Create
              </button>
              <button className="bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center">
                <FaUsers className="mr-2" /> Join
              </button>
            </div>

            {/* List of created groups */}
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                {userGroups.map(group => (
                  <div key={group.id} className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer">
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
            <div className="flex space-x-4">
              <button className="bg-green-600 text-white p-2 rounded-md shadow-md hover:bg-green-700 transition-all flex items-center">
                <FaRegListAlt className="mr-2" /> All Zests
              </button>
              <button className="bg-green-600 text-white p-2 rounded-md shadow-md hover:bg-green-700 transition-all flex items-center">
                <FaUserPlus className="mr-2" /> Add
              </button>
            </div>
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
    </aside>
  );
};

export default Sidebar;
