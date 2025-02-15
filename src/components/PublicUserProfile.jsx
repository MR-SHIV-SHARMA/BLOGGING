import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PublicUserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const [updatingFollow, setUpdatingFollow] = useState(false);

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
          `https://bg-io.vercel.app/api/v1/user/profile/view/f/${username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.data) {
          setProfile(response.data.data);
        } else {
          setError("Profile data is not available.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

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
          console.log("Fetched posts:", response.data.data);
        } else {
          setPostsError("No posts available.");
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
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
        const isFollowed = followersArray.some((follower) => {
          if (typeof follower === "string") return follower === currentUserId;
          return String(follower._id) === String(currentUserId);
        });

        setProfile((prevProfile) => ({
          ...prevProfile,
          followersCount: newCount,
          isFollowing: isFollowed,
        }));
      }
      console.log("Updated follow state.");
    } catch (err) {
      console.error("Error updating follow state:", err);
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
        console.log("Following count:", response.data?.data.length);
      } catch (err) {
        console.error("Error fetching following:", err);
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
    const endpoint = profile.isFollowing
      ? `https://bg-io.vercel.app/api/v1/interactions/follows/unfollow/${profile._id}`
      : `https://bg-io.vercel.app/api/v1/interactions/follows/follow/${profile._id}`;

    try {
      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateFollowState();
    } catch (err) {
      console.error("Error updating follow status:", err);
      const errorData = err.response?.data;
      let errorMessage = "";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      if (errorMessage.toLowerCase().includes("already following")) {
        updateFollowState();
      } else {
        setError("Error updating follow status.");
      }
    } finally {
      setUpdatingFollow(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
      {profile.coverImage && (
        <div
          className="w-full h-48 bg-cover bg-center rounded-t-lg"
          style={{ backgroundImage: `url(${profile.coverImage})` }}
        ></div>
      )}

      <div className="flex items-center space-x-6 p-6">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={`${username}'s avatar`}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.name || username}
          </h1>
          <p className="text-gray-600">Email: {profile.email}</p>
          <div className="flex space-x-4 text-gray-700 mt-2">
            <p>Followers: {profile.followersCount || 0}</p>
            <p>Following: {profile.followingCount || 0}</p>
          </div>
        </div>
        <button
          onClick={toggleFollow}
          disabled={updatingFollow}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
        >
          {profile.isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          User Posts
        </h2>
        {postsLoading ? (
          <p className="text-center text-gray-600 mt-4">Loading posts...</p>
        ) : postsError ? (
          <p className="text-center text-red-500 mt-4">{postsError}</p>
        ) : posts.length > 0 ? (
          <ul className="space-y-6 mt-4">
            {posts.map((post) => (
              <li
                key={post._id}
                className="bg-gray-50 p-4 rounded-lg shadow-md"
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 mt-4">No posts available.</p>
        )}
      </div>
    </div>
  );
}

export default PublicUserProfile;
