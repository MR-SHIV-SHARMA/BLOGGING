import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaRegBookmark, 
  FaBookmark,
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaShare,
  FaClock,
  FaEllipsisH,
  FaRegEdit,
  FaTrashAlt,
  FaReply,
  FaUserCircle,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaRegEye,
  FaCalendarAlt,
  FaTags,
  FaThumbsUp
} from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [estimatedReadTime] = useState(Math.ceil(post?.content?.length / 1000) || 5);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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

  // Add share functionality
  const shareUrl = window.location.href;
  const shareTitle = post?.title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleReply = async (commentId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/content/comments/${commentId}/replies`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Reply added successfully!");
        setReplyContent("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      toast.error("Error adding reply");
    }
  };

  return post ? (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="w-full bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Category & Read Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {post.categories[0]?.name || 'Uncategorized'}
            </span>
            <div className="flex items-center gap-3 text-gray-600">
              {/* View Count */}
              <div className="flex items-center gap-1">
                <FaRegEye className="text-lg" />
                <span>1.2k views</span>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-1">
                <FaClock className="text-lg" />
                <span>{estimatedReadTime} min read</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-lg" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8">
            <button className="group relative">
              <FaUserCircle className="w-12 h-12 text-gray-600 hover:text-blue-600 transition-colors" />
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-2 w-48 z-10">
                <div className="text-sm">
                  <p className="font-medium">{post.author?.username}</p>
                  <p className="text-gray-500">View Profile</p>
                </div>
              </div>
            </button>
            <div>
              <h3 className="font-medium text-gray-900">{post.author?.username}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span>{estimatedReadTime} min read</span>
              </div>
            </div>
          </div>

          {/* More Options Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaEllipsisH className="text-gray-600" />
            </button>
            
            {showMoreOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50"
              >
                <div className="py-1">
                  <button 
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {/* Add report functionality */}}
                  >
                    <FaRegEdit className="text-gray-600" />
                    Report Post
                  </button>
                  {post.isAuthor && (
                    <>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {/* Add edit functionality */}}
                      >
                        <FaRegEdit className="text-gray-600" />
                        Edit Post
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                        onClick={() => {/* Add delete functionality */}}
                      >
                        <FaTrashAlt className="text-red-600" />
                        Delete Post
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Featured Image */}
        {post.media && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <img
              src={post.media}
              alt={post.title}
              className="w-full h-[400px] sm:h-[500px] object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed font-serif">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FaTags className="text-gray-600" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag.name} className="text-sm text-blue-600">#{tag.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Interaction Bar */}
        <div className="mt-8 py-4 border-t border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button 
              onClick={() => toggleLikePost(post._id)}
              className="flex items-center gap-2 hover:text-red-600 transition-colors"
            >
              {isLiked ? (
                <FaHeart className="text-xl text-red-600" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
              <span>{post.likes.length}</span>
            </button>

            {/* Comment Button */}
            <button 
              onClick={toggleComments}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <FaRegComment className="text-xl" />
              <span>{comments.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Bookmark */}
            <div className="relative">
              <button
                onClick={toggleBookmarksDropdown}
                className="flex items-center gap-2 hover:text-yellow-600 transition-colors"
              >
                {isPostBookmarked(selectedBookmark) ? (
                  <FaBookmark className="text-xl text-yellow-600" />
                ) : (
                  <FaRegBookmark className="text-xl" />
                )}
              </button>
              
              {showBookmarks && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border p-4 z-50"
                >
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="mt-3 w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                    onClick={handleBookmarkClick}
                  >
                    Save to Bookmark
                  </button>
                </motion.div>
              )}
            </div>

            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                <FaShare className="text-xl" />
              </button>
              
              {showShareMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border p-4 z-50"
                >
                  <div className="flex flex-col gap-2">
                    <a 
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTwitter className="text-[#1DA1F2]" />
                      <span>Twitter</span>
                    </a>
                    <a 
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaFacebook className="text-[#4267B2]" />
                      <span>Facebook</span>
                    </a>
                    <a 
                      href={shareLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaLinkedin className="text-[#0077b5]" />
                      <span>LinkedIn</span>
                    </a>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaLink className="text-gray-600" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>
            
            {/* Comment Input */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the discussion"
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
              <button
                onClick={addComment}
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comment
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <FaUserCircle className="w-10 h-10 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{comment.userId.username}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLikeComment(comment._id)}
                            className={`text-sm ${
                              likedComments[comment._id]
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <FaThumbsUp />
                          </button>
                          <button
                            onClick={() => setReplyingTo(comment._id)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <FaReply />
                          </button>
                          {comment.isAuthor && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditingCommentText(comment.content);
                                }}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <FaRegEdit />
                              </button>
                              <button
                                onClick={() => deleteComment(comment._id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <FaTrashAlt />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleReply(comment._id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-4 ml-8 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex items-start gap-3">
                              <FaUserCircle className="w-8 h-8 text-gray-600" />
                              <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{reply.userId.username}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

export default PostDetail;
