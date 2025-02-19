import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function PublicUserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const [updatingFollow, setUpdatingFollow] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`/user/profile/view/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = response.data?.data;
        if (profileData && Object.keys(profileData).length > 0) {
          setData(profileData);
        } else {
          toast.info("Profile not created yet. Please update your profile.");
          setData({});
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message?.toLowerCase() || err.message || "";
        if (
          err.response?.status === 404 ||
          errMsg.includes("not found") ||
          errMsg.includes("no profile")
        ) {
          toast.info("Profile not created yet. Please update your profile.");
          setData({});
        } else {
          console.error("Error fetching profile data:", err);
          // Optionally, comment the next line out if you don't want the error toast.
          // toast.error("Error fetching profile data.");
        }
      }
    }
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/user/profile/view/f/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.data) {
          setProfile(response.data.data);
        } else {
          setError("Profile data is not available.");
        }
      } catch (err) {
        setError("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!profile?._id) return;

    async function fetchPosts() {
      const token = localStorage.getItem("accessToken");
      setPostsLoading(true);
      try {
        const response = await axios.get(
          `/content/posts/user/${profile._id}/posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.data) {
          setPosts(response.data.data);
        } else {
          setPostsError("No posts available.");
        }
      } catch (err) {
        setPostsError("Error fetching posts.");
      } finally {
        setPostsLoading(false);
      }
    }
    fetchPosts();
  }, [profile?._id]);

  const updateFollowState = async () => {
    const token = localStorage.getItem("accessToken");
    if (!profile?._id) return;

    try {
      const response = await axios.get(
        `/interactions/follows/followers/${profile._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data) {
        const followersArray = response.data.data;
        const newCount = followersArray.length;
        const currentUserId = localStorage.getItem("userId");

        const isFollowed = followersArray.some((item) => {
          if (typeof item === "string") {
            return item === currentUserId;
          }
          if (item.follower && (item.follower._id || item.follower.id)) {
            return (
              String(item.follower._id || item.follower.id) ===
              String(currentUserId)
            );
          }
          if (item.followerId) {
            return String(item.followerId) === String(currentUserId);
          }
          return false;
        });

        setProfile((prevProfile) => ({
          ...prevProfile,
          followersCount: newCount,
          isFollowing: isFollowed,
        }));
      }
    } catch (err) {
      setError("Error updating follow state.");
    }
  };

  useEffect(() => {
    if (profile?._id) {
      updateFollowState();
    }
  }, [profile?._id]);

  useEffect(() => {
    if (!profile?._id) return;
    const token = localStorage.getItem("accessToken");
    async function fetchFollowing() {
      try {
        const response = await axios.get(
          `/interactions/follows/following/${profile._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.data) {
          const newCount = response.data.data.length;
          if (profile.followingCount !== newCount) {
            setProfile((prevProfile) => ({
              ...prevProfile,
              followingCount: newCount,
            }));
          }
        }
      } catch (err) {
        setError("Error fetching following count.");
      }
    }
    fetchFollowing();
  }, [profile?._id]);

  const toggleFollow = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please log in to follow/unfollow users.");
      return;
    }

    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setError("No user ID found. Please log in.");
      return;
    }

    setUpdatingFollow(true);
    const payload = {
      followerId: currentUserId,
      followingId: profile._id,
    };

    try {
      if (profile.isFollowing) {
        await axios.post(
          `/interactions/follows/unfollow/${profile._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `/interactions/follows/follow/${profile._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "";
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
      setError(errorMessage || "Error updating follow status.");
    } finally {
      await updateFollowState();
      setUpdatingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="px-4 py-2 bg-red-500 text-white rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-8 bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
      {data?.coverImage && (
        <div className="relative h-48 md:h-64">
          <img
            src={data.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}

      <div className="p-6">
        <div className="relative flex flex-col md:flex-row items-center md:items-start">
          <div className="absolute -top-20 md:-top-24">
            {data?.avatar ? (
              <img
                src={data.avatar}
                alt={`${data.name}'s avatar`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 flex justify-center items-center text-2xl text-white">
                {data?.name ? data.name.charAt(0) : "U"}
              </div>
            )}
          </div>
          <div className="mt-20 md:mt-0 md:ml-40 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.name || data?.username || "User"}
            </h1>
            <p className="text-gray-600 mt-1">Email: {profile?.email}</p>
            <div className="flex space-x-6 mt-2 justify-center md:justify-start">
              <p className="text-gray-700">
                <strong>Followers:</strong> {profile?.followersCount || 0}
              </p>
              <p className="text-gray-700">
                <strong>Following:</strong> {profile?.followingCount || 0}
              </p>
            </div>
          </div>
          <button
            onClick={toggleFollow}
            disabled={updatingFollow}
            className="mt-4 md:mt-0 md:ml-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {updatingFollow
              ? "Processing..."
              : profile?.isFollowing
              ? "Unfollow"
              : "Follow"}
          </button>
        </div>

        <div className="mt-20 border-t border-gray-200 pt-6">
          <div className="mb-6">
            {data?.bio && (
              <p className="text-gray-700">
                <span className="font-semibold">Bio:</span> {data.bio}
              </p>
            )}
            {data?.fullname && (
              <p className="text-gray-700">
                <span className="font-semibold">Full Name:</span>{" "}
                {data.fullname}
              </p>
            )}
            {data?.hobbies && (
              <p className="text-gray-700">
                <span className="font-semibold">Hobbies:</span> {data.hobbies}
              </p>
            )}
            {data?.location && (
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {data.location}
              </p>
            )}
            {data?.socialMedia && (
              <p className="text-gray-700">
                <span className="font-semibold">Social Media:</span>{" "}
                {data.socialMedia}
              </p>
            )}
            {data?.link && (
              <p className="text-gray-700">
                <span className="font-semibold">Link:</span> {data.link}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              User Posts ({posts.length})
            </h2>
            {postsLoading ? (
              <p className="text-center text-gray-600">Loading posts...</p>
            ) : postsError ? (
              <p className="text-center text-red-500">{postsError}</p>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white/80 backdrop-blur-lg p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    {post.media && (
                      <img
                        src={post.media}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <h3 className="text-lg font-bold mt-2">{post.title}</h3>
                    <p className="text-gray-600 mt-1">
                      {post.content && post.content.length > 100
                        ? `${post.content.slice(0, 100)}...`
                        : post.content}
                    </p>
                    <div className="text-sm text-gray-500 mt-2">
                      {post.categories?.length > 0 && (
                        <p>
                          <strong>Categories:</strong>{" "}
                          {post.categories.map((cat) => cat.name).join(", ")}
                        </p>
                      )}
                      {post.tags?.length > 0 && (
                        <p>
                          <strong>Tags:</strong>{" "}
                          {post.tags.map((tag) => tag.name).join(", ")}
                        </p>
                      )}
                      <p>
                        <strong>Likes:</strong> {post.likes?.length || 0} |{" "}
                        <strong>Comments:</strong> {post.comments?.length || 0}
                      </p>
                    </div>
                    <a
                      href={`/post/${post._id}`}
                      className="inline-block mt-2 text-blue-600 hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No posts available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicUserProfile;
