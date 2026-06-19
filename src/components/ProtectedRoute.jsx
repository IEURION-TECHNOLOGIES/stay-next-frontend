import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AGENTAPI from "../utils/agentaxios";
import LoadingModal from "../utils/loader";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, role, loading } = useAuth();
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

  // =====================
  // LOADING
  // =====================
  if (loading || verifLoading) {
    return <LoadingModal message="Checking access..." />;
  }

  // =====================
  // AUTH
  // =====================
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // =====================
  // STEP 1: FORCE ROLE
  // =====================
  if (user?.isNewUser && location.pathname !== "/set-role") {
    return <Navigate to="/set-role" replace />;
  }

  // =====================
  // ROLE PERMISSION
  // =====================
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // =====================
  // AGENT STRICT FLOW
  // =====================
  if (role === "agent") {
    /**
     * STEP 2: NO VERIFICATION RECORD → POLICY FIRST
     */
    if (
      verificationStatus === null &&
      location.pathname !== "/policy" &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/policy" replace />;
    }

    /**
     * STEP 3: ON VERIFICATION PAGE WITH NO RECORD → ALLOW
     */
    if (
      verificationStatus === null &&
      location.pathname === "/agent-verification"
    ) {
      return children;
    }

    /**
     * PENDING OR REJECTED → STAY ON VERIFICATION PAGE
     */
    if (
      (verificationStatus === "pending" || verificationStatus === "rejected") &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/agent-verification" replace />;
    }

    /**
     * APPROVED — check if token exists in localStorage
     * No token = never properly logged in → force login
     * Token exists = properly authenticated → allow through
     */
    if (verificationStatus === "approved") {
      const token = localStorage.getItem("token");

      if (!token) {
        // First time approved, no token saved — force login to fix this
        return (
          <Navigate
            to="/login"
            replace
            state={{
              message:
                "Your account has been approved! Please log in to continue.",
            }}
          />
        );
      }

      // Token exists but on wrong page — redirect to dashboard
      if (
        location.pathname === "/agent-verification" ||
        location.pathname === "/policy"
      ) {
        return <Navigate to="/agent-dashboard/overview" replace />;
      }

      // Token exists, on correct page — allow through
      return children;
    }
  }

  return children;
};

export default ProtectedRoute;
