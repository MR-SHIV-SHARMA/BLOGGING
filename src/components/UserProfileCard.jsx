import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSavedPost, removeSavedPost } from "../store/postsSlice";
import UserProfileForm from "../components/UserProfileForm";
import authService from "../appwrite/auth";
import parse from "html-react-parser";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder"; // Icon for unsaved
import BookmarkIcon from "@mui/icons-material/Bookmark"; // Icon for saved

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function UserProfileCard(
  { profile: initialProfile },
  { $id, title, featuredImage, $createdAt, $updatedAt, name, userId }
) {
  const dispatch = useDispatch();
  const savedPosts = useSelector((state) => state.posts.savedPosts || []); // Ensure correct state path

  const isUpdated = $updatedAt && new Date($updatedAt) > new Date($createdAt);
  const isSaved = savedPosts.some((post) => post.$id === $id); // Check if the post is saved

  const handleSave = (event, post) => {
    event.preventDefault();
    const isSaved = savedPosts.some((savedPost) => savedPost.$id === post.$id); // Check if the specific post is saved
    if (isSaved) {
      dispatch(removeSavedPost(post.$id));
      toast.info("Post removed from saved items.");
    } else {
      const postToSave = {
        $id: post.$id,
        title: post.title,
        featuredImage: post.featuredImage,
        $createdAt: post.$createdAt,
        $updatedAt: post.$updatedAt,
        name: post.name,
        userId: post.userId,
      };
      dispatch(addSavedPost(postToSave));
      toast.success("Post saved successfully!");
    }
  };

  const userData = useSelector((state) => state.auth.userData);
  const posts = useSelector((state) => state.posts.posts);
  // const savedPosts = useSelector((state) => state.posts.savedPosts);

  const userPosts = posts.filter(
    (post) => post.userId === (userData && userData.$id)
  );

  const [activeTab, setActiveTab] = useState("Allpost");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [mutualFollow, setMutualFollow] = useState(false);

  useEffect(() => {
    if (userData) {
      authService
        .getCurrentUser()
        .then((user) => {
          setProfile(user);
          checkFollowStatus();
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }
  }, [userData]);
  const checkFollowStatus = () => {
    const following = profile?.followers?.includes(userData.$id);
    const mutual = following && userData.followers.includes(profile.$id);
    setIsFollowing(following);
    setMutualFollow(mutual);
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      dispatch(unfollowUser(profile.$id));
    } else {
      dispatch(followUser(profile.$id));
    }
    setIsFollowing(!isFollowing);
    setMutualFollow(false);
  };

  const renderFollowButton = () => (
    <button
      onClick={handleFollowToggle}
      className={`px-4 py-2 text-sm rounded-md ${
        isFollowing ? "bg-green-500 text-white" : "bg-blue-500 text-white"
      }`}
    >
      {isFollowing ? (mutualFollow ? "Follow Back" : "Following") : "Follow"}
    </button>
  );

  const renderPosts = () => {
    const activePosts = userPosts.filter((post) => post.status === "active");
    const inactivePosts = userPosts.filter(
      (post) => post.status === "inactive"
    );

    let filteredPosts = userPosts;
    if (activeTab === "Allpost") {
      filteredPosts = [...activePosts, ...inactivePosts];
    } else if (activeTab === "activePosts") {
      filteredPosts = activePosts;
    } else {
      filteredPosts = inactivePosts;
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
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 mb-4 mx-2 border border-gray-500 h-96"
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

  const renderSavedPosts = () => {
    if (!savedPosts || savedPosts.length === 0) {
      return (
        <p className="text-center text-gray-500">No saved posts available</p>
      );
    }

    return (
      <div className="flex flex-wrap justify-center sm:px-4">
        <ToastContainer /> {/* Place ToastContainer here */}
        {savedPosts.map((post, index) => {
          // Check if featuredImage is valid before using it
          const imagePreview = post.featuredImage
            ? appwriteService.getFilePreview(post.featuredImage)
            : null;
          return (
            <div
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 mb-4 mx-2 border border-gray-500 h-96"
              key={post.$id}
            >
              <Link to={`/post/${post.$id}`} className="text-gray-900">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={post.title}
                    className="w-full h-64 object-cover "
                  />
                )}
                <h5 className="mt-2 px-2 text-2xl font-bold text-black overflow-hidden">
                  {post.title && post.title.length > 0
                    ? parse(
                        post.title.length > 30
                          ? post.title.substring(0, 30) + "..."
                          : post.title
                      )
                    : "Untitled"}
                </h5>
              </Link>
              <div className="flex justify-between px-2">
                <div>
                  <p className="text-sm text-gray-500">
                    {isUpdated
                      ? `Updated on: ${formatDate(post.$updatedAt)}` // post.$updatedAt ko use kiya
                      : `Posted on: ${formatDate(post.$createdAt)}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {post.name || post.userId}
                  </p>
                </div>
                <button
                  className="text-white px-2 rounded-md flex items-center bg-slate-900"
                  onClick={(event) => handleSave(event, post)} // Pass the specific post
                  // style={{
                  //   backgroundColor: isSaved ? "green" : "blue",
                  // }}
                >
                  {isSaved ? (
                    <BookmarkBorderIcon style={{ color: "white" }} /> // Outline icon for unsaved
                  ) : (
                    <BookmarkIcon style={{ color: "white" }} /> // Filled icon for saved
                  )}
                  {/* <span>{isSaved ? "Save" : "Saved"}</span> */}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-200 to-purple-200 py- shadow-lg w-full mx-auto border pt-8 border-gray-200 relative">
      <div className="absolute top-4 right-4">
        <button className="pr-4">{renderFollowButton()}</button>
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
          <button
            onClick={() => setActiveTab("savedPosts")}
            className={`text-sm px-4 py-2 rounded-md ${
              activeTab === "savedPosts"
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-gray-900"
            }`}
          >
            Saved Posts
          </button>
        </div>
        <div className="mt-4">
          {activeTab === "savedPosts" ? renderSavedPosts() : renderPosts()}
        </div>
      </div>
    </div>
  );
}

export default UserProfileCard;
