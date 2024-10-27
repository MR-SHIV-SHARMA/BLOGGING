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
    <div className="bg-gray-100">
      {profile ? (
        <div className="">
          <UserProfileCard profile={profile} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default UserProfile;
