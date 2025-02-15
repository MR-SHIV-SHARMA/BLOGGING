import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AccountRestoration() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestRestoration = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://bg-io.vercel.app/api/v1/user/account/request-restoration",
        { email }
      );
      if (response.data.success) {
        toast.success("Account restoration request sent successfully!");
        setEmail("");
      } else {
        toast.error(response.data.message || "Failed to request restoration.");
      }
    } catch (error) {
      console.error("Error requesting account restoration:", error);
      toast.error("An error occurred while requesting account restoration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Restore Account</h2>
      <form onSubmit={requestRestoration}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          {isLoading ? "Sending..." : "Request Account Restoration"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default AccountRestoration;
