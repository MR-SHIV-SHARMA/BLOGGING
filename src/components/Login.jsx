import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/auth/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data?.data?.accessToken &&
        response.data?.data?.refreshToken
      ) {
        const { accessToken, refreshToken } = response.data.data;
        const userId = response.data.data.user._id;

        // Set cookies
        Cookies.set("accessToken", accessToken);
        Cookies.set("refreshToken", refreshToken);
        Cookies.set("userId", userId);

        toast.success("Login successful!");
        login();
        navigate("/");
      } else {
        throw new Error("Token data not received");
      }
    } catch (err) {
      let errorMessage = err.response?.data || err.message;
      
      if (errorMessage.includes('<!DOCTYPE html>')) {
        const match = errorMessage.match(/Error: (.*?)<br>/);
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }

      if (errorMessage.includes('Account deactivated')) {
        errorMessage = "Your account has been deactivated. Please contact support to restore your account.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/password/forgot-password", {
        email: forgotEmail,
      });
      setMessage("Password reset instructions have been sent to your email.");
    } catch (error) {
      setMessage("An error occurred while sending reset instructions.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-24">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              className="w-full"
            />
          </span>
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Sign in to continue to your account.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4 text-center">
            {error}
            {error.includes('deactivated') && (
              <div className="mt-2">
                <Link to="/help" className="text-blue-600 hover:text-blue-800 underline">
                  Visit Help Center
                </Link>
              </div>
            )}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="password"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
                setForgotEmail(email);
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 transition-all duration-300"
            >
              Forgot Password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                type="email"
                name="forgotEmail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Reset Link
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(false);
              }}
              className="w-full text-center text-blue-600 hover:text-blue-700 transition-all duration-300"
            >
              Back to Login
            </button>
          </form>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md mt-4 text-center">
            {message}
          </div>
        )}

        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
