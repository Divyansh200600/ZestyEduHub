import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaFile, FaShareAlt } from 'react-icons/fa';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your server URL

const SidePanel = ({ chatId, currentUserProfile, friendProfile }) => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // Store other users' streams
  const videoRef = useRef(); // Reference for the local video

  // Handle video toggle
  useEffect(() => {
    if (videoEnabled) {
      startVideo();
    } else if (stream) {
      stopVideo();
    }
  }, [videoEnabled]);

  // Handle users starting/stopping their video
  useEffect(() => {
    socket.on('user-started-video', ({ userId }) => {
      console.log(`User ${userId} started their video.`);
      startReceivingVideo(userId);
    });

    socket.on('user-stopped-video', ({ userId }) => {
      console.log(`User ${userId} stopped their video.`);
      removeRemoteStream(userId);
    });

    return () => {
      socket.off('user-started-video');
      socket.off('user-stopped-video');
    };
  }, []);



  // Start the local video stream and notify others
  const startVideo = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micEnabled });
      setStream(localStream);
      videoRef.current.srcObject = localStream;

      // Notify others that you started the video
      socket.emit('start-video', { userId: currentUserProfile.id, chatId });
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  // Stop the local video stream and notify others
  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());  // Properly stop the video stream
      setStream(null);
      socket.emit('stop-video', { userId: currentUserProfile.id, chatId });
    }
  };

  // Request and show the video stream from another user
  const startReceivingVideo = async (userId) => {
    try {
      const remoteStream = await navigator.mediaDevices.getUserMedia({ video: true }); // Simulated remote stream for demo
      setRemoteStreams(prevStreams => ({
        ...prevStreams,
        [userId]: remoteStream,
      }));
    } catch (error) {
      console.error('Error receiving remote stream:', error);
    }
  };

  // Remove the remote video when a user stops their stream
  const removeRemoteStream = (userId) => {
    setRemoteStreams(prevStreams => {
      const updatedStreams = { ...prevStreams };
      delete updatedStreams[userId];
      return updatedStreams;
    });
  };

  return (
    <>
      {/* Grey Sidebar Mini Panel */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white shadow-lg rounded-lg p-4 flex space-x-4">
        {/* Control Panel */}
        <button
          className={`flex items-center justify-center p-3 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          onClick={() => setMicEnabled(!micEnabled)}
        >
          {micEnabled ? <FaMicrophone className="text-white text-xl" /> : <FaMicrophoneSlash className="text-gray-600 text-xl" />}
        </button>
        <button
          className={`flex items-center justify-center p-3 rounded-full ${videoEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <FaVideo className="text-white text-xl" /> : <FaVideoSlash className="text-gray-600 text-xl" />}
        </button>
        <button
          className="flex items-center justify-center p-3 rounded-full bg-yellow-500"
          onClick={() => alert('Document sharing coming soon!')}
        >
          <FaFile className="text-white text-xl" />
        </button>
        <button
          className="flex items-center justify-center p-3 rounded-full bg-purple-500"
          onClick={() => alert('Resource sharing coming soon!')}
        >
          <FaShareAlt className="text-white text-xl" />
        </button>
      </div>

      {/* Local Video */}
      {videoEnabled && (
        <div className="fixed bottom-114 right-6 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
            {currentUserProfile.name}
          </span>
        </div>
      )}

      {/* Remote Video Streams */}
      <div className="fixed bottom-44 right-4 flex flex-col space-y-2">
        {Object.keys(remoteStreams).map((userId) => (
          <div key={userId} className="relative w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={(videoElement) => {
                if (videoElement) {
                  videoElement.srcObject = remoteStreams[userId];
                }
              }}
              autoPlay
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
              {friendProfile.name || userId} {/* Show friend's name if available, otherwise fallback to userId */}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SidePanel;
