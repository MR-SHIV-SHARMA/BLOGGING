import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaHeart, FaComment, FaArrowUp } from "react-icons/fa";

function Home() {
  const POSTS_PER_PAGE = 10;
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `https://bg-io.vercel.app/api/v1/content/posts?page=${page}&limit=${POSTS_PER_PAGE}`
        );

        if (data?.success) {
          const newPosts = data.data;
          setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
          if (newPosts.length < POSTS_PER_PAGE) setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Welcome to the Blog
          </h1>
          <p className="text-xl mb-8 animate-fade-in delay-100">
            Discover amazing stories, ideas, and insights.
          </p>
        </div>
      </div>

      {/* Posts Section */}
      <div className="container mx-auto px-4 max-w-6xl mt-10">
        {error && (
          <div className="text-center text-red-500 mb-4 text-lg font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {loading && (
          <div className="text-center py-6">
            <p className="text-lg text-blue-500 animate-pulse">
              Loading posts...
            </p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Load More
            </button>
          </div>
        )}

        {!hasMore && !loading && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-lg text-gray-700">No more posts to load.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <FaArrowUp className="text-xl" />
        </button>
      )}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/post/${post._id}`} className="block">
      <div className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-20 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        {post.media && (
          <img
            src={post.media}
            alt={post.title || "Post Image"}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          {post.title && (
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {post.title}
            </h2>
          )}

          <div className="flex justify-between items-center text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <FaHeart className="mr-1 text-red-500" />{" "}
                {post.likes?.length || 0}
              </span>
              <span className="flex items-center">
                <FaComment className="mr-1 text-blue-500" />{" "}
                {post.comments?.length || 0}
              </span>
            </div>

            {post.userId?.username && (
              <p className="text-sm flex items-center">
                <FaUser className="mr-1 text-gray-500" /> {post.userId.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Home;
