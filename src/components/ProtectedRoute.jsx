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
        setVerificationStatus(status); // approved | pending | rejected
      } catch {
        // ❗ No record yet → NOT submitted
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
  if (
    user?.isNewUser &&
    location.pathname !== "/set-role"
  ) {
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
     * STEP 2: POLICY (ALWAYS BEFORE VERIFICATION)
     */
    if (
      verificationStatus === null &&
      location.pathname !== "/policy" &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/policy" replace />;
    }

    /**
     * STEP 3: VERIFICATION
     */
    if (
      verificationStatus === null &&
      location.pathname === "/agent-verification"
    ) {
      return children;
    }

    /**
     * PENDING OR REJECTED
     */
    if (
      (verificationStatus === "pending" ||
        verificationStatus === "rejected") &&
      location.pathname !== "/agent-verification"
    ) {
      return <Navigate to="/agent-verification" replace />;
    }

    /**
     * APPROVED
     */
    if (
      verificationStatus === "approved" &&
      (location.pathname === "/agent-verification" ||
        location.pathname === "/policy")
    ) {
      return <Navigate to="/agent-dashboard/overview" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
