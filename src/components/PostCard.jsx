import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

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
  // Determine whether the post has been updated or not
  const isUpdated = $updatedAt && new Date($updatedAt) > new Date($createdAt);

  return (
    <Link to={`/post/${$id}`} className="block">
      {" "}
      {/* Ensures the link covers the entire card */}
      <div className="w-full flex flex-col justify-center rounded-xl p-2 border border-gray-400 shadow-md hover:shadow-lg transition-shadow duration-300 bg-whit">
        {" "}
        {/* Enhanced styles */}
        <div className="w-full flex justify-center mb-4">
          <img
            src={appwriteService.getFilePreview(featuredImage)}
            alt={title}
            className="rounded-xl object-cover w-full" // Maintain aspect ratio
          />
        </div>
        <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
          {title}
        </h2>
        <p className="text-sm text-gray-500">
          {isUpdated
            ? `Updated on: ${formatDate($updatedAt)}`
            : `Posted on: ${formatDate($createdAt)}`}
        </p>
        <p className="text-sm text-gray-600">by {name || userId}</p>{" "}
        {/* Show user name if available, otherwise fallback to userId */}
      </div>
    </Link>
  );
}

export default PostCard;
