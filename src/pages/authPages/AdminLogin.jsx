import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import useAuth from "../../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import API from "../../utils/axios";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, fetchUser } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const modalTimeoutRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false); // 👈 eye toggle

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin-dashboard/overview");
    else navigate("/unauthorized"); // 🚨 block non-admins
  };

  // --- Email/Password Login ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError([]);
    setLoading(true);

    try {
      const user = await adminLogin(formData);

      if (user?.role !== "admin") {
        setError(["Access denied. Only admins can log in here."]);
        setLoading(false);
        return;
      }

      await fetchUser();
      redirectByRole(user?.role);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) setError([msg]);
      else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.message));
      } else setError(["Unable to sign in. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError(["Google sign-in failed"]);
      return;
    }

    setLoading(true);
    setError([]);
    setModalMessage("Signing you in with Google...");
    setShowModal(true);

    try {
      const res = await API.post("/auth/admin/google", {
        token: credentialResponse.credential,
      });
      const user = res.data.user;

      if (user?.role !== "admin") {
        setError(["Access denied. Only admins can log in here."]);
        setShowModal(false);
        setLoading(false);
        return;
      }

      await fetchUser();
      setShowModal(false);
      redirectByRole(user.role);
    } catch (err) {
      console.log(err);
      setShowModal(false);
      setError(["Google login failed"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="bg-gray-200 text-white min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-realestate.jpg')" }}
      >
        <div className="relative bg-white shadow-lg p-6 rounded-lg max-w-md w-full z-10 backdrop-blur-sm bg-opacity-90 transition-all duration-200">
          {/* ✅ Admin Badge */}
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
            ADMIN
          </span>

          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Admin Login
            </h2>
            <p className="text-gray-500 text-sm text-center">
              Secure login for administrators
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-describedby="form-errors"
          >
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="border p-3 w-full rounded text-black"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />

            {/* Password Input with Eye */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="border p-3 w-full rounded text-black pr-10"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                />
              </button>
            </div>

            <div id="form-errors" className="space-y-1">
              {error.map((msg, i) => (
                <p key={i} className="text-red-500 text-sm" role="alert">
                  {msg}
                </p>
              ))}
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 w-full rounded hover:bg-red-700 transition duration-200 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center justify-center my-3">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-500 text-sm">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>
            <div className="flex flex-col space-y-3 items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError(["Google sign in failed"])}
                useOneTap
                text="continue_with"
              />
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Admin sign in with Google
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
              {modalMessage}
            </h3>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-10 w-10 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Please wait — we are preparing your account.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLogin;
