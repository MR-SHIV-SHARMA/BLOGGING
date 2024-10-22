import React, { useState, useEffect } from "react";
import { Header, Footer } from "./components/index";
import authService from "./appwrite/auth";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";
import { Outlet } from "react-router-dom";
import { clearPosts } from "./store/postsSlice";

function App() {
  const [loading, setLoading] = React.useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }));
          // Fetch posts only if user is logged in
          const storedPosts = JSON.parse(localStorage.getItem("posts"));
          if (storedPosts) {
            dispatch(setPosts(storedPosts));
          }
        } else {
          dispatch(logout());
          dispatch(clearPosts()); // Clear posts on logout
        }
      })
      .catch((error) => {
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  return !loading ? (
    <div className="min-h-screen flex flex-wrap content-between bg-gray-400">
      <div className="w-full block">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : null;
}

export default App;
