import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt, FaUser } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for the accessToken in cookies
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Retrieve the token from local storage
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Run on mount only

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const logoutHandler = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      // Sending POST request to logout API endpoint
      await axios.post(
        "https://bg-io.vercel.app/api/v1/auth/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
          withCredentials: true, // Include cookies in the request
        }
      );

      // Clear the access and refresh tokens from the cookies
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // Clear local storage tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Force recheck after logout
      setIsLoggedIn(false); // Explicitly set login state to false

      // Redirect to login page after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Define navigation items based on login state
  const navItems = isLoggedIn
    ? [
        { name: "Home", slug: "/" },
        { name: "All Posts", slug: "/all-posts" },
        { name: "Add Post", slug: "/add-post" },
        {
          name: "Profile",
          slug: "/user-profile",
          icon: <FaUser className="inline-block mr-2" />,
        },
        {
          name: "Logout",
          component: (
            <button
              className="flex items-center justify-center gap-2 px-24 py-2 sm:px-4 sm:py-1 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
              onClick={logoutHandler}
              aria-label="Logout"
            >
              <FaSignOutAlt className="inline-block" />
              <span className="hidden md:inline">Logout</span>
            </button>
          ),
        },
      ]
    : [
        { name: "Home", slug: "/" },
        { name: "Login", slug: "/login" },
        { name: "Signup", slug: "/signup" },
      ];

  // Get the current path to highlight the active menu item
  const currentPath = window.location.pathname;

  return (
    <header className="shadow-lg bg-gray-900 sticky top-0 z-50">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/NextGen-Thinkers-Logo.png"
            alt="NextGen Thinkers Logo"
            className="w-16 h-16"
          />
        </Link>

        {/* Toggle Menu Button for Small Screens */}
        <button
          className="md:hidden p-2 text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.component ? (
                <span className="text-lg font-semibold">{item.component}</span>
              ) : (
                <Link
                  to={item.slug}
                  className={`flex items-center text-lg font-semibold px-4 py-1 rounded-lg transition-all duration-300 ${
                    currentPath === item.slug
                      ? "bg-purple-600 text-white" // Active page styling
                      : "text-gray-300 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white z-50 transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Close Button in Menu */}
          <button
            className="absolute top-4 right-4 p-2 text-lg text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Close Menu"
          >
            <FaTimes size={24} />
          </button>

          {/* Menu Items for Mobile */}
          <ul className="flex flex-col items-start p-6 space-y-4 mt-10">
            {navItems.map((item) => (
              <li key={item.name} className="w-full">
                {item.component ? (
                  <span className="text-lg font-semibold px-4 py-2 w-full text-left">
                    {item.component}
                  </span>
                ) : (
                  <Link
                    to={item.slug}
                    onClick={toggleMenu}
                    className={`flex items-center text-lg font-semibold px-4 py-2 w-full text-left rounded-lg transition-all duration-300 ${
                      currentPath === item.slug
                        ? "bg-purple-600 text-white" // Active page styling
                        : "text-gray-300 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {item.icon && item.icon}
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
