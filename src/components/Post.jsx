import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://bg-io.vercel.app/api/v1/content/posts/${slug}`
        );

        if (response?.data?.success) {
          setPost(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [slug]);

  return post ? (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      {/* Image */}
      {post.media && (
        <div className="overflow-hidden rounded-md">
          <img
            src={post.media}
            alt="Post media"
            className="w-full h-64 object-cover rounded-md"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">
        {post.title}
      </h1>

      {/* Content */}
      <div className="mt-4 text-gray-700 leading-relaxed">{post.content}</div>

      {/* Categories & Tags */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
        <p>
          <strong className="text-gray-800">Categories:</strong>{" "}
          {post.categories.length ? (
            <span className="text-blue-600">
              {post.categories.map((cat) => cat.name).join(", ")}
            </span>
          ) : (
            "None"
          )}
        </p>
        <p className="mt-1">
          <strong className="text-gray-800">Tags:</strong>{" "}
          {post.tags.length ? (
            <span className="text-green-600">
              {post.tags.map((tag) => tag.name).join(", ")}
            </span>
          ) : (
            "None"
          )}
        </p>
      </div>

      {/* Likes, Comments, Date */}
      <div className="flex flex-wrap items-center justify-between mt-4 text-gray-600 text-sm border-t pt-3">
        <span className="flex items-center gap-1">
          👍 <span>{post.likes.length}</span> Likes
        </span>
        <span className="flex items-center gap-1">
          💬 <span>{post.comments.length}</span> Comments
        </span>
        <span className="flex items-center gap-1">
          🕒 {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Display comments for each post */}
      {post.comments.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <h3 className="text-sm font-semibold text-gray-800">Comments:</h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="text-sm text-gray-700 mt-2">
              {/* Check if comment.user exists, otherwise fallback to "Anonymous" */}
              <strong>{comment.user?.name || "Anonymous"}:</strong>{" "}
              {comment.content}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-40 text-gray-500 text-lg">
      Loading post...
    </div>
  );
}

export default PostDetail;
