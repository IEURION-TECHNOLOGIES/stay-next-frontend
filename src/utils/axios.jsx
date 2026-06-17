// src/utils/axios.js
import axios from "axios";

// ✅ Automatically detect environment

// ✅ Switch BASE URL automatically
const AUTH_BASE_URL = "https://stay-next-auth-service-4.onrender.com/api"; // Production

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
