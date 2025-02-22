import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios"; // ✅ Axios Import किया
import "./index.css";
import Cookies from "js-cookie";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./Routes/ProtectedRoute";
import { PublicRoute } from "./Routes/PublicRoute";
import { NotificationProvider } from './context/NotificationContext';

// Update axios defaults
axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "https://bg-io.vercel.app/api/v1";
axios.defaults.baseURL = "http://localhost:3000/api/v1";

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
    <AuthProvider>
      <NotificationProvider>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes - Redirect to home if logged in */}
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

          {/* Protected Routes - Redirect to login if not authenticated */}
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
          <Route
            path="/api/v1/user/profile/view/f/:userId"
            element={<PublicUserProfile />}
          />
          <Route path="/search-results" element={<SearchResultsPage />} />
        </Routes>
        {/* Conditionally render the Footer only on pages other than "/notifications" */}
        {location.pathname !== "/notifications" && <Footer />}
      </NotificationProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Add this flag to track if we're already refreshing
let isRefreshing = false;

// Update axios interceptor
axios.interceptors.response.use(
  (response) => {
    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      const { accessToken, refreshToken } = response.data.data;
      Cookies.set("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if we're not already refreshing and it's a 401 error
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        // If no refresh token exists, redirect to login
        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.get("/auth/auth/refresh-token", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (response.status === 200) {
          const { accessToken, refreshToken } = response.data.data;
          Cookies.set("accessToken", accessToken);
          Cookies.set("refreshToken", refreshToken);
          isRefreshing = false;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Clear cookies and redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
