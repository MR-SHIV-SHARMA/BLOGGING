import React from "react";
import { useDispatch } from "react-redux";
import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa"; // Importing logout icon

function LogoutBut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = () => {
    authService
      .logout()
      .then(() => {
        dispatch(logout());
        navigate("/"); // Navigate to home after logout
        window.location.reload(); // Refresh the page
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <button
      className="inline-flex items-center space-x-2 px-3 sm:px-6 py-2 text-sm sm:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full duration-200"
      onClick={logoutHandler}
    >
      {/* Show icon on mobile, hide name */}
      <span className="block md:hidden">
        <FaSignOutAlt size={24} />
      </span>

      {/* Show "Logout" text on desktop, hide icon */}
      <span className="hidden md:block">Logout</span>
    </button>
  );
}

export default LogoutBut;
