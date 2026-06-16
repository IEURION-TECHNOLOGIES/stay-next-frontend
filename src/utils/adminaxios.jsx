// src/utils/adminAxios.js
import axios from "axios";

// ✅ Detect if running on localhost
const isLocalhost = window.location.hostname === "localhost";

// ✅ Automatically choose base URL
const ADMIN_BASE_URL = isLocalhost
  ? "http://localhost:3001/api/admin"            // ✅ Local admin backend
  : "https://stay-next-admin-service.onrender.com/api/admin"; // ✅ Production admin backend

const ADMINAPI = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
});

// ✅ Only set Content-Type for non-FormData requests
ADMINAPI.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default ADMINAPI;
