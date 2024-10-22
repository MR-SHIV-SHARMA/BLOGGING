import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import appwriteService from "../appwrite/config";
import { PostCard, Container } from "../components/index.js";
import Masonry from "react-masonry-css"; // Import Masonry component

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    appwriteService.getPosts([]).then((posts) => {
      if (posts) {
        setPosts(posts.documents);
        setLoading(false); // Set loading to false after data is fetched
      }
    });
  }, []);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="py-8 w-full bg-gray-100">
      <Container>
        {loading ? ( // Show loading spinner while loading
          <div className="flex items-center justify-center h-full">
            <div className="loader border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <Masonry
            breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
            className="flex py-4" // Use flex to keep the layout responsive
            columnClassName="masonry-grid-column" // Optional: Add your own styles for columns
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.$id}
                className="p-2" // Adjust padding as needed
                initial="hidden"
                animate="visible"
                variants={postVariants}
                transition={{ duration: 0.7, delay: index * 0.15 }}
              >
                <PostCard {...post} />
              </motion.div>
            ))}
          </Masonry>
        )}
      </Container>
    </div>
  );
}

export default AllPosts;
