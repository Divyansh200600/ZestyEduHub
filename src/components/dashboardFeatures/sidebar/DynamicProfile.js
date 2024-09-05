import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../../utils/firebaseConfig';

const DynamicProfile = React.memo(({ username, onProfileLoaded }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track the last fetched username to avoid redundant requests
  const lastFetchedUsername = useRef(null);

  const fetchProfile = useCallback(async () => {
    if (!username || username === lastFetchedUsername.current) return;
    setLoading(true);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setProfile(userData);
        if (onProfileLoaded) onProfileLoaded(userData);
        lastFetchedUsername.current = username; // Track the last fetched username
      } else {
        setProfile(null); // Set profile to null if not found
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null); // Set profile to null in case of an error
    } finally {
      setLoading(false);
    }
  }, [username, onProfileLoaded]);

  // Use a debouncing effect to delay fetch requests
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProfile();
    }, 300); // Adjust debounce delay as needed

    return () => clearTimeout(delayDebounce);
  }, [fetchProfile]);

  if (loading) {
    return <div className="w-8 h-8 bg-gray-600 rounded-full"></div>;
  }

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      {profile ? (
        profile.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt={profile.name || profile.username}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <img
            src="https://firebasestorage.googleapis.com/v0/b/vr-study-group.appspot.com/o/duggu-store%2Fkawaii-ben.gif?alt=media&token=46095e90-ebbf-48ea-9a27-04af3f501db1"  
            alt="Default Profile"
            className="w-full h-full object-cover rounded-full"
          />
        )
      ) : (
        <span className="text-white">N/A</span>
      )}
    </div>
  );
});

export default DynamicProfile;
