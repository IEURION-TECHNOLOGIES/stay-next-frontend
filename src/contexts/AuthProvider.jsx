import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import API from "../utils/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/getMe");
      const u = res.data.user || null;

      if (u && u._id) {
        const normalized = { ...u, _id: u._id || u.id };
        setUser(normalized);
        setRole(normalized.role || "");
        localStorage.setItem("user", JSON.stringify(normalized));
        return normalized;
      } else {
        setUser(null);
        setRole("");
        localStorage.removeItem("user");
        return null;
      }
    } catch (err) {
      console.warn("fetchUser failed", err);
      setUser(null);
      setRole("");
      localStorage.removeItem("user");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const normalized = { ...parsed, _id: parsed._id || parsed.id };

      fetchUser().then((fetched) => {
        if (!fetched) {
          setUser(null);
          setRole("");
          localStorage.removeItem("user");
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

  const login = async (data) => {
    const res = await API.post("/auth/login", data);
    const u = res.data.user;
    const normalized = { ...u, _id: u._id || u.id };
    setUser(normalized);
    setRole(normalized.role);
    localStorage.setItem("user", JSON.stringify(normalized));
    if (u.token) localStorage.setItem("token", u.token); // ✅
    return normalized;
  };

  const adminLogin = async (data) => {
    const res = await API.post("/auth/admin/login", data);
    const u = res.data.user;
    const normalized = { ...u, _id: u._id || u.id };
    setUser(normalized);
    setRole(normalized.role);
    localStorage.setItem("user", JSON.stringify(normalized));
    if (u.token) localStorage.setItem("token", u.token); // ✅
    return normalized;
  };

  const superAdminLogin = async (data) => {
    const res = await API.post("/auth/superadmin/login", data);
    const u = res.data.user;
    const normalized = { ...u, _id: u._id || u.id };
    setUser(normalized);
    setRole(normalized.role);
    localStorage.setItem("user", JSON.stringify(normalized));
    if (u.token) localStorage.setItem("token", u.token); // ✅
    return normalized;
  };

  const logout = async () => {
    await API.post("/auth/logout").catch(() => {});
    setUser(null);
    setRole("");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅
  };

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