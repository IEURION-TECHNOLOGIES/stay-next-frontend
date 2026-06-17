import axios from "axios";

const ADMIN_BASE_URL = "https://stay-next-admin-service.onrender.com/api/admin";
const AUTH_BASE_URL = "https://stay-next-auth-service-4.onrender.com/api";

// 🔐 Instance for hitting Auth Services
export const API = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

// 📊 Instance for hitting Admin Services (e.g., /agents)
export const AdminAPI = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
});

// 🚀 Clean reusable interceptor function
const injectToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
};

// ✅ Attach the clean interceptor to BOTH instances cleanly
API.interceptors.request.use(injectToken, (err) => Promise.reject(err));
AdminAPI.interceptors.request.use(injectToken, (err) => Promise.reject(err));

export default API;
