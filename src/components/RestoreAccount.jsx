import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const RestoreAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const restoreAccount = async () => {
      try {
        const response = await axios.get(
          `/user/account/restore-account/${token}`
        );
        if (response.data.success) {
          setStatus("success");
          toast.success("Account restored successfully!");
          // Redirect to login after 5 seconds
          setTimeout(() => {
            navigate("/login");
          }, 5000);
        }
      } catch (error) {
        console.error("Restoration error:", error);
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || "Failed to restore account"
        );
        toast.error(error.response?.data?.message || "Restoration failed");
      }
    };

    if (token) {
      restoreAccount();
    } else {
      setStatus("error");
      setErrorMessage("Restoration token is missing");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Restoring Your Account...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we restore your account.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Account Restored Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your account has been restored and is now active.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You will be redirected to the login page in 5 seconds...
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Restoration Failed
            </h2>
            <p className="mt-2 text-gray-600">
              {errorMessage ||
                "We couldn't restore your account. The link might be expired or invalid."}
            </p>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
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

export default RestoreAccount;
