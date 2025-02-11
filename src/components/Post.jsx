import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaBookmark, FaArrowUp } from 'react-icons/fa';

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/content/posts/${slug}`
        );

        if (response?.data?.success) {
          setPost(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchBookmarks = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("http://localhost:3000/api/v1/interactions/bookmarks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setBookmarks(response.data.data || []);
        } else {
          toast.error(response.data.message || "Failed to fetch bookmarks");
        }
      } catch {
        toast.error("Error fetching bookmarks");
      }
    };

    const fetchPostData = async () => {
      await fetchPost();
      await fetchLikesCount(post._id);
      await fetchComments();
    };

    fetchPostData();
    fetchBookmarks();
  }, [slug]);

  const isPostAlreadyBookmarked = (bookmarkId) => {
    return post.bookmarks && post.bookmarks.includes(bookmarkId);
  };

  const addPostToBookmark = async (bookmarkId, postId) => {
    const token = localStorage.getItem("accessToken");
    if (!bookmarkId || !postId) {
      toast.error("Please select a bookmark and a post.");
      return;
    }

    console.log("Adding post to bookmark:", { bookmarkId, postId });

    if (isPostAlreadyBookmarked(bookmarkId)) {
      toast.error("This post is already bookmarked in the selected bookmark.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/interactions/bookmarks/${bookmarkId}/posts`,
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post added to bookmark successfully!");
        setPost((prevPost) => ({
          ...prevPost,
          bookmarks: [...(prevPost.bookmarks || []), bookmarkId],
        }));
      } else {
        toast.error(response.data.message || "Failed to add post to bookmark");
      }
    } catch (error) {
      console.error("Error adding post to bookmark:", error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || "Error adding post to bookmark";
        toast.error(errorMessage);
      } else {
        toast.error("Error adding post to bookmark");
      }
    }
  };

  const handleBookmarkClick = () => {
    if (selectedBookmark) {
      addPostToBookmark(selectedBookmark, post._id);
      setSelectedBookmark(null);
      setShowBookmarks(false);
    } else {
      toast.error("Please select a bookmark first.");
    }
  };

  const toggleBookmarksDropdown = () => {
    setShowBookmarks(!showBookmarks);
  };

  const isPostBookmarked = (bookmarkId) => {
    return post.bookmarks && post.bookmarks.includes(bookmarkId);
  };

  const likePost = async (postId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/interactions/likes/post/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post liked successfully!");
        setPost((prevPost) => ({
          ...prevPost,
          likes: [...(prevPost.likes || []), token],
        }));
      } else {
        toast.error(response.data.message || "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Error liking post");
    }
  };

  const deleteLike = async (postId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/interactions/likes/post/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Like removed successfully!");
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes.filter((like) => like !== token),
        }));
      } else {
        toast.error(response.data.message || "Failed to remove like");
      }
    } catch (error) {
      console.error("Error removing like:", error);
      toast.error("Error removing like");
    }
  };

  const fetchLikesCount = async (postId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/interactions/likes/post/${postId}`
      );

      if (response.data.success) {
        const likesCount = response.data.data.likesCount;
        setPost((prevPost) => ({
          ...prevPost,
          likes: likesCount,
        }));
      } else {
        toast.error(response.data.message || "Failed to fetch likes count");
      }
    } catch (error) {
      console.error("Error fetching likes count:", error);
      toast.error("Error fetching likes count");
    }
  };

  const toggleLikePost = async (postId) => {
    if (isLiked) {
      await deleteLike(postId);
    } else {
      await likePost(postId);
    }
    setIsLiked(!isLiked);
  };

  const fetchComments = async () => {
    if (!post) return;
    console.log("Fetching comments for post ID:", post._id);
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/content/comments/post/comments/${post._id}`);
      if (response.data.success) {
        console.log("Comments fetched successfully:", response.data.data.comments);
        setComments(response.data.data.comments);
      } else {
        toast.error(response.data.message || "Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Error fetching comments");
    }
  };

  const addComment = async () => {
    console.log("Adding comment:", newComment);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/content/comments/post/${post._id}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment added successfully!");
        setNewComment("");
        fetchComments();
      } else {
        toast.error(response.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    }
  };

  const updateComment = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/content/comments/${commentId}`,
        { content: editingCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment updated successfully!");
        setEditingCommentId(null);
        setEditingCommentText("");
        fetchComments();
      } else {
        toast.error(response.data.message || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Error updating comment");
    }
  };

  const deleteComment = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/content/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment deleted successfully!");
        fetchComments();
      } else {
        toast.error(response.data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error deleting comment");
    }
  };

  const likeComment = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/interactions/likes/comment/${commentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Comment liked successfully!");
        fetchComments(); // Refresh comments to update likes count
      } else {
        toast.error(response.data.message || "Failed to like comment");
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Error liking comment");
    }
  };

  const unlikeComment = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/v1/interactions/likes/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Comment unliked successfully!");
        fetchComments(); // Refresh comments to update likes count
      } else {
        toast.error(response.data.message || "Failed to unlike comment");
      }
    } catch (error) {
      console.error("Error unliking comment:", error);
      toast.error("Error unliking comment");
    }
  };

  const toggleLikeComment = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    if (likedComments[commentId]) {
      await unlikeComment(commentId);
      setLikedComments((prev) => ({ ...prev, [commentId]: false }));
    } else {
      await likeComment(commentId);
      setLikedComments((prev) => ({ ...prev, [commentId]: true }));
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
    if (!showComments) {
      fetchComments(); // Fetch comments when opening the comments section
    }
  };

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
          <button onClick={() => toggleLikePost(post._id)} className="flex items-center">
            {isLiked ? (
              <span>❤️</span>
            ) : (
              <span>🤍</span>
            )}
            <span>{post.likes.length}</span> Likes
          </button>
        </span>
        <span className="flex items-center gap-1 cursor-pointer" onClick={toggleComments}>
          💬 <span>{post.comments.length}</span> Comments
        </span>
        <span className="flex items-center gap-1">
          🕒 {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Bookmark Icon */}
      <div className="mt-4 relative">
        <FaBookmark
          className={`cursor-pointer ${isPostBookmarked(selectedBookmark) ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-600`}
          onClick={toggleBookmarksDropdown}
        />
        {showBookmarks && (
          <div className="absolute z-10 bg-white border rounded shadow-md mt-2">
            <select
              className="border rounded p-1"
              value={selectedBookmark || ""}
              onChange={(e) => setSelectedBookmark(e.target.value)}
            >
              <option value="">Select a Bookmark</option>
              {bookmarks.map((bookmark) => (
                <option key={bookmark._id} value={bookmark._id}>
                  {bookmark.name}
                </option>
              ))}
            </select>
            <button
              className="mt-2 bg-blue-500 text-white rounded px-2 py-1"
              onClick={handleBookmarkClick}
            >
              Add to Bookmark
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-2">
          <div className="mt-4 flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="border rounded p-2 flex-1"
            />
            <FaArrowUp onClick={addComment} className="ml-2 cursor-pointer text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Comments:</h3>

          {comments.length > 0 ? (
            [...comments].reverse().map((comment) => (
              <div key={comment._id} className="flex items-start justify-between text-sm text-gray-700 mt-2 border-b pb-2">
                <div className="flex-1">
                  <strong>{comment.userId.username || "Anonymous"}:</strong>{" "}
                  {editingCommentId === comment._id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="border rounded p-1 flex-1"
                      />
                      <button onClick={() => updateComment(comment._id)} className="ml-2 bg-blue-500 text-white rounded px-2 py-1">
                        Save
                      </button>
                      <button onClick={() => setEditingCommentId(null)} className="ml-2 text-red-500">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>{comment.content}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <button onClick={() => toggleLikeComment(comment._id)} className={`ml-2 ${likedComments[comment._id] ? 'text-red-500' : 'text-blue-500'}`}>
                    {likedComments[comment._id] ? "Unlike" : "Like"}
                  </button>
                  <button onClick={() => {
                    setEditingCommentId(comment._id);
                    setEditingCommentText(comment.content);
                  }} className="ml-2 text-green-500">
                    Edit
                  </button>
                  <button onClick={() => deleteComment(comment._id)} className="ml-2 text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

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
