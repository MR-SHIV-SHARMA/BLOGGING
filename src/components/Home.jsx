import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";

function Home() {
  const POSTS_PER_PAGE = 10;
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

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

  return (
    <div className="w-full min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {loading && (
          <div className="text-center py-6">
            <p className="text-lg text-blue-500">Loading posts...</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all"
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
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/post/${post._id}`} className="block">
      <div className="bg-white shadow-md rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg">
        {post.media && (
          <img
            src={post.media}
            alt={post.title || "Post Image"}
            className="w-full h-52 object-cover"
          />
        )}
        <div className="p-4">
          {post.title && (
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              {post.title}
            </h2>
          )}

          <div className="flex justify-between text-gray-500 text-sm">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>💬 {post.comments?.length || 0}</span>
            {post.userId?.username && (
              <p className="text-gray-600 text-sm mb-4 flex items-center">
                <FaUser className="mr-1" /> {post.userId.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Home;
