import React, { useEffect, useState } from "react";
import API from "../../utils/adminaxios";

export default function AdminAgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [previewImage, setPreviewImage] = useState(null);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectingAgentId, setRejectingAgentId] = useState(null);

  /* ================= FETCH ================= */
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/agents");
      console.log(res.data.agents)
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    const filtered = agents
      .filter((a) => (a.status || "pending") === activeTab)
      .filter((a) =>
        a.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    setFilteredAgents(filtered);
    setSelectedAgents([]);
  }, [agents, activeTab, searchQuery]);

  /* ================= ACTIONS ================= */
  const handleApprove = async (id) => {
    try {
      await API.put(`/agents/approve/${id}`, {
        message: "Your verification has been approved",
      });
      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

/* ================= SUSPEND / UNSUSPEND ================= */

const handleSuspend = async (agent) => {
  const reason = prompt("Enter suspension reason:");
  if (!reason) return;

  try {
    await API.put(`/agents/suspend/${agent._id}`, { reason });
    fetchAgents();
  } catch (err) {
    console.error("Suspend failed", err);
  }
};

const handleUnsuspend = async (agent) => {
  try {
    await API.put(`/agents/unsuspend/${agent._id}`);
    fetchAgents();
  } catch (err) {
    console.error("Unsuspend failed", err);
  }
};


  const confirmReject = async () => {
    if (!rejectMessage.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await API.put(`/agents/reject/${rejectingAgentId}`, {
        message: rejectMessage,
      });

      setShowRejectModal(false);
      setRejectMessage("");
      setRejectingAgentId(null);
      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(
        selectedAgents.map((id) =>
          API.put(`/agents/approve/${id}`, {
            message: "Your verification has been approved",
          })
        )
      );
      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= STATS ================= */
  const stats = {
    total: agents.length,
    pending: agents.filter((a) => a.status === "pending").length,
    approved: agents.filter((a) => a.status === "approved").length,
    rejected: agents.filter((a) => a.status === "rejected").length,
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Agent Verification
        </h1>
        <p className="text-gray-600 mt-2">
          Review, approve or reject registered agents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "gray" },
          { label: "Pending", value: stats.pending, color: "yellow" },
          { label: "Approved", value: stats.approved, color: "green" },
          { label: "Rejected", value: stats.rejected, color: "red" },
        ].map((item) => (
          <div
            key={item.label}
            className={`bg-white p-4 rounded-xl shadow border-l-4 border-${item.color}-500`}
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-6">
        {["pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-semibold capitalize ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search agent name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Bulk Approve */}
      {activeTab === "pending" && selectedAgents.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleBulkApprove}
            className="px-8 py-3 bg-green-700 text-white rounded-xl shadow"
          >
            Approve Selected ({selectedAgents.length})
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              className="relative bg-white rounded-2xl shadow-lg p-6"
            >
              {activeTab === "pending" && (
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent._id)}
                  onChange={() =>
                    setSelectedAgents((prev) =>
                      prev.includes(agent._id)
                        ? prev.filter((id) => id !== agent._id)
                        : [...prev, agent._id]
                    )
                  }
                  className="absolute top-4 left-4"
                />
              )}

              <div className="flex items-center gap-4">
                <img
                  src={agent.user?.profileImage || "/avatar.png"}
                  className="w-14 h-14 rounded-full object-cover cursor-zoom-in border"
                  onClick={() => setPreviewImage(agent.user?.profileImage)}
                />
                <div>
                  <h3 className="font-bold text-lg">{agent.user?.name}</h3>
                  <p className="text-sm text-gray-500">{agent.user?.email}</p>
                </div>
              </div>

              <div className="mt-4 text-sm space-y-1">
                <p><strong>Phone:</strong> {agent.phone}</p>
                <p><strong>State:</strong> {agent.state}</p>
              </div>

              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                  agent.user?.isSuspended
                    ? "bg-gray-200 text-gray-700"
                    : agent.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : agent.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {agent.user?.isSuspended ? "suspended" : agent.status}
              </span>


              <div className="flex gap-2 mt-5">
                <button
                  disabled={agent.status === "approved"}
                  onClick={() => handleApprove(agent._id)}
                  className="flex-2 py-2 px-2 bg-green-600 text-white rounded-lg disabled:opacity-40"
                >
                  Approve
                </button>

                <button
                  disabled={agent.status === "rejected"}
                  onClick={() => {
                    setRejectingAgentId(agent._id);
                    setShowRejectModal(true);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:opacity-40"
                >
                  Reject
                </button>

                {/* Suspend / Unsuspend */}
                {agent.status === "approved" && (
                  agent.user?.isSuspended ? (
                    <button
                      onClick={() => handleUnsuspend(agent)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Unsuspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(agent)}
                      className="flex-1 py-2 bg-orange-600 text-white rounded-lg"
                    >
                      Suspend
                    </button>
                  )
                )}


                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-lg"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Reject Agent Verification
            </h2>

            <textarea
              rows={5}
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-3"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= VIEW DETAILS MODAL ================= */}
{selectedAgent && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white max-w-3xl w-full rounded-2xl p-6 relative">

      {/* Close */}
      <button
        onClick={() => setSelectedAgent(null)}
        className="absolute top-4 right-4 text-gray-400 text-xl"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={selectedAgent.user?.profileImage || "/avatar.png"}
          onClick={() => setPreviewImage(selectedAgent.user?.profileImage)}
          className="w-20 h-20 rounded-full object-cover border cursor-zoom-in"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {selectedAgent.user?.name}
          </h2>
          <p className="text-gray-500">
            {selectedAgent.user?.email}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p><strong>Phone:</strong> {selectedAgent.phone}</p>
          <p><strong>State:</strong> {selectedAgent.state}</p>
          <p><strong>Status:</strong> {selectedAgent.status}</p>

          {selectedAgent.reviewMessage && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Admin Review:</strong><br />
                {selectedAgent.reviewMessage}
              </p>
            </div>
          )}
        </div>

        {/* NIN SLIP */}
        {selectedAgent.ninSlip && (
          <div>
            <p className="font-semibold mb-2">NIN Slip</p>
            <img
              src={selectedAgent.ninSlip}
              onClick={() => setPreviewImage(selectedAgent.ninSlip)}
              className="w-full h-40 object-contain border rounded-lg cursor-zoom-in"
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}


      {/* Image Zoom */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center"
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
