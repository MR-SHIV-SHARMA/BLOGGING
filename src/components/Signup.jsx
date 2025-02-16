import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const onSignup = async (event) => {
    event.preventDefault();
    setError(null);
    setButtonDisabled(true);

    // Validate that all fields are provided
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      setButtonDisabled(false);
      return;
    }

    try {
      setLoading(true);

      // Use "name" as key instead of "username" if your backend expects it
      const signupData = {
        name: username,
        email: email,
        password: password,
      };

      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/auth/auth/register",
        signupData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Signup success", response.data);
      toast.success("Please check your email", { autoClose: 15000 });
      navigate("/Account_verification_email");
    } catch (err) {
      console.error("Signup failed", err);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
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
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Join us to start your journey.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSignup} className="space-y-6">
          <div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700 transition-all"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={buttonDisabled || loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
