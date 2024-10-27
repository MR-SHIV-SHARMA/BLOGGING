import React, { useState } from "react";
import authService from "../appwrite/auth";

function UserProfileForm({ profile }) {
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [location, setLocation] = useState(profile.location || "");
  const [profilePicture, setProfilePicture] = useState(
    profile.profilePicture || ""
  );
  const [totalPosts, setTotalPosts] = useState(profile.totalPosts || 0);
  const [activePosts, setActivePosts] = useState(profile.activePosts || 0);
  const [inactivePosts, setInactivePosts] = useState(
    profile.inactivePosts || 0
  );
  const [bio, setBio] = useState(profile.bio || "");
  const [twitter, setTwitter] = useState(profile.twitter || "");
  const [linkedIn, setLinkedIn] = useState(profile.linkedIn || "");
  const [createdAt, setCreatedAt] = useState(profile.createdAt || "");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authService.getCurrentUser({
        name,
        email,
        location,
        profilePicture,
        totalPosts,
        activePosts,
        inactivePosts,
        bio,
        twitter,
        linkedIn,
        createdAt,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleReset = () => {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setLocation(profile.location || "");
    setProfilePicture(profile.profilePicture || "");
    setTotalPosts(profile.totalPosts || 0);
    setActivePosts(profile.activePosts || 0);
    setInactivePosts(profile.inactivePosts || 0);
    setBio(profile.bio || "");
    setTwitter(profile.twitter || "");
    setLinkedIn(profile.linkedIn || "");
    setCreatedAt(profile.createdAt || "");
  };

  return (
    <form onSubmit={handleUpdate} className="mt-4 max-w-md mx-auto">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="file"
        onChange={(e) =>
          setProfilePicture(URL.createObjectURL(e.target.files[0]))
        }
        placeholder="Upload Profile Picture"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="number"
        value={totalPosts}
        onChange={(e) => setTotalPosts(e.target.value)}
        placeholder="Total Posts"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="number"
        value={activePosts}
        onChange={(e) => setActivePosts(e.target.value)}
        placeholder="Active Posts"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="number"
        value={inactivePosts}
        onChange={(e) => setInactivePosts(e.target.value)}
        placeholder="Inactive Posts"
        className="border p-2 rounded w-full mb-2"
      />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
        placeholder="Twitter URL"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        value={linkedIn}
        onChange={(e) => setLinkedIn(e.target.value)}
        placeholder="LinkedIn URL"
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        value={createdAt}
        onChange={(e) => setCreatedAt(e.target.value)}
        placeholder="Joined"
        className="border p-2 rounded w-full mb-2"
      />

      <div className="flex space-x-4 mt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Update Profile
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-300 text-black p-2 rounded w-full"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default UserProfileForm;
