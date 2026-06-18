// src/utils/agentAxios.js
import axios from "axios";

const isLocalhost = window.location.hostname === "localhost";

const AGENT_BASE_URL = isLocalhost
  ? "http://localhost:3005/api"
  : "https://stay-next-agent-service.onrender.com/api";

const AGENTAPI = axios.create({
  baseURL: AGENT_BASE_URL,
  withCredentials: true,
});

AGENTAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default AGENTAPI;
