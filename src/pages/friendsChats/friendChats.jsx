import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Header from '../../components/dashboardFeatures/header/header';
import Sidebar from '../../components/dashboardFeatures/sidebar/sidebar';

const FriendDetailPage = () => {
  const { id } = useParams(); // Get the dynamic username from the route
  

  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Header at the top */}
    <Header />
    
    <div className="flex flex-1">
      {/* Sidebar on the left */}
      <Sidebar />
      
      {/* Main content on the right */}
      <main className="flex-1 p-6 bg-gray-50">
       <p>uid : {id}</p>
        {/* Add more dashboard content here */}
      </main>
    </div>
  </div>
  );
};

export default FriendDetailPage;
