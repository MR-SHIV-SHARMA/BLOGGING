import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in by looking for the accessToken in cookies
  useEffect(() => {
    // Log all cookies to check if accessToken is present
    console.log("Cookies: ", Cookies.get("accessToken"));
    const token = localStorage.getItem("accessToken"); // Retrieve the token from cookies

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
        { name: "Profile", slug: "/user-profile" },
        {
          name: "Logout",
          component: (
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-700 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
              onClick={logoutHandler}
            >
              <span className="flex items-center gap-2">
                <FaSignOutAlt
                  size={20}
                  className="transition-transform duration-300 ease-in-out transform hover:rotate-180"
                />
                <span className="hidden md:inline">Logout</span>
              </span>
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
    <header className="py-1 shadow bg-gray-300">
      <nav className="flex items-center justify-between">
        <Link to="/">
          <img
            src="/NextGen-Thinkers-Logo.png"
            alt="NextGen Thinkers Logo"
            width="60px"
          />
        </Link>

        {/* Toggle Menu Button for Small Screens */}
        <button
          className="md:hidden ml-auto p-2 text-lg focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6 ml-auto">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.component ? (
                // Render LogoutBut directly if present
                <span className="text-lg font-semibold px-3 py-2 rounded-md">
                  {item.component}
                </span>
              ) : (
                <button
                  onClick={() => navigate(item.slug)}
                  className={`text-lg font-semibold px-3 py-2 rounded-md ${
                    currentPath === item.slug
                      ? "bg-blue-500 text-white" // Active page styling
                      : "hover:text-blue-300 hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Sidebar Menu for Small Devices */}
        <div
          className={`fixed top-0 right-0 h-full w-2/3 bg-gray-800 text-white z-50 transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Close Button in Menu */}
          <button
            className="absolute top-4 right-4 p-2 text-lg text-white"
            onClick={toggleMenu}
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
                  <button
                    onClick={() => {
                      navigate(item.slug);
                      toggleMenu();
                    }}
                    className={`text-lg font-semibold px-4 py-2 w-full text-left ${
                      currentPath === item.slug
                        ? "bg-blue-500 text-white" // Active page styling
                        : "hover:text-blue-300 hover:bg-gray-600"
                    }`}
                  >
                    {item.name}
                  </button>
                )}
                <div className="border-t-2 border-blue-500 w-full"></div>{" "}
                {/* Full-width line */}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
