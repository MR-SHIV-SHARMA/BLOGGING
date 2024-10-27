import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserProfileForm from "../components/UserProfileForm";
import authService from "../appwrite/auth";
import parse from "html-react-parser";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function UserProfileCard({ profile: initialProfile }) {
  const userData = useSelector((state) => state.auth.userData);
  const posts = useSelector((state) => state.posts.posts);

  // Filter posts created by the logged-in user
  const userPosts = posts.filter(
    (post) => post.userId === (userData && userData.$id)
  );

  const [activeTab, setActiveTab] = useState("Allpost");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    if (userData) {
      authService
        .getCurrentUser()
        .then((user) => {
          setProfile(user);
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }
  }, [userData]);

  const renderPosts = () => {
    // Categorize posts into active and inactive based on a status property
    const activePosts = userPosts.filter((post) => post.status === "active");
    const inactivePosts = userPosts.filter(
      (post) => post.status === "inactive"
    );

    // Determine filtered posts based on the activeTab
    let filteredPosts = userPosts;
    if (activeTab === "Allpost") {
      filteredPosts = [...activePosts, ...inactivePosts];
    } else {
      filteredPosts = activeTab === "activePosts" ? activePosts : inactivePosts;
    }

    if (!filteredPosts || filteredPosts.length === 0) {
      return <p className="text-center text-gray-500">No posts available</p>;
    }

    return (
      <div className="flex flex-wrap justify-center sm:px-4">
        {filteredPosts.map((post, index) => {
          const isUpdated =
            post.$updatedAt &&
            new Date(post.$updatedAt) > new Date(post.$createdAt);
          return (
            <div
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 mb-4 mx-2 border border-gray-300 h-96"
              key={post.$id}
            >
              <Link to={`/post/${post.$id}`} className="text-gray-900">
                <img
                  src={appwriteService.getFilePreview(post.featuredImage)}
                  alt={post.title}
                  className="w-full h-64 object-cover "
                />
                <h5 className="mt-2 px-2 text-2xl font-bold text-black overflow-hidden">
                  {parse(
                    post.title.length > 30
                      ? post.title.substring(0, 30) + "..."
                      : post.title
                  )}
                </h5>
              </Link>
              <p className="text-gray-600 text-sm mt-1 px-2">
                {isUpdated
                  ? `Updated on: ${formatDate(post.$updatedAt)}`
                  : `Posted on: ${formatDate(post.$createdAt)}`}
              </p>
              <p className="text-gray-600 text-sm px-2">
                Author:{" "}
                <span className="font-semibold">
                  {userData ? userData.name : "Unknown"}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-200 to-purple-200 py- shadow-lg w-full mx-auto border pt-8 border-gray-200 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gray-400 text-sm px-4 py-2 rounded-md"
        >
          Edit Profile
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-3/4 max-w-md p-6 rounded-lg shadow-lg relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              Close
            </button>
            <UserProfileForm profile={profile} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-20">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="https://images.pexels.com/photos/18091667/pexels-photo-18091667/free-photo-of-istanbul-istinye.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
            alt="Profile"
            className="w-72 h-72 rounded-full object-cover border-4"
          />
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-center">
              {profile?.name.toUpperCase()}
            </h2>
            <p>
              <span className="font-semibold text-center">
                Location: {profile?.location}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-around w-full mt-4 space-x-4 text-center">
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold">{userPosts.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold">{profile?.followers || 0}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold">{profile?.following || 0}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>

          <div className="text-left w-full items-start mt-4 space-y-1 sm:text-left sm:items-start">
            <p>
              <span className="font-semibold">Profession:</span>{" "}
              {profile?.profession}
            </p>
            <p>
              <span className="font-semibold">Interests:</span>{" "}
              {profile?.interest}
            </p>
            <p>
              <span className="font-semibold">Gmail:</span> {profile?.email}
            </p>
            <p>
              <span className="font-semibold">Twitter:</span> {profile?.twitter}
            </p>
            <p>
              <span className="font-semibold">LinkedIn:</span>{" "}
              {profile?.linkedin}
            </p>
            <p>
              <span className="font-semibold">Joined:</span>{" "}
              {profile?.createdAt}
            </p>
            <p>
              <span className="font-semibold">Bio:</span> {profile?.bio}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-500">
        <div className="flex justify-around mt-4">
          <button
            onClick={() => setActiveTab("Allpost")}
            className={`text-sm px-4 py-2 rounded-md ${
              activeTab === "Allpost"
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-gray-900"
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab("activePosts")}
            className={`text-sm px-4 py-2 rounded-md ${
              activeTab === "activePosts"
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-gray-900"
            }`}
          >
            Active Posts
          </button>
          <button
            onClick={() => setActiveTab("inactivePosts")}
            className={`text-sm px-4 py-2 rounded-md ${
              activeTab === "inactivePosts"
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-gray-900"
            }`}
          >
            Inactive Posts
          </button>
        </div>
        <div className="mt-4">{renderPosts()}</div>
      </div>
    </div>
  );
}

export default UserProfileCard;
