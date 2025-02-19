import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaTrash } from "react-icons/fa";
import NotificationDropdown from "./NotificationDropdown";
import Cookies from "js-cookie";
import SearchBar from "./SearchBar";
import axios from "axios";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for the accessToken in localStorage.
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const logoutHandler = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      await axios.post(
        "https://bg-io.vercel.app/api/v1/auth/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const currentPath = window.location.pathname;

  return (
    <header className="shadow-lg bg-gray-900 sticky top-0 z-50">
      <nav className="container mx-auto px-4 flex items-center justify-between relative">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              className="w-12 h-12 md:w-16 md:h-16" // Adjusted for mobile
            />
          </Link>
        </div>

        {/* Desktop Navigation Section */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Search Bar - Hidden on mobile */}
              <div className="flex justify-center items-center">
                <SearchBar />
              </div>

              {/* Notification - Always visible */}
              <div className="flex justify-center items-center">
                <NotificationDropdown />
              </div>

              {/* Desktop Links - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-x-6 ml-4">
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

              {/* Logout Button - Hidden on mobile */}
              <button
                onClick={logoutHandler}
                className="hidden md:flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg shadow-md transition"
                aria-label="Logout"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-x-6 ml-4">
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
            className="md:hidden p-2 text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
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
            className="w-full flex justify-end mb-8 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Close Menu"
          >
            <FaTimes size={24} />
          </button>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-6">
            {isLoggedIn ? (
              <>
                <Link to="/" className="text-white" onClick={toggleMenu}>
                  Home
                </Link>
                <Link
                  to="/all-posts"
                  className="text-white"
                  onClick={toggleMenu}
                >
                  All Posts
                </Link>
                <Link
                  to="/add-post"
                  className="text-white"
                  onClick={toggleMenu}
                >
                  Add Post
                </Link>
                <Link
                  to="/user-profile"
                  className="text-white"
                  onClick={toggleMenu}
                >
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
              <div className="flex flex-col gap-6">
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
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
