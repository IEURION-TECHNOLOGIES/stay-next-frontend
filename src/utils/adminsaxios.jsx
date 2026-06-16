// src/utils/axios.js
import axios from "axios";

// ✅ Automatically detect environment
const isLocalhost = window.location.hostname === "localhost";

// ✅ Switch BASE URL automatically
const AUTH_BASE_URL = isLocalhost
  ? "http://localhost:5000/api/auth/admins" // Local
  : "https://stay-next-admin-service.onrender.com/api/admin"; // Production

const API = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

// ✅ Set JSON header only for JSON bodies
API.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default API;
