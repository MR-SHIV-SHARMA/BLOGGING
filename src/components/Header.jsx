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

  // Navigation items based on login status.
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
          name: "Notifications",
          component: <NotificationDropdown />,
        },
        {
          name: "Logout",
          component: (
            <button
              onClick={logoutHandler}
              className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg shadow-md transition"
              aria-label="Logout"
            >
              <FaSignOutAlt />
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

  const currentPath = window.location.pathname;

  return (
    <header className="shadow-lg bg-gray-900 sticky top-0 z-50">
      <nav className="container mx-auto px-4 flex items-center justify-between relative">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              className="w-16 h-16"
            />
          </Link>
          {/* Render the new SearchBar component for desktops */}
          <div className="hidden md:flex ml-4">
            <SearchBar />
          </div>
        </div>
        <div className="flex items-center">
          <button
            className="md:hidden p-2 text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.component ? (
                  <span className="text-lg font-semibold">
                    {item.component}
                  </span>
                ) : (
                  <Link
                    to={item.slug}
                    className={`flex items-center text-lg font-semibold px-4 py-1 rounded-lg transition ${
                      currentPath === item.slug
                        ? "bg-purple-600 text-white"
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
      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 p-2 text-lg text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Close Menu"
        >
          <FaTimes size={24} />
        </button>
        <div className="relative p-4">
          <SearchBar />
        </div>
        <ul className="flex flex-col items-start p-6 space-y-4 mt-4">
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
                      ? "bg-purple-600 text-white"
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
    </header>
  );
}

export default Header;
