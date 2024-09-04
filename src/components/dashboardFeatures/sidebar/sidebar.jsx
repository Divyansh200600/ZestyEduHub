import React, { useState } from 'react';

const Sidebar = () => {
  const [active, setActive] = useState('dashboard'); // State to manage active link

  const handleClick = (section) => {
    setActive(section);
  };

  return  (
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

     
     
    </aside>
  );
};

export default Sidebar;
