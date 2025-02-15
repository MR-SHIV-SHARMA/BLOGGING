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

  // Fetch profile information using the username
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("No access token found. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:3000/api/v1/user/profile/view/f/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data?.data) {
          setProfile(response.data.data);
        } else {
          setError("Profile data is not available.");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Error fetching profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  // Once profile is loaded, fetch the user's posts using the profile's _id
  useEffect(() => {
    if (!profile || !profile._id) return;
    const token = localStorage.getItem("accessToken");
    setPostsLoading(true);
    console.log("profile publice", profile._id);
    axios
      .get(
        `http://localhost:3000/api/v1/content/posts/user/${profile._id}/posts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data?.data) {
          setPosts(response.data.data);
        } else {
          setPostsError("No posts available.");
        }
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPostsError("Error fetching posts.");
      })
      .finally(() => {
        setPostsLoading(false);
      });
  }, [profile]);

  // Toggle follow/unfollow using the profile's _id
  const toggleFollow = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please log in to follow/unfollow users.");
      return;
    }

    // Retrieve the current logged in user's id; ensure this value is stored when the user logs in.
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      setError("No user ID found. Please log in.");
      return;
    }

    setUpdatingFollow(true);

    // Prepare the payload with both needed IDs.
    const payload = {
      followerId: currentUserId,
      followingId: profile._id,
    };

    // Choose the endpoint based on the current follow state.
    // If profile.isFollowing is true then the user should be able to unfollow.
    // Otherwise, use the follow endpoint.
    const endpoint = profile.isFollowing
      ? `http://localhost:3000/api/v1/interactions/follows/unfollow/${profile._id}`
      : `http://localhost:3000/api/v1/interactions/follows/follow/${profile._id}`;

    axios
      .post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Toggle follow status and update followers count accordingly.
        setProfile((prev) => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing
            ? prev.followersCount - 1
            : prev.followersCount + 1,
        }));
      })
      .catch((err) => {
        console.error("Error updating follow status:", err);

        // The backend might be returning an HTML error page instead of JSON.
        const errorData = err.response?.data;
        let errorMessage = "";

        if (typeof errorData === "string") {
          // If the error data is HTML or plain text, check if it includes "already following"
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }

        if (errorMessage.toLowerCase().includes("already following")) {
          // Even if the user clicked follow when they were already following,
          // update the state so the UI properly shows the Unfollow button.
          setProfile((prev) => ({
            ...prev,
            isFollowing: true,
          }));
        } else {
          setError("Error updating follow status.");
        }
      })
      .finally(() => {
        setUpdatingFollow(false);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
      {/* Cover Image */}
      {profile.coverImage && (
        <div
          className="w-full h-48 bg-cover bg-center rounded-t-lg"
          style={{ backgroundImage: `url(${profile.coverImage})` }}
        ></div>
      )}

      {/* Profile Header */}
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

      {/* User Posts Section */}
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
