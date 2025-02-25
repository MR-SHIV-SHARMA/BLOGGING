import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {
  FaUserCircle,
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
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaRegEye,
  FaCalendarAlt,
  FaTags,
  FaThumbsUp,
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [estimatedReadTime] = useState(
    Math.ceil(post?.content?.length / 1000) || 5
  );
  const [showMoreOptions, setShowMoreOptions] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Add new state for caching
  const [likesCache, setLikesCache] = useState({});
  const [commentsCache, setCommentsCache] = useState({});

  // New state for showing interactivity during the comment API call
  const [isAddingComment, setIsAddingComment] = useState(false);

  // At the beginning of your PostDetail component, add the state:
  const [hasCopied, setHasCopied] = useState(false);

  // Create refs for the bookmarks and share dropdowns
  const bookmarksRef = useRef(null);
  const shareRef = useRef(null);

  // Outside click handler to close dropdown menus for both bookmarks and share
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showBookmarks &&
        bookmarksRef.current &&
        !bookmarksRef.current.contains(event.target)
      ) {
        setShowBookmarks(false);
      }
      if (
        showShareMenu &&
        shareRef.current &&
        !shareRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBookmarks, showShareMenu]);

  // Updated fetchComments to display the most recent comments first
  const fetchComments = async (forceUpdate = false) => {
    if (!post?._id) return;

    // If not forcing and we have cached comments, then use the cache
    if (!forceUpdate && commentsCache[post._id]) {
      const cachedComments = commentsCache[post._id];
      setComments(cachedComments);
      setPost((prev) => ({ ...prev, comments: cachedComments }));
      return;
    }

    try {
      const response = await axios.get(
        `/content/comments/post/comments/${post._id}`
      );
      if (response.data.success) {
        const commentsData = response.data.data.comments;
        // Sort the comments to display the most recent comment at the top
        const sortedComments = commentsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // Update the cache with sorted comments
        setCommentsCache((prev) => ({
          ...prev,
          [post._id]: sortedComments,
        }));
        setComments(sortedComments);
        // Also update the post state so the comment count (post.comments.length) is correct
        setPost((prev) => ({ ...prev, comments: sortedComments }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const cachedPost = localStorage.getItem(`post_${slug}`);
        if (cachedPost) {
          const parsedPost = JSON.parse(cachedPost);
          const cacheTime = localStorage.getItem(`post_${slug}_time`);

          if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
            setPost(parsedPost);
            return parsedPost;
          }
        }

        const response = await axios.get(`/content/posts/${slug}`);
        const postData = response.data.data;
        // Cache the result if needed
        localStorage.setItem(`post_${slug}`, JSON.stringify(postData));
        localStorage.setItem(`post_${slug}_time`, Date.now().toString());
        setPost(postData);
        return postData;
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchBookmarks = async () => {
      // Check cache first
      const cachedBookmarks = localStorage.getItem("bookmarks");
      const cacheTime = localStorage.getItem("bookmarks_time");

      if (
        cachedBookmarks &&
        cacheTime &&
        Date.now() - parseInt(cacheTime) < 5 * 60 * 1000
      ) {
        setBookmarks(JSON.parse(cachedBookmarks));
        return;
      }

      const token = Cookies.get("accessToken");
      try {
        const response = await axios.get("/interactions/bookmarks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const bookmarksData = response.data.data || [];
          setBookmarks(bookmarksData);
          // Cache the bookmarks
          localStorage.setItem("bookmarks", JSON.stringify(bookmarksData));
          localStorage.setItem("bookmarks_time", Date.now().toString());
        }
      } catch (error) {
        toast.error("Error fetching bookmarks");
      }
    };

    const fetchLikesCount = async (postId) => {
      // Check cache first
      if (likesCache[postId]) {
        setPost((prev) => ({
          ...prev,
          likesCount: likesCache[postId],
        }));
        return;
      }

      const token = Cookies.get("accessToken");
      try {
        const response = await axios.get(`/interactions/likes/post/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const likesCount = response.data.data.likesCount;
          // Update cache
          setLikesCache((prev) => ({
            ...prev,
            [postId]: likesCount,
          }));
          setPost((prev) => ({
            ...prev,
            likesCount: likesCount,
          }));
        }
      } catch (error) {
        console.error("Error fetching likes count:", error);
      }
    };

    const checkIfLiked = async (postId) => {
      const token = Cookies.get("accessToken");
      if (!token || !currentUser) return;

      try {
        const response = await axios.get(`/interactions/likes/post/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const { likes } = response.data.data;
          const hasLiked = likes.some(
            (like) => like.userId._id === currentUser._id
          );
          setIsLiked(hasLiked);

          // Update likes count
          setPost((prev) => ({
            ...prev,
            likesCount: response.data.data.likeCount,
          }));
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    const fetchPostData = async () => {
      const postData = await fetchPost();
      if (postData?._id) {
        await fetchLikesCount(postData._id);
        if (currentUser) {
          await checkIfLiked(postData._id);
        }
        // Only fetch comments if they're visible
        if (showComments) {
          await fetchComments();
        }
      }
    };

    fetchPostData();
    fetchBookmarks();

    // Cleanup function
    return () => {
      // Clear specific cache items that are older than 1 hour
      const now = Date.now();
      Object.keys(localStorage).forEach((key) => {
        if (key.endsWith("_time")) {
          const time = parseInt(localStorage.getItem(key));
          if (now - time > 60 * 60 * 1000) {
            // 1 hour
            localStorage.removeItem(key);
            localStorage.removeItem(key.replace("_time", ""));
          }
        }
      });
    };
  }, [slug, showComments, currentUser]);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Add this useEffect to fetch comments count when the post loads
  useEffect(() => {
    if (post?._id) {
      fetchComments();
    }
  }, [post?._id]);

  const isPostAlreadyBookmarked = (bookmarkId) => {
    return post.bookmarks && post.bookmarks.includes(bookmarkId);
  };

  const addPostToBookmark = async (bookmarkId, postId) => {
    const token = Cookies.get("accessToken");
    if (!bookmarkId || !postId) {
      toast.error("Please select a bookmark and a post.");
      return;
    }

    if (isPostAlreadyBookmarked(bookmarkId)) {
      toast.error("This post is already bookmarked in the selected bookmark.");
      return;
    }

    try {
      const response = await axios.post(
        `/interactions/bookmarks/${bookmarkId}/posts`,
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
        const errorMessage =
          error.response.data.message || "Error adding post to bookmark";
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
    const token = Cookies.get("accessToken");
    if (!token || !currentUser) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      const response = await axios.post(
        `/interactions/likes/post/${postId}`,
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Post liked successfully!");
        setIsLiked(true);
        // Update likes count
        setPost((prev) => ({
          ...prev,
          likesCount: (prev.likesCount || 0) + 1,
        }));
      }
    } catch (error) {
      if (
        error.response?.data?.message === "You have already liked this item."
      ) {
        setIsLiked(true);
      }
      console.error("Error liking post:", error);
      toast.error(error.response?.data?.message || "Error liking post");
    }
  };

  const deleteLike = async (postId) => {
    const token = Cookies.get("accessToken");
    if (!token || !currentUser) {
      toast.error("Please login to unlike posts");
      return;
    }

    try {
      const response = await axios.delete(
        `/interactions/likes/post/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Post unliked successfully!");
        setIsLiked(false);
        // Update likes count
        setPost((prev) => ({
          ...prev,
          likesCount: Math.max((prev.likesCount || 0) - 1, 0),
        }));
      }
    } catch (error) {
      console.error("Error unliking post:", error);
      toast.error(error.response?.data?.message || "Error unliking post");
    }
  };

  const toggleLikePost = async (postId) => {
    if (!currentUser) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      if (isLiked) {
        await deleteLike(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Updated addComment function with a slight artificial delay
  const addComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (!currentUser) {
      toast.error("Please login to add a comment");
      return;
    }

    setIsAddingComment(true); // Set loading state
    const token = Cookies.get("accessToken");
    try {
      const response = await axios.post(
        `/content/comments/post/${post._id}`,
        {
          postId: post._id, // Explicitly send postId
          userId: currentUser._id, // Explicitly send userId
          content: newComment, // The comment content
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Comment added successfully!");
        setNewComment("");
        // Force re-fetch comments (ignoring cache) so the UI is immediately updated.
        fetchComments(true);
      } else {
        toast.error(response.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    } finally {
      // Introduce a small delay (300ms) so "Commenting..." is visible even if the API call is fast.
      setTimeout(() => {
        setIsAddingComment(false);
      }, 300);
    }
  };

  const isCommentOwner = (comment) => {
    return currentUser && currentUser._id === comment.userId._id;
  };

  const updateComment = async (commentId, comment) => {
    if (!isCommentOwner(comment)) {
      toast.error("You can only edit your own comments!");
      return;
    }

    const token = Cookies.get("accessToken");
    try {
      const response = await axios.put(
        `/content/comments/${commentId}`,
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

  const deleteComment = async (commentId, comment) => {
    if (!isCommentOwner(comment)) {
      toast.error("You can only delete your own comments!");
      return;
    }

    const token = Cookies.get("accessToken");
    try {
      const response = await axios.delete(`/content/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // Updated helper function to check if the comment is liked by current user,
  // handling both object and string types.
  const isCommentLikedByCurrentUser = (comment) => {
    if (!currentUser || !comment.likes) return false;
    return comment.likes.some((like) => {
      if (typeof like === "string") return like === currentUser._id;
      const likeUserId = like?.userId?._id || like?.userId;
      return likeUserId === currentUser._id;
    });
  };

  // Helper functions for liking and unliking a comment
  const likeComment = async (commentId) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error("Please login to like comments");
      return;
    }
    try {
      const response = await axios.post(
        `/interactions/likes/comment/${commentId}`,
        { commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const unlikeComment = async (commentId) => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error("Please login to unlike comments");
      return;
    }
    try {
      const response = await axios.delete(
        `/interactions/likes/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Updated toggleLikeComment function, now mimicking the post like logic.
  // This function updates local state (and the cache) immediately so that
  // the icon color (blue when liked) is in sync.
  const toggleLikeComment = async (commentId) => {
    if (!currentUser) {
      toast.error("Please login to like comments");
      return;
    }

    // Find the comment from the current list
    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    const alreadyLiked = isCommentLikedByCurrentUser(comment);

    // Helper to update both local state and the commentsCache for the current post.
    const updateCommentsState = (updatedComments) => {
      setComments(updatedComments);
      if (post?._id) {
        setCommentsCache((prev) => ({ ...prev, [post._id]: updatedComments }));
      }
    };

    if (alreadyLiked) {
      // Unlike the comment
      try {
        await unlikeComment(commentId);
        const updatedComments = comments.map((c) => {
          if (c._id === commentId) {
            const newLikes = c.likes.filter((like) => {
              if (typeof like === "string") return like !== currentUser._id;
              const likeUserId = like?.userId?._id || like?.userId;
              return likeUserId !== currentUser._id;
            });
            return { ...c, likes: newLikes };
          }
          return c;
        });
        updateCommentsState(updatedComments);
      } catch (error) {
        console.error("Error unliking comment:", error);
        toast.error(error.response?.data?.message || "Error unliking comment");
      }
    } else {
      // Like the comment
      try {
        await likeComment(commentId);
        const updatedComments = comments.map((c) => {
          if (c._id === commentId) {
            // Only add currentUser if not already present.
            if (!isCommentLikedByCurrentUser(c)) {
              return {
                ...c,
                likes: [...(c.likes || []), { userId: currentUser }],
              };
            }
          }
          return c;
        });
        updateCommentsState(updatedComments);
      } catch (error) {
        // If error indicates the comment is already liked, update the UI accordingly.
        if (
          error.response &&
          error.response.data &&
          error.response.data.message === "You have already liked this item."
        ) {
          const updatedComments = comments.map((c) => {
            if (c._id === commentId) {
              if (!isCommentLikedByCurrentUser(c)) {
                return {
                  ...c,
                  likes: [...(c.likes || []), { userId: currentUser }],
                };
              }
            }
            return c;
          });
          updateCommentsState(updatedComments);
        } else {
          console.error("Error liking comment:", error);
          toast.error(error.response?.data?.message || "Error liking comment");
        }
      }
    }
  };

  // Modify toggleComments to fetch comments only when needed
  const toggleComments = () => {
    setShowComments((prev) => {
      const newValue = !prev;
      if (newValue && (!commentsCache[post._id] || comments.length === 0)) {
        fetchComments();
      }
      return newValue;
    });
  };

  // Add share functionality
  const shareUrl = window.location.href;
  const shareTitle = post?.title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareTitle)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      shareUrl
    )}&title=${encodeURIComponent(shareTitle)}`,
  };

  // Updated copyToClipboard function with state feedback
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
        setHasCopied(true);
        setTimeout(() => {
          setHasCopied(false);
        }, 2000); // 2000ms = 2 seconds before reverting back
      })
      .catch(() => {
        toast.error("Failed to copy the link.");
      });
  };

  const handleReply = async (commentId) => {
    const token = Cookies.get("accessToken");
    try {
      const response = await axios.post(
        `/content/comments/${commentId}/replies`,
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
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex justify-between">
            {/* Author Info */}
            <div className="flex items-center gap-4">
              <Link
                to={`/api/v1/user/profile/view/f/${post.userId?._id}`}
                className="group relative"
              >
                <FaUserCircle className="w-12 h-12 text-gray-600 hover:text-blue-600 transition-colors" />
                <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-2 w-48 z-10">
                  <div className="text-sm">
                    <p className="font-medium">{post.userId?.username}</p>
                    <p className="text-gray-500">View Profile</p>
                  </div>
                </div>
              </Link>
              <div>
                <h3 className="font-medium text-gray-900">
                  {post.userId?.username}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                      onClick={() => {
                        /* Add report functionality */
                      }}
                    >
                      <FaRegEdit className="text-gray-600" />
                      Report Post
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
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
            className="mb-4"
          >
            <img
              src={post.media}
              alt={post.title}
              className="w-full h-[400px] sm:h-[500px] object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        )}

        {/* Category & Read Time */}
        <div className="flex justify-between items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {post.categories?.[0]?.name || "Uncategorized"}
          </span>
          <div className="flex items-center gap-3 text-gray-600">
            {/* View Count */}
            <div className="flex items-center gap-1">
              <FaRegEye className="text-lg" />
              <span>1.2k views</span>
            </div>
          </div>
        </div>

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
              {post.tags?.map((tag) => (
                <span key={tag.name} className="text-sm text-blue-600">
                  {tag.name}
                </span>
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
              <span>{post.likes.length || 0}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <FaRegComment className="text-xl" />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Bookmark */}
            <div className="relative" ref={bookmarksRef}>
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
            <div className="relative" ref={shareRef}>
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
                      {hasCopied ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaLink className="text-gray-600" />
                      )}
                      <span>{hasCopied ? "Copied!" : "Copy Link"}</span>
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
            <h3 className="text-xl font-semibold mb-4">
              Comments ({post.comments?.length || 0})
            </h3>

            {/* Comment Input */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the discussion"
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y whitespace-pre-wrap"
              />
              <button
                onClick={addComment}
                disabled={isAddingComment}
                className={`mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                  isAddingComment
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isAddingComment ? "Commenting..." : "Comment"}
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => {
                return (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <Link
                        to={`/api/v1/user/profile/view/f/${comment.userId?._id}`}
                        className="group relative"
                      >
                        <FaUserCircle className="w-10 h-10 text-gray-600" />
                        <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-2 w-48 z-10">
                          <div className="text-sm">
                            <p className="font-medium">
                              {comment.userId?.username}
                            </p>
                            <p className="text-gray-500">View Profile</p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {post.userId?.username || "Unknown User"}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* Updated Like Button */}
                            <button
                              onClick={() => toggleLikeComment(comment._id)}
                              className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full transition-colors ${
                                isCommentLikedByCurrentUser(comment)
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              <FaThumbsUp className="text-sm" />
                              <span>{comment.likes?.length || 0}</span>
                            </button>

                            {currentUser && (
                              <button
                                onClick={() => setReplyingTo(comment._id)}
                                className="flex items-center gap-1 text-sm px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                              >
                                <FaReply className="text-sm" />
                                <span>Reply</span>
                              </button>
                            )}

                            {/* Edit and Delete buttons - Only show for comment owner */}
                            {isCommentOwner(comment) && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowMoreOptions(comment._id)
                                  }
                                  className="flex items-center gap-1 text-sm px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                  <FaEllipsisH />
                                </button>

                                {showMoreOptions === comment._id && (
                                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment._id);
                                        setEditingCommentText(comment.content);
                                        setShowMoreOptions(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      <FaRegEdit className="text-gray-500" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        deleteComment(comment._id, comment);
                                        setShowMoreOptions(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <FaTrashAlt className="text-red-500" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comment Content with updated CSS for proper word wrapping */}
                        {editingCommentId === comment._id ? (
                          <div className="mt-3">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] whitespace-pre-wrap break-words"
                              rows="3"
                            />
                            <div className="mt-2 flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  updateComment(comment._id, comment)
                                }
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        )}

                        {/* Replies */}
                        {comment.replies?.length > 0 && (
                          <div className="mt-4 ml-8 space-y-4">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply._id}
                                className="flex items-start gap-3"
                              >
                                <Link
                                  to={`/api/v1/user/profile/view/f/${reply.userId?._id}`}
                                  className="group relative"
                                >
                                  <FaUserCircle className="w-8 h-8 text-gray-600" />
                                  <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-2 w-48 z-10">
                                    <div className="text-sm">
                                      <p className="font-medium">
                                        {reply.userId?.username}
                                      </p>
                                      <p className="text-gray-500">
                                        View Profile
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {reply.userId.username}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(
                                        reply.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Display error message if unauthorized action is attempted */}
                        {!currentUser && (
                          <p className="text-sm text-gray-500 mt-2">
                            Please log in to reply to comments
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
      <ToastContainer />;
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}

export default PostDetail;
