import React, { useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import API from '../../utils/axios';
import logo from '../../assets/images/logo.png';
import useAuth from '../../hooks/useAuth';

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'fa-chart-line' },
  { key: 'properties', label: 'My Properties', icon: 'fa-building' },
  { key: 'referrals', label: 'Referrals', icon: 'fa-user-friends' },
  { key: 'payments', label: 'Payments', icon: 'fa-money-check-alt' },
  { key: 'settings', label: 'Settings', icon: 'fa-user-cog' },
  { key: 'logout', label: 'Logout', icon: 'fa-sign-out-alt' },
];

const Sidebar = ({ menuOpen, setMenuOpen }) => {
  const { user, updateUser, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  /* ================= PROFILE UPLOAD ================= */
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await API.post('/auth/upload-profile', formData);
      updateUser({ ...user, profileImage: res.data.profileImage });
    } catch (err) {
      console.error('Profile upload error:', err.message);
    } finally {
      setUploading(false);
    }
  };

  /* ================= COVER UPLOAD ================= */
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await API.post('/auth/upload-cover', formData);
      updateUser({ ...user, coverImage: res.data.coverImage });
    } catch (err) {
      console.error('Cover upload error:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-800 shadow
        w-2/3 sm:w-1/2 lg:w-64 transform transition-transform duration-500
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center p-4 lg:hidden">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8" />
        </Link>
        <button
          onClick={() => setMenuOpen(false)}
          className="text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <div className="hidden lg:flex p-4">
        <img src={logo} alt="Logo" className="h-10" />
      </div>

      {/* ================= PROFILE SECTION ================= */}
      <div className="relative mb-10 group">
        {/* COVER IMAGE */}
        <div
          onClick={() => coverInputRef.current.click()}
          className="h-28 cursor-pointer relative overflow-hidden"
          style={{
            backgroundImage: user?.coverImage
              ? `url(${user.coverImage})`
              : 'linear-gradient(135deg, #16a34a, #064e3b)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* COVER OVERLAY */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
            Click to change cover
          </div>
        </div>

        <input
          type="file"
          ref={coverInputRef}
          className="hidden"
          onChange={handleCoverUpload}
        />

        {/* PROFILE IMAGE */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div
            onClick={() => profileInputRef.current.click()}
            className="relative cursor-pointer group"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                <i className="fas fa-user"></i>
              </div>
            )}

            {/* PROFILE OVERLAY */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition">
              Change
            </div>
          </div>

          <input
            type="file"
            ref={profileInputRef}
            className="hidden"
            onChange={handleProfileUpload}
          />
        </div>
      </div>

      {/* ================= USER NAME ================= */}
      <div className="text-center mt-10 mb-6">
        <h2 className="font-semibold text-sm">
          {user?.name}
        </h2>
        {uploading && (
          <span className="text-xs text-green-600">Uploading...</span>
        )}
      </div>

      {/* ================= NAV ================= */}
      <ul className="space-y-2 px-4">
        {tabs.map((item) => (
          <li key={item.key}>
            {item.key === 'logout' ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 p-2 rounded hover:bg-red-200"
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={`/agent-dashboard/${item.key}`}
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded ${
                    isActive
                      ? 'text-green-700 font-bold'
                      : 'text-gray-700'
                  } hover:bg-gray-100`
                }
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
