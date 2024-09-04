import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig'; // Adjust the import path as needed
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import PhoneDb from './PhoneDb'; // Import the mobile version of the dashboard
import DesktopDb from './DesktopDb'; // Import the desktop version of the dashboard

const Dashboard = () => {
  const { suid } = useParams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error.message);
    }
  };

  const isMobile = useMediaQuery({ maxWidth: 767 }); // Consider screens with max-width 767px as mobile

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={handleLogout}
        className="w-full p-3 bg-red-500 text-white rounded-lg mt-4 hover:bg-red-600 transition duration-300 ease-in-out"
      >
        Logout
      </button>
      
      {isMobile ? <PhoneDb /> : <DesktopDb />}
    </div>
  );
};

export default Dashboard;
