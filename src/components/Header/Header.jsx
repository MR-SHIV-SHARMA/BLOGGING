import React, { useState } from "react";
import { Container, Logo, LogoutBut } from "../index.js";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Header() {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "Add Post", slug: "/add-post", active: authStatus },
    { name: "Profile", slug: "/user-profile", active: authStatus },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Determine the active page based on the current URL path
  const currentPath = window.location.pathname;

  return (
    <header className="py-1 shadow bg-gray-300">
      <Container>
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo width="60px" />
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
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
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
                  </li>
                )
            )}
            {/* Logout Button for Desktop */}
            {authStatus && <LogoutBut />}
          </ul>

          {/* Sidebar Menu for Small Devices */}
          <div
            className={`fixed top-0 right-0 h-full w-2/3 bg-gray-800 text-white z-50 transform ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            {/* Close Button in Menu */}
            {menuOpen && (
              <button
                className="absolute top-4 right-4 p-2 text-lg text-white"
                onClick={toggleMenu}
              >
                <FaTimes size={24} />
              </button>
            )}

            {/* Menu Items for Mobile */}
            <ul className="flex flex-col items-start p-6 space-y-4 mt-10">
              {navItems.map(
                (item) =>
                  item.active && (
                    <li key={item.name} className="w-full">
                      <div className="flex flex-col w-full">
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
                        <div className="border-t-2 border-blue-500 w-full"></div>{" "}
                        {/* Full-width line */}
                      </div>
                    </li>
                  )
              )}
            </ul>

            {/* Decorative Line and Logout Button in Sidebar */}
            {authStatus && (
              <div className="absolute bottom-6 w-full px-6">
                <div className="border-t-2 border-blue-500 w-full"></div>{" "}
                {/* Full-width line */}
                <div className="mt-4 text-center">
                  <LogoutBut />
                </div>
              </div>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
