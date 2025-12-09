import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AGENTAPI from "../utils/agentaxios";
import LoadingModal from "../utils/loader"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, role, loading } = useAuth();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifLoading, setVerifLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      if (!role) {
        setVerifLoading(false);
        return;
      }

      if (role === "agent") {
        try {
          const res = await AGENTAPI.get("/agents/verification/my", {
            params: { userId: user._id },
          });
          setVerificationStatus(res.data?.profile?.status?.toLowerCase() || "pending");
        } catch (err) {
          console.error("Failed to fetch agent verification:", err);
          setVerificationStatus("pending");
        } finally {
          setVerifLoading(false);
        }
      } else {
        setVerifLoading(false);
      }
    };

    fetchVerification();
  }, [role]);

  if (loading || verifLoading) {
    return <LoadingModal message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.isNewUser && role !== "superadmin" && role !== "admin" && location.pathname !== "/set-role") {
    return <Navigate to="/set-role" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // // Agent verification logic
  // if (role === "agent") {
  //   if ((verificationStatus === "pending" || verificationStatus === "rejected") &&
  //       location.pathname !== "/agent-verification") {
  //     return <Navigate to="/agent-verification" replace />;
  //   }

  //   // Approved agent — allow dashboard
  //   if (verificationStatus === "approved") {
  //     return <Navigate to="/agent-dashboard/overview" replace />;
  //   }
  // }

  return children;
};

export default ProtectedRoute;
