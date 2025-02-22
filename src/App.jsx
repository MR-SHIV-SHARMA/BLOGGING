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
import HelpCenter from "./components/HelpCenter";
import RestoreAccount from "./components/RestoreAccount";
import EmailVerification from "./components/EmailVerification";

function App() {
  const location = useLocation();

  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/all-posts" element={<AllPosts />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/user/profile/:userId" element={<PublicUserProfile />} />
        <Route path="/search-results" element={<SearchResultsPage />} />

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

        {/* Account Management Routes */}
        <Route
          path="/account-restoration-request"
          element={<AccountRestoration />}
        />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/restore-account/:token" element={<RestoreAccount />} />
      </Routes>
      {location.pathname !== "/notifications" && <Footer />}
    </>
  );
}

export default App;
