import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import "./index.css";
import Cookies from "js-cookie";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserProfileProvider } from "./context/UserProfile";
import { Toaster } from "react-hot-toast";
import App from "./App";

// Update axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://bg-io.vercel.app/api/v1";
// axios.defaults.baseURL = "http://localhost:3000/api/v1";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserProfileProvider>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <Toaster position="top-right" />
            </NotificationProvider>
          </AuthProvider>
        </UserProfileProvider>
      </BrowserRouter>
      <ReactQueryDevtools /> {/* Development में debugging के लिए */}
    </QueryClientProvider>
  </React.StrictMode>
);

// Add this flag to track if we're already refreshing
let isRefreshing = false;

// Update axios interceptor
axios.interceptors.response.use(
  (response) => {
    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      const { accessToken, refreshToken } = response.data.data;
      Cookies.set("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if we're not already refreshing and it's a 401 error
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        // If no refresh token exists, redirect to login
        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.get("/auth/auth/refresh-token", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (response.status === 200) {
          const { accessToken, refreshToken } = response.data.data;
          Cookies.set("accessToken", accessToken);
          Cookies.set("refreshToken", refreshToken);
          isRefreshing = false;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Clear cookies and redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
