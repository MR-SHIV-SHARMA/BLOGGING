import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addSavedPost, removeSavedPost } from "../store/postsSlice";
import { toast } from "react-toastify"; // Import toast only
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder"; // Icon for unsaved
import BookmarkIcon from "@mui/icons-material/Bookmark"; // Icon for saved

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function PostCard({
  $id,
  title,
  featuredImage,
  $createdAt,
  $updatedAt,
  name,
  userId,
}) {
  const dispatch = useDispatch();
  const savedPosts = useSelector((state) => state.posts.savedPosts || []); // Ensure correct state path

  const isUpdated = $updatedAt && new Date($updatedAt) > new Date($createdAt);
  const isSaved = savedPosts.some((post) => post.$id === $id); // Check if the post is saved

  const handleSave = (event) => {
    event.preventDefault();
    if (isSaved) {
      dispatch(removeSavedPost($id));
      toast.info("Post removed from saved items.");
    } else {
      const postToSave = {
        $id,
        title,
        featuredImage,
        $createdAt,
        $updatedAt,
        name,
        userId,
      };
      dispatch(addSavedPost(postToSave));
      toast.success("Post saved successfully!");
    }
  };

  return (
    <div className="w-full flex flex-col justify-center rounded-xl p-2 border border-gray-400 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link to={`/post/${$id}`} className="block">
        <div className="w-full flex justify-center mb-4">
          <img
            src={appwriteService.getFilePreview(featuredImage)}
            alt={title}
            className="rounded-xl object-cover w-full"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
          {title}
        </h2>
      </Link>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {isUpdated
              ? `Updated on: ${formatDate($updatedAt)}`
              : `Posted on: ${formatDate($createdAt)}`}
          </p>
          <p className="text-sm text-gray-600">by {name || userId}</p>
        </div>
        <button
          className="text-white px-1 rounded-md flex items-center bg-slate-900"
          onClick={handleSave}
        >
          {isSaved ? (
            <BookmarkIcon style={{ color: "white" }} /> // Filled icon for saved
          ) : (
            <BookmarkBorderIcon style={{ color: "white" }} /> // Outline icon for unsaved
          )}
        </button>
      </div>
    </div>
  );
}

export default PostCard;
