import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function UserProfileCard() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [link, setLink] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    axios
      .get(`https://bg-io.vercel.app/api/v1/user/profile/view`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          setProfile(data.data);
          setFullname(data.data.fullname || "");
          setBio(data.data.bio || "");
          setLocation(data.data.location || "");
          setHobbies(data.data.hobbies || []);
          setLink(data.data.link || "");
          setSocialMedia(data.data.socialMedia || "");
        } else {
          toast.error(data.message || "Failed to fetch profile");
        }
      })
      .catch(() => toast.error("Error fetching user profile"));
  }, []);

  const handleProfileUpdate = () => {
    const token = localStorage.getItem("accessToken");

    const updateData = {
      fullname,
      bio,
      location,
      hobbies,
      link,
      socialMedia,
    };

    axios
      .patch(`https://bg-io.vercel.app/api/v1/user/profile/media`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          toast.success("Profile updated successfully!");
          setProfile((prev) => ({ ...prev, ...updateData }));
        } else {
          toast.error(data.message || "Failed to update profile");
        }
      })
      .catch(() => toast.error("Error updating profile"));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const uploadAvatar = async () => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const token = localStorage.getItem("accessToken");

    await axios
      .patch(
        "https://bg-io.vercel.app/api/v1/user/profile/media/update-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data;
        if (data.success) {
          toast.success("Avatar updated successfully!");
          setProfile((prev) => ({ ...prev, avatar: data.avatarUrl }));
        } else {
          toast.error(data.message || "Failed to update avatar");
        }
      })
      .catch(() => toast.error("Error updating avatar"));
  };

  const uploadCoverImage = () => {
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);

    const token = localStorage.getItem("accessToken");

    axios
      .patch(
        "https://bg-io.vercel.app/api/v1/user/profile/media/update-cover-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data;
        if (data.success) {
          toast.success("Cover image updated successfully!");
          setProfile((prev) => ({ ...prev, coverImage: data.coverImageUrl }));
        } else {
          toast.error(data.message || "Failed to update cover image");
        }
      })
      .catch(() => toast.error("Error updating cover image"));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden relative p-4 sm:p-6 md:p-8">
      <div className="h-60 sm:h-72 md:h-80 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative rounded-lg overflow-hidden">
        {profile?.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer">
          <input
            type="file"
            onChange={(e) => setCoverImageFile(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => {}}
            className="text-indigo-600 hover:text-indigo-800"
          >
            📷
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center -mt-16 md:-mt-20 relative">
        <div className="relative">
          <img
            src={profile?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-xl transition-transform transform hover:scale-110"
          />
          <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer">
            <input
              type="file"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => {}}
              className="text-indigo-600 hover:text-indigo-800"
            >
              📷
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-gray-900">
          {profile?.username}
        </h2>
        <p className="text-gray-600 text-center px-6 md:px-8">
          {profile?.bio || "No bio available"}
        </p>
      </div>

      {/* Profile Details */}
      {!isEditing ? (
        <div className="px-6 py-4 text-center">
          <p className="text-gray-500 text-sm md:text-base">
            {profile?.fullname || "Fullname not set"}
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {profile?.location || "Location not set"}
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {profile?.hobbies?.length > 0
              ? profile.hobbies.join(", ")
              : "No hobbies added"}
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {profile?.link ? (
              <a href={profile.link} className="text-blue-500 hover:underline">
                {profile.link}
              </a>
            ) : (
              "No link provided"
            )}
          </p>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {profile?.socialMedia ? (
              <span className="text-blue-500">@{profile.socialMedia}</span>
            ) : (
              "No social media handle"
            )}
          </p>

          <button
            onClick={() => setIsEditing(true)} // Toggle edit mode
            className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="px-6 py-4">
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Fullname"
          />
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
          />
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={hobbies.join(", ")}
            onChange={(e) =>
              setHobbies(e.target.value.split(",").map((hobby) => hobby.trim()))
            }
            placeholder="Hobbies"
          />
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Website Link"
          />
          <input
            type="text"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            placeholder="Social Media Handle"
          />

          <button
            onClick={handleProfileUpdate}
            className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 hover:bg-blue-600"
          >
            Save Changes
          </button>

          <button
            onClick={() => setIsEditing(false)} // Exit edit mode
            className="w-full bg-gray-500 text-white py-2 rounded-md mt-4 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default UserProfileCard;
