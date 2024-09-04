import React, { useState, useEffect } from 'react';
import { FaBell, FaCog } from 'react-icons/fa'; // Import the settings icon
import { auth } from '../../../utils/firebaseConfig';
import { fetchUserData } from '../fetchUserData/page';
import { useNavigate } from 'react-router-dom'; // Import useHistory for navigation

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth.currentUser?.uid; // Get the current user ID
      if (userId) {
        const userData = await fetchUserData(userId);
        setUser(userData);
      }
    };

    fetchUserProfile();
  }, []);

  const navigateToSettings = () => {
    navigate('/settings'); 
  };

  return (
    <header className="bg-white shadow-md z-10 w-full">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo and Title Section */}
        <div className="flex items-center space-x-4">
          <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/vr-study-group.appspot.com/o/android-chrome-512x512.png?alt=media&token=9611a508-1d7e-4990-afc1-af899b1221df" 
              alt="Logo Image" 
              className="w-10 h-10 rounded-full"
            />
          </a>
          <h1 className="text-xl font-bold text-gray-800">ZestyEdu Hub</h1>
        </div>

        {/* User Profile and Notification Section */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="User Profile" 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">No Image</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-800 font-medium">Hello, <span className="font-semibold">{user?.name || 'User Name'}👋</span></p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-gray-200 text-gray-800 p-2 rounded-full hover:bg-gray-300">
              <FaBell className="text-lg" /> {/* Notification icon */}
            </button>
            <button 
              className="bg-gray-200 text-gray-800 p-2 rounded-full hover:bg-gray-300"
              onClick={navigateToSettings} // Click handler for settings navigation
            >
              <FaCog className="text-lg" /> {/* Settings icon */}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
