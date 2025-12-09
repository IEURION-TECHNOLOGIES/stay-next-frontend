import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import API from "../../utils/axios";

const AgencySettingsPage = () => {
const { user, updateUser } = useAuth();

const [formData, setFormData] = useState({
name: "",
email: "",
role: "",
password: "",
notifications: true,
});

const [darkMode, setDarkMode] = useState(
localStorage.getItem("theme") === "dark"
);

const [uploading, setUploading] = useState(false);

// Sync theme with <html> and localStorage
useEffect(() => {
const root = document.documentElement;
if (darkMode) {
root.classList.add("dark");
localStorage.setItem("theme", "dark");
} else {
root.classList.remove("dark");
localStorage.setItem("theme", "light");
}
}, [darkMode]);

// Populate form from user context
useEffect(() => {
if (user) {
setFormData({
name: user.name || "",
email: user.email || "",
role: user.role || "",
password: "",
notifications: user.notifications ?? true,
});
}
}, [user]);

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData({
...formData,
[name]: type === "checkbox" ? checked : value,
});
};

const handleImageUpload = async (e) => {
const file = e.target.files[0];
if (!file) return;

const data = new FormData();
data.append("image", file);

try {
  setUploading(true);
  const res = await API.post("/auth/upload-profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const imageUrl = res.data.profileImage;
  await API.put("/auth/settings", { profileImage: imageUrl });

  updateUser({ ...user, profileImage: imageUrl });
} catch (err) {
  console.error("Upload error:", err);
} finally {
  setUploading(false);
}


};

const handleSubmit = async (e) => {
e.preventDefault();
try {
const res = await API.put("/auth/settings", formData);
updateUser(res.data.user);
alert("Settings updated successfully!");
} catch (err) {
console.error(err);
alert("Error updating settings");
}
};

const handleReset = () => {
setFormData({
name: user.name || "",
email: user.email || "",
role: user.role || "",
password: "",
notifications: user.notifications ?? true,
});
};

return ( <div className="max-w-3xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md mt-10"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
<button
onClick={() => setDarkMode(!darkMode)}
className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
>
{darkMode ? "Light Mode" : "Dark Mode"} </button> </div>

    {/* Profile Image Upload */}
      <div className="flex flex-col items-center mb-6 relative">
        <div className="relative">
          {user?.profileImage? (
            <img
              src={user?.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover cursor-pointer"
              onChange={handleImageUpload}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600" onChange={handleImageUpload}>
              <i className="fas fa-user"></i>

            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-green-500 rounded-full px-1 cursor-pointer">
            <i className="fas fa-camera text-white text-2xl"></i>
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {uploading && <span className="text-xs text-green-600">Uploading...</span>}
      </div>
  <form onSubmit={handleSubmit} className="space-y-5">
    {/* Name */}
    <div className="flex items-center space-x-3">
      <i className="fa fa-user text-gray-500 dark:text-gray-300"></i>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
      />
    </div>

    {/* Email */}
    <div className="flex items-center space-x-3">
      <i className="fa fa-envelope text-gray-500 dark:text-gray-300"></i>
      <input
        type="email"
        name="email"
        value={formData.email}
        readOnly
        className="flex-1 px-3 py-2 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 cursor-not-allowed"
      />
    </div>

    {/* Role */}
    <div className="flex items-center space-x-3">
      <i className="fa fa-user text-gray-500 dark:text-gray-300"></i>
      <input
        type="text"
        name="role"
        value={formData.role}
        readOnly
        className="flex-1 px-3 py-2 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 cursor-not-allowed"
      />
    </div>

    {/* Password */}
    <div className="flex items-center space-x-3">
      <i className="fa fa-key text-gray-500 dark:text-gray-300"></i>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="New Password"
        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-green-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
      />
    </div>

    {/* Notifications */}
    <div className="flex items-center space-x-3">
      <i className="fa fa-bell text-gray-500 dark:text-gray-300"></i>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="notifications"
          checked={formData.notifications}
          onChange={handleChange}
          className="w-5 h-5"
        />
        <span className="text-gray-700 dark:text-gray-200">Enable Notifications</span>
      </label>
    </div>

    {/* Buttons */}
    <div className="flex space-x-3">
      <button
        type="submit"
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Save Changes
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
      >
        Reset
      </button>
    </div>
  </form>
</div>


);
};

export default AgencySettingsPage;
