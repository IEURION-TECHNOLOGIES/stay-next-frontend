import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const VerificationStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const status = location.state?.status || "pending";

  const statusConfig = {
    pending: { message: "⏳ Verification is under review.", button: null },
    success: { message: "🎉 Your verification was approved!", button: { text: "OK", action: () => navigate("/agent-dashboard/overview") } },
    failed: { message: "❌ Verification failed. Please try again.", button: { text: "Try Again", action: () => navigate("/agent-verification") } },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-4" />
        <p className="text-lg font-semibold mb-6">{config.message}</p>
        {config.button && (
          <button onClick={config.button.action} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
            {config.button.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;
