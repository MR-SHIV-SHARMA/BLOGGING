import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://bg-io.vercel.app/api/v1/content/posts");

        if (response?.data?.success) {
          const postsData = response.data.data;

          const postsWithComments = await Promise.all(
            postsData.map(async (post) => {
              if (post.comments.length > 0) {
                try {
                  const commentResponse = await axios.get(
                    `https://bg-io.vercel.app/api/v1/content/comments/post/comments/${post._id}`
                  );

                  return {
                    ...post,
                    comments: commentResponse.data.success
                      ? commentResponse.data.data
                      : [],
                  };
                } catch (error) {
                  console.error("Error fetching comments:", error);
                  return { ...post, comments: [] };
                }
              } else {
                return { ...post, comments: [] };
              }
            })
          );

          const sortedPosts = postsWithComments.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
          });

          setPosts(sortedPosts);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 px-4 py-6 md:px-10">
      {dataLoaded ? (
        <Masonry
          breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
          className="flex gap-4"
          columnClassName="masonry-grid-column"
        >
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              className="p-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
                <Link to={`/post/${post._id}`} className="block">
                  {post.media && (
                    <div className="w-full h-52 overflow-hidden relative">
                      <img
                        src={post.media}
                        alt="Post Media"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex justify-between mt-3 text-gray-500 text-sm border-t pt-3">
                      <span className="flex items-center gap-1">👍 {post.likes.length} Likes</span>
                      <span className="flex items-center gap-1">💬 {post.comments.length} Comments</span>
                      <span className="flex items-center gap-1">🕒 {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </Masonry>
      ) : (
        <div className="text-center py-12 text-lg">
          <div className="flex flex-wrap justify-center gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-72 h-96 bg-gray-300 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      )}
    </div>
  );
}

export default Home;
