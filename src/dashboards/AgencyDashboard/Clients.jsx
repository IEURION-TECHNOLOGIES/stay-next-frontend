import React, { useEffect, useState } from "react";
import api from "../../utils/axios";
import useAuth  from "../../hooks/useAuth"; // ✅ use your existing AuthContext

export default function ClientInquiries() {
  const { user } = useAuth(); // ✅ get logged-in agent from context
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?._id) fetchInquiries(user._id);
    else setLoading(false);
  }, [user]);

  // 📥 Fetch inquiries for this agent
  const fetchInquiries = async (agentId) => {
    try {
      const res = await api.get(`/clients/${agentId}`, { withCredentials: true });
      console.log(res.data)
      setInquiries(res.data.clients || []);
    } catch (err) {
      console.error("❌ Failed to fetch inquiries:", err);
      alert("Failed to load client inquiries");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete inquiry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await api.delete(`/clients/${id}`, { withCredentials: true });
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete inquiry");
    }
  };

  // 🔍 Search filter
  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📊 KPIs
  const today = new Date().toISOString().split("T")[0];
  const totalInquiries = inquiries.length;
  const todayInquiries = inquiries.filter(
    (inq) => inq.createdAt?.split("T")[0] === today
  ).length;

  return (
    <div className="p-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Client Inquiries
        </h1>
        <input
          type="text"
          placeholder="Search inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "fa-envelope", label: "Total Inquiries", value: totalInquiries },
          { icon: "fa-calendar-day", label: "Today’s Inquiries", value: todayInquiries },
          {
            icon: "fa-building",
            label: "Unique Properties",
            value: new Set(inquiries.map((inq) => inq.propertyId?._id)).size,
          },
          {
            icon: "fa-user",
            label: "Unique Clients",
            value: new Set(inquiries.map((inq) => inq.clientEmail)).size,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4"
          >
            <i className={`fas ${card.icon} text-green-600 text-2xl`}></i>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {card.label}
              </p>
              <h2 className="text-lg font-bold dark:text-gray-100">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiries List */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Loading inquiries...</p>
      ) : filteredInquiries.length === 0 ? (
        <div className="flex flex-col items-center text-gray-500 mt-10">
          <i className="fas fa-inbox text-5xl mb-2"></i>
          <p>No inquiries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInquiries.map((inq) => (
            <div
              key={inq._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                  {inq.clientName}
                </h3>
                <button
                  onClick={() => handleDelete(inq._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Email:</strong> {inq.clientEmail}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Phone:</strong> {inq.clientPhone}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Property:</strong> {inq.propertyId?.title || "N/A"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {inq.message}
              </p>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => setSelectedInquiry(inq)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View Details
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(inq.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-lg w-full relative">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
            <h2 className="text-xl font-bold mb-3 dark:text-gray-100">
              Inquiry Details
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Client:</strong> {selectedInquiry.clientName}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Email:</strong> {selectedInquiry.clientEmail}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Phone:</strong> {selectedInquiry.clientPhone}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Property:</strong>{" "}
              {selectedInquiry.propertyId?.title || "N/A"}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <strong>Message:</strong> {selectedInquiry.message}
            </p>
            <p className="text-sm text-gray-400 mt-3">
              Sent: {new Date(selectedInquiry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
