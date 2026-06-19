import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AGENTAPI from "../utils/agentaxios";
import LoadingModal from "../utils/loader";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, role, loading, clearAuthSession } = useAuth();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(undefined);
  const [verifLoading, setVerifLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      if (role !== "agent") {
        setVerifLoading(false);
        return;
      }
      try {
        const res = await AGENTAPI.get("/agents/verification/my", {
          params: { userId: user._id },
        });
        const status = res.data?.profile?.status || null;
        setVerificationStatus(status);
      } catch {
        setVerificationStatus(null);
      } finally {
        setVerifLoading(false);
      }
    };
    fetchVerification();
  }, [role, user?._id]);

  if (loading || verifLoading) {
    return <LoadingModal message="Checking access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isNewUser && location.pathname !== "/set-role") {
    return <Navigate to="/set-role" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role === "agent") {
    if (
      verificationStatus === null &&
      location.pathname !== "/policy" &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/policy" replace />;
    }

    if (
      verificationStatus === null &&
      location.pathname === "/agent-verification"
    ) {
      return children;
    }

    if (
      (verificationStatus === "pending" || verificationStatus === "rejected") &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/agent-verification" replace />;
    }

    /* * ✅ UPDATED: If an agent's status is approved, clear the temporary, 
     * unapproved verification session context and force them to /login
     */
    if (verificationStatus === "approved") {
      clearAuthSession(); 
      return (
        <Navigate
          to="/login"
          replace
          state={{ message: "Your account has been approved! Please log in to securely access your dashboard." }}
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
