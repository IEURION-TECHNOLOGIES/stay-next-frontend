import axios from "axios";

const ADMIN_BASE_URL = "https://stay-next-admin-service.onrender.com/api/admin";

const API = axios.create({
  baseURL: ADMIN_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default API;