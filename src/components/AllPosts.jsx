import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Import Link for navigation

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/content/posts");
        const result = await response.json();

        if (result && result.success && Array.isArray(result.data)) {
          const sortedPosts = result.data.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
          });

          setPosts(sortedPosts);
        } else {
          console.error("Unexpected API response format:", result);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="py-10 w-full bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen font-poppins">
      {/* Add Google Fonts in your global CSS or index.html */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white/50 backdrop-blur-lg shadow-lg border border-white/20 rounded-2xl overflow-hidden p-4 sm:p-6 mb-6 animate-pulse"
              >
                <div className="w-full h-52 sm:h-64 md:h-72 lg:h-80 bg-gray-200 rounded-xl" />
                <div className="mt-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Masonry
            breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {posts.map((post, index) => (
              <Link to={`/post/${post._id}`} key={post._id} className="block">
                <motion.div
                  className="bg-white/50 backdrop-blur-lg shadow-lg border border-white/20 rounded-2xl overflow-hidden p-4 sm:p-6 mb-6 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                  {/* Post Image with Parallax Effect */}
                  {post.media && (
                    <div className="w-full h-52 sm:h-64 md:h-72 lg:h-80 overflow-hidden rounded-xl relative">
                      <motion.img
                        src={post.media}
                        alt={post.title || "Post Image"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="mt-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {post.title}
                    </h2>
                    <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                      {post.content.length > 180
                        ? post.content.substring(0, 180) + "..."
                        : post.content}
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      By{" "}
                      <span className="font-medium">
                        {post.userId?.username || "Anonymous"}
                      </span>
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </Masonry>
        )}
      </div>

      {/* Custom Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

export default AllPosts;
