import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { PostCard, Container } from "../components/index.js";
import Masonry from "react-masonry-css"; // Import Masonry component
import { setPosts } from "../store/postsSlice";
import { motion } from "framer-motion"; // Import motion from framer-motion

function AllPosts() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await appwriteService.getPosts([]);
      if (response) {
        // Sort by updated timestamp or fallback to created timestamp (descending order)
        const sortedPosts = response.documents.sort((a, b) => {
          const dateA = new Date(a.$updatedAt || a.$createdAt); // Use updated date, fallback to created date
          const dateB = new Date(b.$updatedAt || b.$createdAt);
          return dateB - dateA; // Sort in descending order (most recent first)
        });
        dispatch(setPosts(sortedPosts)); // Dispatch sorted posts to the store
      }
    };

    fetchPosts();
  }, [dispatch]);

  return (
    <div className="py-8 w-full bg-gradient-to-r from-blue-100 to-purple-100"> {/* Background Gradient */}
      <Container>
        <Masonry
          breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }} // Responsive columns
          className="flex py-4" // Keep the layout responsive
          columnClassName="masonry-grid-column" // Optional: Add your own styles for columns
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.$id}
              className="p-2" // Keep padding as needed
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: index * 0.15 }}
            >
              <PostCard {...post} className="shadow-lg transition-shadow hover:shadow-xl rounded-lg bg-white p-4"> {/* Added styles for PostCard */}
              </PostCard>
            </motion.div>
          ))}
        </Masonry>
      </Container>
    </div>
  );
}

export default AllPosts;
