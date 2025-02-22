import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import Cookies from "js-cookie";
import SearchBar from "./SearchBar";
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { counts, isLoading } = useNotifications();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const logoutHandler = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        console.error("No access token found in cookies");
        return;
      }

      await axios.post(
        "/auth/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });

      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="shadow-lg bg-gray-900 sticky top-0 z-50">
      <nav className="container mx-auto px-4 flex items-center justify-between relative">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              className="w-12 h-12 md:w-16 md:h-16"
            />
          </Link>
        </div>

        {/* Desktop Navigation Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex justify-center items-center">
                <SearchBar />
              </div>

              {/* Notification Bell with unread count badge */}
              <div className="relative flex justify-center items-center text-white">
                <Link to="/notifications">
                  <FaBell size={24} />
                  {!isLoading && counts.unread > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {counts.unread}
                    </span>
                  )}
                </Link>
              </div>

              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-x-6">
                <Link to="/" className="text-white">
                  Home
                </Link>
                <Link to="/all-posts" className="text-white">
                  All Posts
                </Link>
                <Link to="/add-post" className="text-white">
                  Add Post
                </Link>
                <Link to="/user-profile" className="text-white">
                  Profile
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={logoutHandler}
                className="hidden md:flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg shadow-md transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-x-6">
              <Link to="/" className="text-white">
                Home
              </Link>
              <Link to="/login" className="text-white">
                Login
              </Link>
              <Link to="/signup" className="text-white">
                Signup
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={toggleMenu}
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <button
            className="w-full flex justify-end mb-8"
            onClick={toggleMenu}
          >
            <FaTimes size={24} />
          </button>

          <nav className="flex flex-col gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-white" onClick={toggleMenu}>
                  Home
                </Link>
                <Link to="/all-posts" className="text-white" onClick={toggleMenu}>
                  All Posts
                </Link>
                <Link to="/add-post" className="text-white" onClick={toggleMenu}>
                  Add Post
                </Link>
                <Link to="/user-profile" className="text-white" onClick={toggleMenu}>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logoutHandler();
                    toggleMenu();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg shadow-md transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="text-white" onClick={toggleMenu}>
                  Home
                </Link>
                <Link to="/login" className="text-white" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/signup" className="text-white" onClick={toggleMenu}>
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
