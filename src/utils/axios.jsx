import axios from "axios";

const AUTH_BASE_URL = "https://stay-next-auth-service-4.onrender.com/api";
const ADMIN_BASE_URL = "https://stay-next-admin-service.onrender.com/api";

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


// Attach interceptor to BOTH instances to guarantee headers are appended dynamically
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

API.interceptors.request.use(injectToken, (err) => Promise.reject(err));
AdminAPI.interceptors.request.use(injectToken, (err) => Promise.reject(err));

export default API;
