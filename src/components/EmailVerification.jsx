import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EmailVerification = () => {
  const { token } = useParams(); // 🔥 Fix: Get token from path params
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("noToken");
      setErrorMessage(
        "Verification token is missing. Please use the link sent to your email."
      );
      return;
    }

    const verifyEmail = async () => {
      setStatus("loading");
      try {
        const response = await axios.get(`/auth/auth/verify-email/${token}`);

        if (response.data?.message?.includes("already verified")) {
          setStatus("alreadyVerified");
          toast.success("Email is already verified!");
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
        }

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || "Failed to verify email"
        );
        toast.error(
          error.response?.data?.message || "Email verification failed"
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-lg text-center">
        {status === "loading" && (
          <p className="text-blue-500">Verifying your email...</p>
        )}
        {status === "success" && (
          <p className="text-green-500">✅ Email Verified! Redirecting...</p>
        )}
        {status === "alreadyVerified" && (
          <p className="text-green-500">
            ✅ Email Already Verified! Redirecting...
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500">❌ {errorMessage}</p>
        )}
        {status === "noToken" && (
          <p className="text-red-500">⚠️ {errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
