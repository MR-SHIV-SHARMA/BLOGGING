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

    try {
      setLoading(true);
      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/auth/auth/register",
        { email, password, username }
      );

      console.log("Signup success", response.data);
      toast.success("Please check your email", { autoClose: 15000 });
      navigate("/Account_verification_email");
    } catch (err) {
      console.log("Signup failed", err);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-12 px-4 bg-gray-200">
      <div className="mx-auto w-full max-w-lg bg-white rounded-xl p-6 border border-gray-300 shadow-md">
        <div className="mb-3 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <img
              src="/NextGen-Thinkers-Logo.png"
              alt="NextGen Thinkers Logo"
              width="100%"
            />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-gray-800">
          Sign up to create an account
        </h2>
        <p className="mt-1 text-center text-base text-gray-600">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="font-medium text-blue-600 transition-all duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
        <form onSubmit={onSignup} className="mt-4">
          <div className="space-y-4">
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="absolute top-3 right-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={buttonDisabled || loading}
            >
              {loading ? "Loading..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
