import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API } from "../../utils/axios";
import AGENTAPI from "../../utils/agentaxios";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";
import LoadingModal from "../../utils/loader";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const ref = query.get("ref");
    if (ref) setReferralCode(ref);
  }, [location.search]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const trackReferral = async (newUserId) => {
    if (!referralCode || !newUserId) return;
    try {
      await AGENTAPI.post("/agents/profile/track", { refCode: referralCode, newUserId });
    } catch {
      console.warn("Referral tracking failed");
    }
  };

  const redirectByRole = (role) => {
    if (role === 'visitor') navigate('/visitor-dashboard/overview');
    else if (role === 'agent') navigate('/agent-dashboard/overview');
    else if (role === 'handyman') navigate('/handyman-dashboard/overview');
    else if (role === 'superadmin') navigate('/super-admin-dashboard/overview');
    else navigate('/');
  };

  /* ===============================
     NORMAL REGISTRATION
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError([]);
    setSuccessMessage("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError(["Password must be at least 6 characters"]);
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/register", formData);
      const newUser = res.data.user;

      if (newUser?.id) await trackReferral(newUser.id);

      setSuccessMessage("Registration successful!");
      navigate("/register-success");
    } catch (err) {
      setError([err.response?.data?.message || "Registration failed"]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     GOOGLE REGISTER / LOGIN
  ================================ */
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError(["Google sign-in failed"]);
      return;
    }

    setLoading(true);
    setError([]);

    try {
      const res = await API.post("/auth/google", {
        token: credentialResponse.credential,
      });

      const u = res.data?.user;

      // ✅ Save token — backend now returns token in Google login response
      const token = res.data?.token || u?.token;
      if (token) {
        localStorage.setItem("token", token);
        console.log("✅ Google token saved to localStorage");
      } else {
        console.warn("⚠️ No token in Google login response");
      }

      await fetchUser();

      if (u?.isNewUser) {
        if (u?.id) await trackReferral(u.id);
        navigate("/set-role");
        return;
      }

      redirectByRole(u?.role);
    } catch (err) {
      setError([err.response?.data?.message || "Google sign-in failed"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingModal
        loading={loading}
        success={!!successMessage}
        error={error.length > 0}
        message="Creating your account..."
        successMessage={successMessage}
        errorMessage={error.join(", ")}
      />

      <div
        className="bg-gray-200 min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-realestate.jpg')" }}
      >
        <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
          </div>

          {error.length > 0 && (
            <div className="mb-4 text-center">
              {error.map((msg, i) => (
                <p key={i} className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 w-full rounded text-black"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border p-3 w-full rounded text-black"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="border p-3 w-full rounded text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white py-2 w-full rounded hover:bg-green-700"
            >
              Register
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-green-600 text-sm">
              Already have an account? Login
            </Link>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center my-3">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-500 text-sm">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError(["Google sign-in failed"])}
                text="continue_with"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
