import React from "react";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { Container } from "../components/index.js";
import { motion } from "framer-motion";

function UserPosts() {
  const userData = useSelector((state) => state.auth.userData);
  const posts = useSelector((state) => state.posts.posts);

  const userPosts = posts.filter(
    (post) => post.userId === (userData && userData.$id)
  );

  return (
    <div className="py-8 w-full bg-white">
      <Container>
        <div className="flex flex-wrap justify-center">
          {userPosts.length > 0 ? (
            userPosts.map((post, index) => (
              <motion.div
                key={post.$id}
                className="w-full md:w-1/2 lg:w-1/4 xl:w-1/5 p-2 mx-2 mb-4"
              >
                <div>
                  <Link to={`/post/${post.$id}`} className="text-gray-900">
                    <img
                      src={appwriteService.getFilePreview(post.featuredImage)}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <h5 className="text-xl font-bold">{parse(post.title)}</h5>
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-5 text-center w-full flex justify-center items-center bg-white">
              <div>
                <h2 className="mb-2.5 text-3xl font-bold">
                  Welcome to NextGen Thinkers Community!
                </h2>
                <p className="text-xl">
                  You haven't created any posts yet. Get started by sharing your
                  thoughts and ideas with our community!
                </p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default UserPosts;
