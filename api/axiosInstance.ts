import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: "http://172.20.10.5:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const success = await useAuthStore.getState().refreshAuthToken();
        if (success) {
          // Update the auth header with new token
          const { accessToken } = useAuthStore.getState();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        await useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
