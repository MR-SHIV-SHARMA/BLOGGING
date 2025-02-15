import axios from "axios";
import Cookies from "js-cookie";

// Create an Axios instance with a base URL and withCredentials set to true
const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Attach the access token from cookies to every request if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables to handle refresh token queueing
let isRefreshing = false;
let failedQueue = [];

// Helper to process the failed requests queue after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to catch 401 errors and try refreshing tokens
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If a refresh call is already in progress, queue this request
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        // Call refresh-token endpoint
        const refreshResponse = await axios.post(
          "http://localhost:3000/api/v1/auth/auth/refresh-token",
          {},
          { withCredentials: true }
        );
        const { accessToken, refreshToken } = refreshResponse.data.data;

        if (accessToken && refreshToken) {
          // Update cookies with new tokens
          Cookies.set("accessToken", accessToken, { expires: 1, secure: true });
          Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true });

          // Update the default authorization header for future requests
          axiosClient.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
          processQueue(null, accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = "Bearer " + accessToken;
          return axiosClient(originalRequest);
        } else {
          throw new Error("Tokens not received during refresh");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient; 