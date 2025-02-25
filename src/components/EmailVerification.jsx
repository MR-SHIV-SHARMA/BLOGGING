import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const EmailVerification = () => {
  const { token } = useParams();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Email Verification
        </h2>
        <div className="mt-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 text-blue-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Verifying your email...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-2 text-green-500">
              <CheckCircle className="w-8 h-8" />
              <p>Email Verified! Redirecting...</p>
            </div>
          )}
          {status === "alreadyVerified" && (
            <div className="flex flex-col items-center gap-2 text-green-500">
              <CheckCircle className="w-8 h-8" />
              <p>Email Already Verified! Redirecting...</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-2 text-red-500">
              <XCircle className="w-8 h-8" />
              <p>{errorMessage}</p>
            </div>
          )}
          {status === "noToken" && (
            <div className="flex flex-col items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-8 h-8" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
