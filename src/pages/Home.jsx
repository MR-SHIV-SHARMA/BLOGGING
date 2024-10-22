import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";
import Masonry from "react-masonry-css"; // Import Masonry component

function Home() {
  const [posts, setPosts] = useState([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data is loaded

  useEffect(() => {
    // Fetch posts from Appwrite service
    appwriteService.getPosts().then((posts) => {
      if (posts) {
        setPosts(posts.documents);
        setDataLoaded(true); // Mark data as loaded
      }
    });

    // Timer to control welcome message display
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  useEffect(() => {
    if (dataLoaded && shouldAnimate) {
      setShowWelcome(false); // Hide welcome message only when data is loaded and timer is done
    }
  }, [dataLoaded, shouldAnimate]);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const welcomeVariants = {
    hidden: { opacity: 0, y: -20 }, // Animate from above
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
                animate={shouldAnimate ? "visible" : "hidden"}
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

export default Home;
