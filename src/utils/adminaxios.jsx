import axios from "axios";

<<<<<<< HEAD
const ADMIN_BASE_URL = "https://stay-next-admin-service.onrender.com/api/admin";
=======
const AUTH_BASE_URL = "https://stay-next-auth-service-4.onrender.com/api";
const ADMIN_BASE_URL = "https://stay-next-admin-service.onrender.com/api/admin";

// 🔐 Instance for hitting Auth Services
export const API = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});
>>>>>>> 8b1d509582446aa0ec269aea294c995dbdf3860d

// 📊 Instance for hitting Admin Services (e.g., /agents)
export const AdminAPI = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
});

<<<<<<< HEAD
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

=======
// Attach interceptor to BOTH instances to guarantee headers are appended dynamically
const injectToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
>>>>>>> 8b1d509582446aa0ec269aea294c995dbdf3860d
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
};

<<<<<<< HEAD
export default API;
=======
API.interceptors.request.use(injectToken, (err) => Promise.reject(err));
AdminAPI.interceptors.request.use(injectToken, (err) => Promise.reject(err));

export default API;
>>>>>>> 8b1d509582446aa0ec269aea294c995dbdf3860d
