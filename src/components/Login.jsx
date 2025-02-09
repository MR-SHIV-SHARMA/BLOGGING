import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Sending login request to API...");
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/auth/login",
        { email, password },
        { withCredentials: true }
      );
      console.log("API Response:", response.data);

      const { accessToken, refreshToken } = response.data.data;
      if (accessToken && refreshToken) {
        // Store tokens in cookies
        Cookies.set("accessToken", accessToken, { expires: 1, secure: true });
        Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true });

        // Store tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        toast.success("Login successful!");
        navigate("/"); // Redirect after successful login
        window.location.reload();
      } else {
        throw new Error("Tokens not received from API");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-12 px-4 bg-gray-200">
      <div className="mx-auto w-full max-w-md bg-white rounded-xl p-10 border border-gray-300 shadow-md">
        <div className="mb-4 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              width="100%"
            />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-base text-gray-600">
          Don&apos;t have an account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-blue-600 transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        <form onSubmit={login} className="mt-8">
          <div className="space-y-5">
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email or username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
