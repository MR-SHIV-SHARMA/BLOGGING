import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import authService from "../appwrite/auth";
import UserProfileCard from "../components/UserProfileCard";

function UserProfile() {
  const userData = useSelector((state) => state.auth.userData);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (userData) {
      authService.getCurrentUser().then((user) => {
        setProfile(user);
      });
    }
  }, [userData]);

  return (
    <div>
      {profile ? <UserProfileCard profile={profile} /> : <p>Loading...</p>}
    </div>
  );
}

export default UserProfile;
