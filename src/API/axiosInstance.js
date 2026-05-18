import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: "http://192.168.100.149:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error("Network error. Please check your internet.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/forgot-password") ||
      originalRequest.url.includes("/auth/reset-password") ||
      originalRequest.url.includes("/auth/verify-email");

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.clear();

          toast.error("Session expired. Please login again.");

          window.location.href = "/";

          return Promise.reject(error);
        }

        const response = await axios.post(
          "http://192.168.100.149:3000/api/v1/auth/refresh",
          {
            refreshToken,
          }
        );

        const newAccessToken =
          response.data?.data?.accessToken;

        localStorage.setItem(
          "accessToken",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        localStorage.clear();

        toast.error("Session expired. Please login again.");

        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    switch (status) {
      case 400:
        toast.error(
          error.response.data?.message || "Bad request"
        );
        break;

      case 401:
        toast.error(
          error.response.data?.message || "Unauthorized"
        );
        break;

      case 403:
        toast.error(
          error.response.data?.message || "Access denied"
        );
        break;

      case 404:
        toast.error(
          error.response.data?.message || "Resource not found"
        );
        break;

      case 422:
        toast.error(
          error.response.data?.message || "Validation error"
        );
        break;

      default:
        if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(
            error.response.data?.message ||
            "Something went wrong"
          );
        }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;