import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import useAuth from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import API from '../../utils/axios';
import LoadingModal from '../../utils/loader';

/* ===============================
   SUSPENDED ACCOUNT MODAL
================================ */
const SuspendedAccountModal = ({ open, message, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
      <div className="bg-white max-w-md w-full rounded-2xl p-6 text-center shadow-xl">

        <div className="text-red-600 text-5xl mb-3">🚫</div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Account Suspended
        </h2>

        <p className="text-gray-600 mb-6">
          {message ||
            "Your account has been suspended. Please contact support for assistance."}
        </p>

        <div className="flex gap-3">
          <a
            href="/support"
            className="flex-1 py-2 bg-green-600 text-white rounded-lg"
          >
            Contact Support
          </a>

          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login, fetchUser } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔒 Suspension state
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectByRole = (role) => {
    if (!role) return navigate('/');
    if (role === 'visitor') navigate('/visitor-dashboard/overview');
    else if (role === 'agent') navigate('/agent-dashboard/overview');
    else if (role === 'handyman') navigate('/handyman-dashboard/overview');
    else if (role === 'superadmin') navigate('/super-admin-dashboard/overview');
    else navigate('/');
  };

  /* ===============================
     EMAIL / PASSWORD LOGIN
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError([]);
    setLoading(true);

    try {
      const user = await login(formData);
      await fetchUser();
      redirectByRole(user?.role);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      // 🚫 Suspended account
      if (status === 403 && msg?.toLowerCase().includes('suspend')) {
        setSuspendedMessage(msg);
        setShowSuspendedModal(true);
        return;
      }

      if (msg) setError([msg]);
      else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.message));
      } else {
        setError(['Unable to sign in. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     GOOGLE LOGIN
  ================================ */
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      return setError(['Google sign-in failed']);
    }

    setLoading(true);
    setError([]);

    try {
      const res = await API.post('/auth/google', {
        token: credentialResponse.credential,
      });

      const user = res.data.user;
      await fetchUser();
      redirectByRole(user.role);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      // 🚫 Suspended Google user
      if (status === 403 && msg?.toLowerCase().includes('suspend')) {
        setSuspendedMessage(msg);
        setShowSuspendedModal(true);
        return;
      }

      setError(['Google login failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ⏳ Loading */}
      <LoadingModal loading={loading} message="Logging you in…" />

      {/* 🚫 Suspended Modal */}
      <SuspendedAccountModal
        open={showSuspendedModal}
        message={suspendedMessage}
        onClose={() => setShowSuspendedModal(false)}
      />

      {!loading && (
        <div
          className="bg-gray-200 min-h-screen flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-realestate.jpg')" }}
        >
          <div className="bg-white shadow-lg p-6 rounded-lg max-w-md w-full backdrop-blur-sm bg-opacity-90">

            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm">
                Please Login to continue
              </p>
            </div>

            {/* Errors */}
            {error.length > 0 && (
              <div className="space-y-1 mb-4 text-center">
                {error.map((msg, i) => (
                  <p key={i} className="text-red-500 text-sm">{msg}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="border p-3 w-full rounded text-black"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="border p-3 w-full rounded text-black pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <Link to="/forgot-password" className="text-green-600 hover:underline">
                  Forgot Password?
                </Link>
                <Link to="/register" className="text-green-600 hover:underline">
                  Create New Account
                </Link>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white py-2 w-full rounded hover:bg-green-700"
              >
                Login
              </button>
            </form>

            {/* Google Login */}
            <div className="mt-6">
              <div className="flex items-center justify-center my-3">
                <hr className="flex-1 border-gray-300" />
                <span className="px-2 text-gray-500 text-sm">OR</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError(['Google sign-in failed'])}
                  text="continue_with"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Login;
