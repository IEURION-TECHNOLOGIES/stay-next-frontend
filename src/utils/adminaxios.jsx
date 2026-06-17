import axios from "axios";

const isLocalhost = window.location.hostname === "localhost";

const ADMIN_BASE_URL = isLocalhost
  ? "http://localhost:3001/api/admin"
  : "https://stay-next-admin-service.onrender.com/api/admin";

const ADMINAPI = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
});

ADMINAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ✅ read token
  if (token) config.headers["Authorization"] = `Bearer ${token}`;

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default ADMINAPI;