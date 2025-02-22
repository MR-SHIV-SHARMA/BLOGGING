import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AddPost from "./components/AddPost";
import UserProfileCard from "./context/UserProfile";
import NotificationDropdown from "./components/NotificationDropdown";
import PostDetail from "./components/Post";
import AllPosts from "./components/AllPosts";
import ResetPassword from "./components/ResetPassword";
import AccountRestoration from "./components/AccountRestoration";
import PublicUserProfile from "./components/PublicUserProfile";
import SearchResultsPage from "./components/SearchResultsPage";
import { ProtectedRoute } from "./Routes/ProtectedRoute";
import { PublicRoute } from "./Routes/PublicRoute";

function App() {
  const location = useLocation();

  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/add-post"
          element={
            <ProtectedRoute>
              <AddPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <UserProfileCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationDropdown />
            </ProtectedRoute>
          }
        />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/all-posts" element={<AllPosts />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account-restoration" element={<AccountRestoration />} />
        <Route path="/api/v1/user/profile/view/f/:userId" element={<PublicUserProfile />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
      </Routes>
      {location.pathname !== "/notifications" && <Footer />}
    </>
  );
}

export default App; 