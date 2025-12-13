// src/api/axiosInstance.js
import axios from "axios";
import { refreshAccessToken } from "./authApi";
import { getToken, setToken, clearAuth } from "./tokenUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 🚀 đổi về domain Auth Service
  withCredentials: false,
});

// --- REQUEST INTERCEPTOR: auto gắn token ---
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR: auto refresh token ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // ❗ Nếu lỗi không phải 401 → trả luôn
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ❗ Nếu đã thử refresh rồi → logout luôn
    if (original._retry) {
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    original._retry = true;

    // ----- Xử lý hàng đợi refresh 1 lần -----
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      setToken(newToken);
      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
