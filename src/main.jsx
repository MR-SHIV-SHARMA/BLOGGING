import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios"; // ✅ Axios Import किया
import "./index.css";

axios.defaults.baseURL = "https://bg-io.vercel.app/api/v1";
// axios.defaults.baseURL = "http://localhost:3000/api/v1";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Footer from "./components/Footer";
import PostDetail from "./components/Post";
import Header from "./components/Header";
import AllPosts from "./components/AllPosts";
import AddPost from "./components/AddPost";
import UserProfileCard from "./components/UserProfile";
import ResetPassword from "./components/ResetPassword";
import AccountRestoration from "./components/AccountRestoration";
import PublicUserProfile from "./components/PublicUserProfile";
import SearchResultsPage from "./components/SearchResultsPage";
import NotificationDropdown from "./components/NotificationDropdown";

function App() {
  // Get the current location to conditionally render the footer
  const location = useLocation();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post/:slug" element={<PostDetail />} />
        <Route path="/all-posts" element={<AllPosts />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/user-profile" element={<UserProfileCard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account-restoration" element={<AccountRestoration />} />
        <Route
          path="/api/v1/user/profile/view/f/:userId"
          element={<PublicUserProfile />}
        />
        <Route path="/search-results" element={<SearchResultsPage />} />
        <Route path="/notifications" element={<NotificationDropdown />} />
      </Routes>
      {/* Conditionally render the Footer only on pages other than "/notifications" */}
      {location.pathname !== "/notifications" && <Footer />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
