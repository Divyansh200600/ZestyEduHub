import React, { useState } from 'react';
import { FaUsers, FaUserPlus, FaRegListAlt, FaRegEdit } from 'react-icons/fa'; // Import React Icons

const Sidebar = () => {
  const [active, setActive] = useState('group'); // Default state to 'group'

  const handleClick = (section) => {
    setActive(section);
  };

  return (
    <aside className="w-64 bg-gray-800 text-white shadow-md h-screen flex flex-col">
      {/* Switcher */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Switcher</h2>
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
      <div className="p-4 flex-grow">
        {active === 'group' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Group Options</h3>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center">
                <FaRegEdit className="mr-2" /> Create
              </button>
              <button className="bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all flex items-center">
                <FaUsers className="mr-2" /> Join
              </button>
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
    </aside>
  );
};

export default Sidebar;
