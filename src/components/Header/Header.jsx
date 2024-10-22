import React from "react";
import { Container, Logo, LogoutBut } from "../index.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaListAlt,
  FaPlusCircle,
} from "react-icons/fa";

function Header() {
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);

  const navItems = [
    {
      name: "Home",
      slug: "/",
      icon: <FaHome size={24} />, // Icon size increased
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      icon: <FaSignInAlt size={24} />,
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      icon: <FaUserPlus size={24} />,
      active: !authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      icon: <FaListAlt size={24} />,
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      icon: <FaPlusCircle size={24} />,
      active: authStatus,
    },
  ];

  return (
    <header className="py-1 shadow bg-gray-300">
      <Container>
        <nav className="flex items-center">
          <div className="mr-4">
            <Link to="/">
              <Logo width="60px" />
            </Link>
          </div>
          <ul className="flex ml-auto space-x-4 sm:space-x-6">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className="inline-flex items-center space-x-2 px-3 sm:px-6 py-2 text-sm sm:text-lg font-semibold duration-200 hover:bg-blue-100 rounded-full"
                  >
                    {/* Show icon on mobile, hide name */}
                    <span className="block md:hidden">{item.icon}</span>

                    {/* Show name on desktop, hide icon */}
                    <span className="hidden md:block">{item.name}</span>
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBut />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
