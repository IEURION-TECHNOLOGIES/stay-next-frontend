import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import useAuth from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import API from '../../utils/axios';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { superAdminLogin, fetchUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    superKey: '',
  });

  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const modalTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ===== EMAIL LOGIN =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError([]);
    setLoading(true);

    try {
      const user = await superAdminLogin(formData);

      if (user?.role !== 'superadmin') {
        setError(['Access denied. You are not a Super Admin.']);
        return;
      }

      await fetchUser();
      navigate('/super-admin-dashboard/overview');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError([msg || 'Unable to sign in.']);
    } finally {
      setLoading(false);
    }
  };

  // ===== GOOGLE LOGIN =====
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError(['Google sign-in failed']);
      return;
    }

    setLoading(true);
    setError([]);
    setModalMessage('Signing you in with Google...');
    setShowModal(true);

    try {
      const res = await API.post('/auth/superadmin/google', {
        token: credentialResponse.credential,
      });

      const user = res.data.user;

      if (user?.role !== 'superadmin') {
        setError(['Access denied. You are not a Super Admin.']);
        return;
      }

      await fetchUser();
      navigate('/super-admin-dashboard/overview');
    } catch (err) {
      setError(['Google login failed']);
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg p-6 rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
            <h2 className="text-2xl font-bold">Super Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border p-3 w-full rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className="border p-3 w-full rounded pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <input
              type="password"
              name="superKey"
              placeholder="Super Admin Key"
              className="border p-3 w-full rounded"
              value={formData.superKey}
              onChange={handleChange}
              required
            />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>

            {error.map((msg, i) => (
              <p key={i} className="text-red-500 text-sm">{msg}</p>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 w-full rounded"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError(['Google sign in failed'])}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow">
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminLogin;
