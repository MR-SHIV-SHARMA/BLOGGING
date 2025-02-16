import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

function UserProfileCard() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [link, setLink] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmarkName, setNewBookmarkName] = useState("");
  const [selectedBookmarkId, setSelectedBookmarkId] = useState("");

  // NEW: State for editing a post and updating its media file
  const [editingPost, setEditingPost] = useState(null);
  const [editingMediaFile, setEditingMediaFile] = useState(null);

  // NEW: State for followers and following counts, separately maintained.
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const avatarInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    axios
      .get("https://bg-io.vercel.app/api/v1/user/profile/view", {
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

  // NEW: Fetch both followers and following counts using Promise.all once profile is available.
  useEffect(() => {
    if (!profile?._id) return;
    console.log("profile " + profile?._id);
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    async function fetchFollowCounts() {
      try {
        const [followersResponse, followingResponse] = await Promise.all([
          axios.get(
            `https://bg-io.vercel.app/api/v1/interactions/follows/followers/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://bg-io.vercel.app/api/v1/interactions/follows/following/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setFollowersCount(followersResponse.data?.data?.length || 0);
        setFollowingCount(followingResponse.data?.data?.length || 0);
        console.log("followersCount " + followersCount);
        console.log("followingCount " + followingCount);
      } catch (err) {
        console.error("Error fetching follow counts: ", err);
      }
    }
    fetchFollowCounts();
  }, [profile?._id]);

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
      .patch("https://bg-io.vercel.app/api/v1/user/profile/media", updateData, {
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
    if (!avatarFile) return;

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
    if (!coverImageFile) return;

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    setIsLoadingPosts(true);
    const token = localStorage.getItem("accessToken");
    axios
      .get("https://bg-io.vercel.app/api/v1/content/posts/user/posts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserPosts(response.data.data || []);
      })
      .catch(() => toast.error("Error fetching user posts"))
      .finally(() => setIsLoadingPosts(false));
  }, []);

  const createBookmark = async () => {
    const token = localStorage.getItem("accessToken");
    if (!newBookmarkName) return;

    try {
      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/interactions/bookmarks/",
        { name: newBookmarkName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Bookmark created successfully!");
        fetchBookmarks();
      } else {
        toast.error(response.data.message || "Failed to create bookmark");
      }
    } catch {
      toast.error("Error creating bookmark");
    }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get(
        "https://bg-io.vercel.app/api/v1/interactions/bookmarks/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setBookmarks(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch bookmarks");
      }
    } catch {
      toast.error("Error fetching bookmarks");
    }
  };

  const addPostToBookmark = async (bookmarkId, postId) => {
    const token = localStorage.getItem("accessToken");
    if (!bookmarkId || !postId) {
      toast.error("Please select a bookmark and a post.");
      return;
    }

    try {
      const response = await axios.post(
        `https://bg-io.vercel.app/api/v1/interactions/bookmarks/${bookmarkId}/posts`,
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post added to bookmark successfully!");
      } else {
        toast.error(response.data.message || "Failed to add post to bookmark");
      }
    } catch (error) {
      console.error("Error adding post to bookmark:", error);
      toast.error("Error adding post to bookmark");
    }
  };

  const deletePostFromBookmark = async (bookmarkId, postId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.delete(
        `https://bg-io.vercel.app/api/v1/interactions/bookmarks/${bookmarkId}/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Post removed from bookmark successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to remove post from bookmark"
        );
      }
    } catch {
      toast.error("Error removing post from bookmark");
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    const token = localStorage.getItem("accessToken");
    const postId = deleteBookmark;
    if (!postId) return;

    try {
      const response = await axios.delete(
        `https://bg-io.vercel.app/api/v1/interactions/bookmarks/${bookmarkId}`,
        {
          data: { postId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Post removed from bookmark successfully!");
        fetchBookmarks();
      } else {
        toast.error(
          response.data.message || "Failed to remove post from bookmark"
        );
      }
    } catch {
      toast.error("Error removing post from bookmark");
    }
  };

  const deletePost = async (postId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.delete(
        `https://bg-io.vercel.app/api/v1/content/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Post deleted successfully!");
        await fetchUserPosts();
      } else {
        toast.error(response.data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting post");
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem("accessToken");
    setIsLoadingPosts(true);
    try {
      const response = await axios.get(
        "https://bg-io.vercel.app/api/v1/content/posts/user/posts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setUserPosts(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Error fetching user posts");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // NEW: Updated editPost to open the editing modal with the full post object
  // and reset the editing media file state.
  const editPost = (post) => {
    setEditingPost(post);
    setEditingMediaFile(null);
  };

  // NEW: Function to update the post using PATCH and sending a file for media.
  const updatePost = async () => {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("title", editingPost.title);
    formData.append("content", editingPost.content);
    if (editingMediaFile) {
      formData.append("media", editingMediaFile);
    }

    try {
      const response = await axios.patch(
        `https://bg-io.vercel.app/api/v1/content/posts/${editingPost._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Post updated successfully!");
        fetchUserPosts();
        setEditingPost(null); // close the modal
        setEditingMediaFile(null);
      } else {
        toast.error(response.data.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Error updating post");
    }
  };

  return (
    <div className="max-w-8xl mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden relative p-4 sm:p-6 md:p-8">
      {/* Cover Image Section */}
      <div className="h-60 sm:h-72 md:h-80 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative rounded-lg overflow-hidden">
        {profile?.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-90"
          />
        )}

        <div
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer z-50"
          style={{ pointerEvents: "auto" }}
        >
          <input
            type="file"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            className="hidden"
          />
          <button
            onClick={() => coverImageInputRef.current.click()}
            className="text-indigo-600 hover:text-indigo-800"
          >
            📷
          </button>
        </div>
      </div>

      {/* Profile Image Section */}
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
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current.click()}
              className="text-indigo-600 hover:text-indigo-800"
            >
              📷
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-gray-900">
          {profile?.username}
        </h2>
        {/* Displaying the fetched counts for followers and following */}
        <div className="flex justify-center gap-4">
          <h1>Followers: {followersCount}</h1>
          <h1>Following: {followingCount}</h1>
        </div>
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
        </div>
      )}

      {/* File Update Buttons */}
      {avatarFile && (
        <button
          onClick={uploadAvatar}
          className="w-full bg-green-500 text-white py-2 rounded-md mt-4 hover:bg-green-600"
        >
          Save Avatar
        </button>
      )}
      {coverImageFile && (
        <button
          onClick={uploadCoverImage}
          className="w-full bg-green-500 text-white py-2 rounded-md mt-4 hover:bg-green-600"
        >
          Save Cover Image
        </button>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-2 px-4 rounded-lg ${
            activeTab === "posts" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          User Posts
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`py-2 px-4 rounded-lg ${
            activeTab === "bookmarks" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Posts</h2>
          {isLoadingPosts ? (
            <p className="text-gray-500 text-center">Loading posts...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 transition transform hover:scale-105 hover:shadow-xl flex flex-col justify-between"
                  >
                    <Link to={`/post/${post._id}`} className="block">
                      <div className="p-5">
                        {post.media && (
                          <div className="mb-4 w-full h-48 overflow-hidden rounded-lg">
                            <img
                              src={post.media}
                              alt="media"
                              className="w-full h-full object-cover transition duration-300 hover:opacity-80"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </Link>

                    <div className="p-5 border-t border-gray-200">
                      <div className="flex items-center justify-between text-gray-600 text-sm">
                        <span>❤️ {post.likes.length}</span>
                        <span>💬 {post.comments.length}</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => editPost(post)} // Open modal to edit post
                          title="Edit Post"
                          className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition flex items-center justify-center"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => deletePost(post._id)}
                          title="Delete Post"
                          className="w-full bg-red-500 text-white rounded-md py-2 hover:bg-red-600 transition flex items-center justify-center"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center">
                  No posts available
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Bookmarks</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              placeholder="Enter bookmark name"
              className="border rounded-md px-4 py-2 mr-2 flex-grow"
            />
            <button
              onClick={createBookmark}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Create Bookmark
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookmarks.length > 0 ? (
              bookmarks.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="p-4 bg-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                  <h3 className="font-bold text-lg mb-2">
                    {bookmark.name || "Untitled Bookmark"}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => deleteBookmark(bookmark._id)}
                      className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                    >
                      Delete Bookmark
                    </button>
                  </div>
                  <ul className="list-disc pl-5">
                    {bookmark.posts.map((post) => (
                      <li
                        key={post._id}
                        className="flex flex-col bg-gray-50 p-3 rounded-lg shadow-sm mb-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{post.title}</span>
                          <button
                            onClick={() =>
                              deletePostFromBookmark(bookmark._id, post._id)
                            }
                            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-gray-700 mb-2 line-clamp-2">
                          {post.content}
                        </p>

                        {post.media && (
                          <div className="w-full h-48 overflow-hidden rounded-lg mb-2">
                            <img
                              src={post.media}
                              alt="media"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                No bookmarks available
              </p>
            )}
          </div>
        </div>
      )}

      {/* NEW: Editing Modal for updating a post */}
      {editingPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, title: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Content</label>
              <textarea
                value={editingPost.content}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, content: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Media File</label>
              <input
                type="file"
                onChange={(e) => setEditingMediaFile(e.target.files[0])}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingPost(null);
                  setEditingMediaFile(null);
                }}
                className="mr-4 bg-gray-500 text-white py-1 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updatePost}
                className="bg-blue-500 text-white py-1 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default UserProfileCard;
