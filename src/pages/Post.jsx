import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components/index.js"; // Import Button and Container
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const posts = useSelector((state) => state.posts.posts); // Get all posts from Redux
  const userData = useSelector((state) => state.auth.userData);
  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
        } else {
          navigate("/");
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate]);

  const deletePost = () => {
    appwriteService.deletePost(post.$id).then((status) => {
      if (status) {
        appwriteService.deleteFile(post.featuredImage);
        navigate("/");
      }
    });
  };

  const calculateRelevance = (relatedPost) => {
    let score = 0;
    const titleLower = post.title.toLowerCase();
    const contentLower = post.content.toLowerCase();
    const relatedTitleLower = relatedPost.title.toLowerCase();
    const relatedContentLower = relatedPost.content.toLowerCase();

    // Check if title matches
    if (relatedTitleLower.includes(titleLower)) score += 2; // Title match gives higher score
    // Check if content matches
    if (relatedContentLower.includes(contentLower)) score += 1; // Content match gives lower score

    return score;
  };

  // Ensure post is available before calculating relevance
  const sortedRelatedPosts = post
    ? posts
        .filter((relatedPost) => relatedPost.$id !== post.$id) // Exclude the current post
        .map((relatedPost) => ({
          ...relatedPost,
          relevance: calculateRelevance(relatedPost), // Calculate relevance
        }))
        .sort((a, b) => b.relevance - a.relevance) // Sort by relevance score
    : [];

  return post ? (
    <div className="py-8 bg-gray-100">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Content Section */}
          <div className="md:col-span-3">
            <div className="relative border border-gray-600 rounded-xl overflow-hidden shadow-lg mb-4">
              <img
                src={appwriteService.getFilePreview(post.featuredImage)}
                alt={post.title}
                className="w-full object-cover rounded-t-xl p-2 transition-transform duration-500 hover:scale-105"
              />
              {isAuthor && (
                <div className="absolute right-6 top-6 flex space-x-3">
                  <Link to={`/edit-post/${post.$id}`}>
                    <Button bgColor="bg-green-500" className="mr-3">
                      Edit
                    </Button>
                  </Link>
                  <Button bgColor="bg-red-500" onClick={deletePost}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
              {post.title}
            </h1>
            <div className="browser-css text-gray-700">
              {parse(post.content)}
            </div>
          </div>

          {/* Related Posts Section */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
            <div className="space-y-2">
              {sortedRelatedPosts.length > 0 ? (
                sortedRelatedPosts.map((relatedPost) => (
                  <Link to={`/post/${relatedPost.$id}`} className="flex-grow">
                    <div
                      key={relatedPost.$id}
                      className="border border-gray-300 rounded-md p-2 flex"
                    >
                      <img
                        src={appwriteService.getFilePreview(
                          relatedPost.featuredImage
                        )}
                        alt={relatedPost.title}
                        className="w-16 h-16 object-cover rounded-md mr-4" // Left side image
                      />
                      <h3 className="font-semibold">{relatedPost.title}</h3>
                    </div>
                  </Link>
                ))
              ) : (
                <p>No related posts found.</p> // Message if no related posts
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  ) : null;
}
