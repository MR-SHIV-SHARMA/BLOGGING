import React from "react";
import { useDispatch } from "react-redux";
import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { clearPosts } from "../../store/postsSlice";

function LogoutBut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = () => {
    authService
      .logout()
      .then(() => {
        dispatch(logout());
        dispatch(clearPosts());
        navigate("/");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <button
      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-700 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
      onClick={logoutHandler}
    >
      <span className="flex items-center gap-2">
        {/* Animated Icon */}
        <FaSignOutAlt
          size={20}
          className="transition-transform duration-300 ease-in-out transform hover:rotate-180"
        />
        {/* Text */}
        <span className="hidden md:inline">Logout</span>
      </span>
    </button>
  );
}

export default LogoutBut;
