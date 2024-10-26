import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../store/postsSlice";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";
import Masonry from "react-masonry-css";

function Home() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  const authStatus = useSelector((state) => state.auth.status);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await appwriteService.getPosts();
      if (response) {
        // Sort by updated timestamp or fallback to created timestamp in descending order
        const sortedPosts = response.documents.sort((a, b) => {
          const dateA = new Date(a.$updatedAt || a.$createdAt); // Use updated date or fallback to created date
          const dateB = new Date(b.$updatedAt || b.$createdAt);
          return dateB - dateA; // Sort in descending order (most recent first)
        });
        dispatch(setPosts(sortedPosts));
        setDataLoaded(true);
      }
    };

    if (authStatus) {
      fetchPosts();
    } else {
      setDataLoaded(true); // Mark data as loaded even if user is not authenticated
    }

    const timer = setTimeout(() => {
      if (authStatus) {
        setShouldAnimate(true);
        setShowWelcome(false); // Hide welcome only if authenticated
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch, authStatus]);

  useEffect(() => {
    if (dataLoaded && shouldAnimate) {
      setShowWelcome(false);
    }
  }, [dataLoaded, shouldAnimate]);

  const welcomeVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full bg-gray-100">
      <Container>
        {showWelcome ? (
          <motion.div
            className="w-full items-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={welcomeVariants}
            transition={{ duration: 2 }}
          >
            <div className="flex flex-wrap justify-center p-6 w-full">
              <div className="w-full text-center">
                <img
                  src="./NextGen-Thinkers-Logo.png"
                  alt="NextGen Thinkers Logo"
                  className="mx-auto mb-4 h-auto max-h-[300px] sm:max-h-[400px] w-full object-contain"
                />
                <h1 className="text-4xl font-extrabold text-gray-800 mb-3 md:text-5xl lg:text-6xl">
                  Welcome to NextGen Thinkers
                </h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4 md:text-4xl lg:text-5xl">
                  Join the NextGen Thinkers Community!
                </h2>
                <p className="text-gray-800 text-lg sm:text-xl md:text-2xl">
                  Unlock a world of insightful posts and thought-provoking
                  content by logging in. Whether you want to dive into our
                  latest articles or share your own ideas with fellow tech
                  enthusiasts, logging in is your gateway to a richer
                  experience. Become a part of our vibrant community and enhance
                  your tech knowledge today!
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          authStatus &&
          dataLoaded && ( // Ensure that posts are shown only if user is authenticated and data is loaded
            <Masonry
              breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
              className="flex py-4"
              columnClassName="masonry-grid-column"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.$id}
                  className="p-2"
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                >
                  <PostCard {...post} />
                </motion.div>
              ))}
            </Masonry>
          )
        )}
      </Container>
    </div>
  );
}

export default Home;
