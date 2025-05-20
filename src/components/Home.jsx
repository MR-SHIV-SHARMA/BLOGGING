"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { User, Heart, MessageSquare, ArrowUp, Clock, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

export default function Home() {
  const POSTS_PER_PAGE = 10;
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `/content/posts?page=${page}&limit=${POSTS_PER_PAGE}`
        );

        if (data?.success) {
          // Filter only active posts
          const activePosts = data.data.filter((post) => post.isActive);
          setPosts((prev) =>
            page === 1 ? activePosts : [...prev, ...activePosts]
          );
          if (activePosts.length < POSTS_PER_PAGE) setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=1000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
              Discover • Connect • Inspire
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to the Blog
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto animate-fade-in">
              Discover amazing stories, ideas, and insights from our community
              of writers and thinkers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-indigo-700 hover:bg-white/90 font-medium"
              >
                Start Reading
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Join Community
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#f8fafc"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "Technology",
            "Lifestyle",
            "Travel",
            "Food",
            "Health",
            "Business",
          ].map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="text-sm py-2 px-4 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Posts Section */}
      <div className="container mx-auto px-4 max-w-7xl pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Latest Articles
          </h2>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900"
          >
            View All
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 text-center">
            <p className="font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setPage(1)}
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <PostCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>

        {hasMore && !loading && posts.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              size="lg"
            >
              Load More Articles
            </Button>
          </div>
        )}

        {!hasMore && !loading && posts.length > 0 && (
          <div className="text-center py-10 border-t border-slate-200 mt-12">
            <p className="text-lg text-slate-600">
              You've reached the end of the list.
            </p>
            <Button
              variant="link"
              className="text-indigo-600 mt-2"
              onClick={scrollToTop}
            >
              Back to top
            </Button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest articles, updates,
            and exclusive content directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/post/${post._id}`} className="block h-full">
      <Card className="h-full overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] border-slate-200 group">
        {post.media ? (
          <div className="relative h-56 overflow-hidden">
            <img
              src={post.media || "/placeholder.svg"}
              alt={post.title || "Post Image"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="h-56 bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
            <Eye className="h-12 w-12 text-indigo-300" />
          </div>
        )}

        <CardHeader className="pb-2">
          {post.category && (
            <Badge variant="secondary" className="mb-2 text-xs">
              {post.category || "General"}
            </Badge>
          )}
          {post.title && (
            <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {post.title}
            </h3>
          )}
        </CardHeader>

        <CardContent className="pb-2">
          {post.excerpt && (
            <p className="text-slate-600 line-clamp-3 text-sm">
              {post.excerpt ||
                post.content?.substring(0, 120) ||
                "Read this interesting article..."}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Heart className="mr-1 h-4 w-4 text-rose-500" />
              {post.likes?.length || 0}
            </span>
            <span className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4 text-indigo-500" />
              {post.comments?.length || 0}
            </span>
          </div>

          <div className="flex items-center">
            {post.createdAt && (
              <span className="flex items-center text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardFooter>

        {post.userId?.username && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              <User className="h-3 w-3 text-indigo-600" />
            </div>
            <p className="text-sm text-slate-600">{post.userId.username}</p>
          </div>
        )}
      </Card>
    </Link>
  );
}

function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200">
      <Skeleton className="h-56 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-6 w-2/3" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="pt-2 border-t border-slate-100 flex justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-24" />
      </CardFooter>
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <Skeleton className="h-4 w-32" />
      </div>
    </Card>
  );
}
