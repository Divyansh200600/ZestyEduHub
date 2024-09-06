import React from 'react';
import Header from '../../components/dashboardFeatures/header/header';
import Sidebar from '../../components/dashboardFeatures/sidebar/sidebar';

const DesktopDb = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="w-64 bg-gray-200" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 bg-gray-50">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Welcome to your Dashboard</h2>
          
          {/* Four cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-4xl font-bold mt-4">1,234</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Sales</h3>
              <p className="text-4xl font-bold mt-4">$25,678</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold">New Signups</h3>
              <p className="text-4xl font-bold mt-4">345</p>
            </div>

            {/* Card 4 */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Feedbacks</h3>
              <p className="text-4xl font-bold mt-4">98</p>
            </div>
          </div>

          {/* Add more dashboard content here */}
        </main>
      </div>
    </div>
  );
};

export default DesktopDb;
