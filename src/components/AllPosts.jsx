import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";

function AllPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://bg-io.vercel.app/api/v1/content/posts"
        );
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
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="py-10 w-full bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="flex -ml-4 w-auto"
          columnClassName="pl-4 bg-clip-padding"
        >
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              className="bg-white shadow-lg border border-gray-300 rounded-2xl overflow-hidden p-4 sm:p-6 mb-6 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Post Image */}
              {post.media && (
                <div className="w-full h-52 sm:h-64 md:h-72 overflow-hidden rounded-xl">
                  <img
                    src={post.media}
                    alt="Post Image"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
                    {post.author || "Anonymous"}
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default AllPosts;
