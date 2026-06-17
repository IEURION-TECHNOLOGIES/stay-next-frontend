import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { API } from "../utils/axios"; // ✅ Named import ensures consistency with the new configuration

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // 🔄 Sync and validate user state on boot/refresh
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Force token header fallback for cross-domain fetchUser verification
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await API.get("/auth/getMe", { headers });
      const u = res.data.user || null;

      if (u && u._id) {
        const normalized = { ...u, _id: u._id || u.id };
        setUser(normalized);
        setRole(normalized.role || "");
        localStorage.setItem("user", JSON.stringify(normalized));
        return normalized;
      } else {
        clearAuthSession();
        return null;
      }
    } catch (err) {
      console.warn("fetchUser validation session expired or failed:", err.message);
      clearAuthSession();
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🧼 Centralized clear session utility
  const clearAuthSession = () => {
    setUser(null);
    setRole("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // 📦 Initialize App Auth State
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const normalized = { ...parsed, _id: parsed._id || parsed.id };

      fetchUser().then((fetched) => {
        if (!fetched) {
          clearAuthSession();
        } else {
          setUser(normalized);
          setRole(normalized.role || "");
        }
        setLoading(false);
      });
    } else {
      fetchUser();
    }
  }, []);

  // ⚙️ Unified processor to capture token structures flawlessly
  const processLoginResponse = (res) => {
    console.log("LOGIN RESPONSE PAYLOAD:", res.data);
    
    const u = res.data?.user;
    
    // 🚀 Bulletproof token extraction fallback sequence
    const token = res.data?.token || u?.token || res.data?.data?.token;
    
    if (token) {
      localStorage.setItem("token", token);
    } else {
      console.warn("No authentication token detected in the server response.");
    }
    
    const normalized = { ...u, _id: u?._id || u?.id };
    setUser(normalized);
    setRole(normalized.role || "");
    localStorage.setItem("user", JSON.stringify(normalized));
    
    return normalized;
  };

  /* =========================================
      AUTHENTICATION GATEWAYS
     ========================================= */

  const login = async (data) => {
    const res = await API.post("/auth/login", data);
    return processLoginResponse(res);
  };

  const adminLogin = async (data) => {
    const res = await API.post("/auth/admin/login", data);
    return processLoginResponse(res);
  };

  const superAdminLogin = async (data) => {
    const res = await API.post("/auth/superadmin/login", data);
    return processLoginResponse(res);
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await API.post("/auth/logout", {}, { headers }).catch(() => {});
    clearAuthSession();
  };

  /* =========================================
      STATE UPDATE & PASSWORD MANAGEMENT
     ========================================= */

  const updateUser = (updated, callback = () => {}) => {
    if (typeof updated === "function") {
      setUser((prev) => {
        const result = updated(prev);
        const merged = { ...(prev || {}), ...(result || {}) };
        const normalized = { ...merged, _id: merged._id || merged.id };
        setRole(normalized.role || prev?.role || "");
        localStorage.setItem("user", JSON.stringify(normalized));
        callback(normalized);
        return normalized;
      });
    } else {
      const merged = { ...(user || {}), ...(updated || {}) };
      const normalized = { ...merged, _id: merged._id || merged.id };
      setUser(normalized);
      setRole(normalized.role || "");
      localStorage.setItem("user", JSON.stringify(normalized));
      callback(normalized);
    }
  };

  const resetPassword = async ({ token, newPassword }) => {
    const res = await API.post(`/auth/reset-password/${token}`, { newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        adminLogin,
        superAdminLogin,
        logout,
        loading,
        fetchUser,
        updateUser,
        resetPassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
