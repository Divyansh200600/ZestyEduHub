import React from 'react';
import Header from '../../components/dashboardFeatures/header/header';
import Sidebar from '../../components/dashboardFeatures/sidebar/sidebar';

const DesktopDb = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header at the top */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar on the left */}
        <Sidebar />
        
        {/* Main content on the right */}
        <main className="flex-1 p-6 bg-gray-50">
          <h2 className="text-3xl font-semibold text-gray-700">Welcome to your Dashboard</h2>
          <p className="mt-4 text-gray-600">
            Here you can find all the information and settings related to your account.
          </p>
          {/* Add more dashboard content here */}
        </main>
      </div>
    </div>
  );
};

export default DesktopDb;
