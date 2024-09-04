import React, { useState, useEffect } from 'react';
import { auth } from '../../../utils/firebaseConfig'; // Import your Firebase config
import { fetchUserData } from '../fetchUserData/page';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../../../utils/firebaseConfig'; // Correct import statement

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const Navigate = useNavigate();
  const db = firestore;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userData = await fetchUserData(userId);
        setUser(userData);
        setName(userData?.name || '');
        setProfilePhoto(userData?.profilePhoto || '');
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await setDoc(doc(db, 'users', userId), { name, profilePhoto }, { merge: true });
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name, photoURL: profilePhoto });
        }
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        alert('Password changed successfully');
        setPassword('');
        setNewPassword('');
      } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
      }
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      Navigate('/'); // Redirect to the home page
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  const handleProfilePhotoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-container p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="profile-section mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Profile Photo:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleProfilePhotoChange} 
            className="border p-2"
          />
          {profilePhoto && (
            <img 
              src={profilePhoto} 
              alt="Profile Preview" 
              className="mt-2 w-20 h-20 rounded-full"
            />
          )}
        </div>
        <button 
          onClick={handleProfileUpdate} 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Update Profile
        </button>
      </div>
      
      <div className="password-section mb-6">
        <h2 className="text-xl font-semibold mb-2">Change Password</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Password:</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="border p-2 w-full"
          />
        </div>
        <button 
          onClick={handlePasswordChange} 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Change Password
        </button>
      </div>

      <button 
        onClick={handleLogout} 
        className="bg-red-500 text-white p-2 rounded"
      >
        Log Out
      </button>
    </div>
  );
};

export default SettingsPage;
