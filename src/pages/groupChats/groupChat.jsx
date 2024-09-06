import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseConfig';
import Header from '../../components/dashboardFeatures/header/header';
import Sidebar from '../../components/dashboardFeatures/sidebar/sidebar';


const GroupInfoPage = () => {
  const { groupId } = useParams(); // Fetch groupId from URL params
  const [groupData, setGroupData] = useState(null);

  // Fetch group data from Firestore
  useEffect(() => {
    const fetchGroupData = async () => {
      if (groupId) {
        try {
          const groupDocRef = doc(firestore, 'groups', groupId);
          const groupDocSnap = await getDoc(groupDocRef);

          if (groupDocSnap.exists()) {
            const groupInfo = groupDocSnap.data();
            setGroupData({
              name: groupInfo.name,
              id: groupDocSnap.id,
              ownerName: groupInfo.ownerName,
              userId:groupInfo.userId,
             
            });
          } else {
            console.error('Group not found');
          }
        } catch (error) {
          console.error('Error fetching group data:', error);
        }
      }
    };

    fetchGroupData();
  }, [groupId]);

  if (!groupData) {
    return <div>Loading group information...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Header at the top */}
    <Header />
    
    <div className="flex flex-1">
      {/* Sidebar on the left */}
      <Sidebar />
      
      {/* Main content on the right */}
      <h1>Group Information</h1>
      <p><strong>Group Name:</strong> {groupData.name}</p>
      <p><strong>Group ID:</strong> {groupData.id}</p>
      <p><strong>Owner Name:</strong> {groupData.ownerName}</p>
      <p><strong>Owner Uid:</strong>{groupData.userId}</p>
    </div>
    </div>
  );
};

export default GroupInfoPage;
