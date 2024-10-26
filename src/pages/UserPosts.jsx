import React from "react";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { Container } from "../components/index.js";
import { motion } from "framer-motion";
import Masonry from 'react-masonry-css'; // Import Masonry

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function UserPosts() {
  const userData = useSelector((state) => state.auth.userData);
  const posts = useSelector((state) => state.posts.posts);

  // Filter posts created by the logged-in user
  const userPosts = posts.filter(
    (post) => post.userId === (userData && userData.$id)
  );

  return (
    <div className="py-8 w-full bg-gradient-to-r from-blue-100 to-purple-100"> {/* Background Gradient */}
      <Container>
        {userPosts.length > 0 ? (
          <Masonry
            breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }} // Set responsive columns
            className="flex py-4" // Use flex to keep the layout responsive
            columnClassName="masonry-grid-column" // Optional: Add your own styles for columns
          >
            {userPosts.map((post, index) => {
              const isUpdated =
                post.$updatedAt &&
                new Date(post.$updatedAt) > new Date(post.$createdAt);

              return (
                <motion.div
                  key={post.$id}
                  className="p-2" // Keep padding
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                >
                  <div className="p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow"> {/* Added shadow */}
                    <Link to={`/post/${post.$id}`} className="text-gray-900">
                      <img
                        src={appwriteService.getFilePreview(post.featuredImage)}
                        alt={post.title}
                        className="w-full object-cover rounded-t-lg transition-transform transform hover:scale-105" // Scale on hover
                      />
                      <h5 className="mt-2 text-2xl font-bold text-black">{parse(post.title)}</h5> {/* Larger and colored title */}
                    </Link>

                    <p className="text-gray-600 text-sm mt-1">
                      {isUpdated
                        ? `Updated on: ${formatDate(post.$updatedAt)}`
                        : `Posted on: ${formatDate(post.$createdAt)}`}
                    </p>

                    <p className="text-gray-600 text-sm">
                      Author: <span className="font-semibold">{userData ? userData.name : "Unknown"}</span> {/* Bold author name */}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </Masonry>
        ) : (
          <div className="p-5 text-center w-full flex justify-center items-center bg-white rounded-lg shadow-md">
            <div>
              <h2 className="mb-2.5 text-3xl font-extrabold text-blue-800">Welcome to NextGen Thinkers Community!</h2> {/* Bold title */}
              <p className="text-xl text-gray-700">
                You haven't created any posts yet. Get started by sharing your thoughts and ideas with our community!
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default UserPosts;
