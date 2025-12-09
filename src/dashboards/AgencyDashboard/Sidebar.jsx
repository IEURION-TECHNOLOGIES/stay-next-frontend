import React, { useState } from 'react';
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


 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    setUploading(true);

    const res = await API.post('/auth/upload-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const imageUrl = res.data.profileImage;

    updateUser({ ...user, profileImage: imageUrl }); // update context
  } catch (err) {
    console.error('Upload error:', err.response?.data?.message || err.message);
  } finally {
    setUploading(false);
  }
};

  const handleLogout = () => {
    logout();         // Clear auth context
    navigate('/');    // Redirect to homepage
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-50 bg-white space-y-3 text-2xl dark:bg-gray-800 shadow p-4 text-sm w-2/3 sm:w-1/2 lg:w-64 transform transition-transform duration-500 ease-in-out
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:block
      `}
    >
      {/* Close button on mobile */}
      <div className="flex justify-between items-center mb-4 lg:hidden">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8" />
        </Link>

        <button
          onClick={() => setMenuOpen(false)}
          className="text-2xl font-bold text-gray-600 dark:text-gray-100 hover:text-red-500"
        >
          &times;
        </button>
      </div>

      {/* Logo on large screens */}
      <div className="hidden lg:flex justify-left mb-6">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-10" />
        </Link>
      </div>

      {/* Profile image and name */}
      <div className="flex flex-col items-center mb-6 relative">
        <p className="text-gray-600 dark:text-gray-100 text-xs rounded-xl bg-green-200 dark:bg-green-800 px-1.5 font-bold py-0.5 absolute z-20 ml-28">
          Agency 
        </p>

        <div className="relative">
          {user?.profileImage? (
            <img
              src={user?.profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600">
              <i className="fas fa-user"></i>
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-green-500 rounded-full px-1 cursor-pointer">
            <i className="fas fa-camera text-white text-sm"></i>
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <h2 className="mt-2 font-semibold text-sm text-gray-700 dark:text-gray-100">
          {user?.name}
        </h2>
        {uploading && <span className="text-xs text-green-600">Uploading...</span>}
      </div>

      {/* Navigation links */}
      <ul className="space-y-2 text-lg">
        {tabs.map((item) => (
          <li key={item.key} onClick={() => setMenuOpen(false)}>
            {item.key === 'logout' ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 p-2 rounded text-md text-gray-700 dark:text-gray-100 hover:bg-red-300 hover:text-red-700 dark:hover:bg-red-300 dark:hover:text-red-700"
              >
                <i className={`fas ${item.icon} w-5`}></i>
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={`/agency-dashboard/${item.key}`}
                className={({ isActive }) => {
                  const base = 'flex items-center space-x-2 p-2 rounded text-md';
                  const active = isActive
                    ? 'text-green-700 font-bold dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-100';
                  const hover = 'hover:bg-gray-100 dark:hover:bg-gray-600';
                  return `${base} ${active} ${hover}`;
                }}
              >
                <i className={`fas ${item.icon} w-5`}></i>
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
