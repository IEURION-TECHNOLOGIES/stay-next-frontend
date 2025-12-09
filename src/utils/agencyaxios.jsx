// src/utils/agentAxios.js
import axios from "axios";

// ✅ Detect environment
const isLocalhost = window.location.hostname === "localhost";

// ✅ Switch base URL automatically
const AGENT_BASE_URL = isLocalhost
  ? "http://localhost:3005/api" // Local agent service
  : "https://stay-next-agent-service.onrender.com/api"; // Production agent service

const AGENCYAPI = axios.create({
  baseURL: AGENT_BASE_URL,
  withCredentials: true,
});

// ✅ Only set Content-Type for non-FormData
AGENCYAPI.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default AGENCYAPI;
