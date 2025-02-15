import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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
        const response = await axios.get(
          `https://bg-io.vercel.app/api/v1/user/profile/view/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.data) {
          setData(response.data.data);
        }
      } catch (err) {
        setError("Error fetching profile data.");
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
        const response = await axios.get(
          `https://bg-io.vercel.app/api/v1/user/profile/view/f/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
          `https://bg-io.vercel.app/api/v1/content/posts/user/${profile._id}/posts`,
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
        `https://bg-io.vercel.app/api/v1/interactions/follows/followers/${profile._id}`,
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
          `https://bg-io.vercel.app/api/v1/interactions/follows/following/${profile._id}`,
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
          `https://bg-io.vercel.app/api/v1/interactions/follows/unfollow/${profile._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `https://bg-io.vercel.app/api/v1/interactions/follows/follow/${profile._id}`,
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
    <div className="max-w-4xl mx-auto my-8 bg-white shadow-lg rounded-lg overflow-hidden">
      {data?.coverImage && (
        <div className="relative">
          <img
            src={data.coverImage}
            alt="Cover"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-25"></div>
        </div>
      )}

      <div className="p-6">
        <div className="relative flex items-center">
          <div className="absolute -top-16">
            {data?.avatar ? (
              <img
                src={data.avatar}
                alt={`${data.name}'s avatar`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex justify-center items-center text-2xl text-white">
                {data?.name ? data.name.charAt(0) : "U"}
              </div>
            )}
          </div>
          <div className="ml-40">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.name || data?.username || "User"}
            </h1>
            <p className="text-gray-600 mt-1">Email: {profile?.email}</p>
            <div className="flex space-x-6 mt-2">
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
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {updatingFollow
              ? "Processing..."
              : profile?.isFollowing
              ? "Unfollow"
              : "Follow"}
          </button>
        </div>

        <div className="mt-20 border-t pt-6">
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
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              User Posts ({posts.length})
            </h2>
            {postsLoading ? (
              <p className="text-center text-gray-600">Loading posts...</p>
            ) : postsError ? (
              <p className="text-center text-red-500">{postsError}</p>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
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
