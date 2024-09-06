import React, { useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaFile, FaShareAlt } from 'react-icons/fa';

const SidePanel = () => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [documentEnabled, setDocumentEnabled] = useState(false);
  const [resourceSharingEnabled, setResourceSharingEnabled] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 shadow-lg rounded-lg p-4 flex items-center space-x-4">
      <div className="relative group">
        <button
          className={`flex items-center justify-center p-3 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          onClick={() => setMicEnabled(!micEnabled)}
        >
          {micEnabled ? <FaMicrophone className="text-white" /> : <FaMicrophoneSlash className="text-gray-600" />}
        </button>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Mic
        </span>
      </div>
      <div className="relative group">
        <button
          className={`flex items-center justify-center p-3 rounded-full ${videoEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <FaVideo className="text-white" /> : <FaVideoSlash className="text-gray-600" />}
        </button>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Video
        </span>
      </div>
      <div className="relative group">
        <button
          className={`flex items-center justify-center p-3 rounded-full ${documentEnabled ? 'bg-yellow-500' : 'bg-gray-300'}`}
          onClick={() => setDocumentEnabled(!documentEnabled)}
        >
          <FaFile className={`text-white ${documentEnabled ? '' : 'opacity-50'}`} />
        </button>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Document
        </span>
      </div>
      <div className="relative group">
        <button
          className={`flex items-center justify-center p-3 rounded-full ${resourceSharingEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}
          onClick={() => setResourceSharingEnabled(!resourceSharingEnabled)}
        >
          <FaShareAlt className={`text-white ${resourceSharingEnabled ? '' : 'opacity-50'}`} />
        </button>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Resource Sharing
        </span>
      </div>
    </div>
  );
};

export default SidePanel;
