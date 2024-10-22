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
      const response = await appwriteService.getPosts();
      if (response) {
        dispatch(setPosts(response.documents.reverse()));
      }
    };

    fetchPosts();
  }, [dispatch]);

  return (
    <div className="py-8 w-full bg-gray-100">
      <Container>
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
              transition={{ duration: 0.7, delay: index * 0.15 }}
            >
              <PostCard {...post} />
            </motion.div>
          ))}
        </Masonry>
      </Container>
    </div>
  );
}

export default AllPosts;
