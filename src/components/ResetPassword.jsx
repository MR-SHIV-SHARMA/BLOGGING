import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ Fix: useParams instead of useSearchParams
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams(); // ✅ Get token from URL path
  const navigate = useNavigate();
  const [status, setStatus] = useState("input"); // input, loading, success, error
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Reset token is missing");
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStatus("loading");

    try {
      console.log("Sending token:", token); // ✅ Debugging line
      const response = await axios.post(
        `/auth/password/reset-password/${token}`, // ✅ Ensure token is in the URL
        {
          newPassword: passwords.password, // ✅ Ensure correct payload
        }
      );

      if (response.data.success) {
        setStatus("success");
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      console.error("Reset error:", error.response?.data);
      setStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred during password reset"
      );
      toast.error(error.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {status === "input" && (
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="password" className="sr-only">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="New Password"
                    value={passwords.password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm New Password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        )}

        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Resetting Your Password...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we update your password.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Password Reset Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login Now
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Password Reset Failed
            </h2>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/support")}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
