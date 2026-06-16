import React, { useEffect, useState } from "react";
import API from "../../utils/adminaxios";

export default function AdminPropertyDashboard() {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProperty, setSelectedProperty] = useState(null);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  /* ================= FETCH ================= */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await API.get("/properties/all");
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    const result = properties
      .filter((p) => (activeTab === "all" ? true : p.status === activeTab))
      .filter((p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    setFiltered(result);
  }, [properties, activeTab, searchQuery]);

  /* ================= ACTIONS ================= */
  const approveProperty = async (id) => {
    try {
      await API.put(`/properties/${id}/approve`);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return alert("Rejection reason required");

    try {
      await API.put(`/properties/${rejectingId}/reject`, {
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm("Delete this property permanently?")) return;
    try {
      await API.delete(`/properties/${id}`);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= STATS ================= */
  const stats = {
    total: properties.length,
    pending: properties.filter((p) => p.status === "pending").length,
    approved: properties.filter((p) => p.status === "approved").length,
    rejected: properties.filter((p) => p.status === "rejected").length,
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 min-h-screen bg-gray-100">

      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Property Management
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500 capitalize">{k}</p>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-4">
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full capitalize ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white border"
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
          placeholder="Search property title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <div key={property._id} className="bg-white rounded-xl shadow">

              {/* Image + Video Badge */}
              <div className="relative">
                <img
                  src={property.images?.[0]}
                  className="h-48 w-full object-cover cursor-zoom-in"
                  onClick={() => setPreviewImage(property.images?.[0])}
                />

                {property.videos?.length > 0 && (
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                    🎥 {property.videos.length}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.location}</p>

                <p className="mt-2 font-semibold text-green-700">
                  ₦{property.price?.toLocaleString()}
                </p>

                {/* Agent */}
                {property.agent && (
                  <div className="flex gap-3 mt-3 items-center text-sm">
                    <img
                      src={property.agent.profileImage || "/avatar.png"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-semibold">{property.agent.name}</p>
                      <p className="text-xs">{property.agent.email}</p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
                    property.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : property.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {property.status}
                </span>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="flex-1 bg-gray-800 text-white py-2 rounded-lg"
                  >
                    View
                  </button>

                  {property.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveProperty(property._id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(property._id);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => deleteProperty(property._id)}
                  className="w-full mt-3 bg-black text-white py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">
            <button
              onClick={() => setSelectedProperty(null)}
              className="sticky top-0 ml-auto block text-2xl bg-white z-50"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {selectedProperty.title}
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              {selectedProperty.images?.length || 0} images ·{" "}
              {selectedProperty.videos?.length || 0} videos
            </p>

            {/* Images */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {selectedProperty.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setPreviewImage(img)}
                  className="h-32 w-full object-cover rounded cursor-zoom-in"
                />
              ))}
            </div>

            {/* Videos */}
            {selectedProperty.videos?.length > 0 && (
              <>
                <h3 className="font-bold mb-2">Videos</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {selectedProperty.videos.map((v, i) => (
                    <video
                      key={i}
                      src={v}
                      controls
                      className="w-full h-48 rounded-lg bg-black"
                    />
                  ))}
                </div>
              </>
            )}

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p><strong>Location:</strong> {selectedProperty.location}</p>
                <p><strong>Type:</strong> {selectedProperty.type}</p>
                <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>
                <p><strong>Toilets:</strong> {selectedProperty.toilets}</p>
                <p><strong>Status:</strong> {selectedProperty.status}</p>

                {selectedProperty.rejectionReason && (
                  <p className="text-red-600 mt-2">
                    <strong>Reason:</strong> {selectedProperty.rejectionReason}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-bold mb-2">Agent</h3>
                {selectedProperty.agent ? (
                  <div className="flex gap-3 items-center">
                    <img
                      src={selectedProperty.agent.profileImage || "/avatar.png"}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div>
                      <p><strong>{selectedProperty.agent.name}</strong></p>
                      <p>{selectedProperty.agent.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No agent data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Reject Property
            </h2>

            <textarea
              rows={5}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
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

      {/* ================= IMAGE PREVIEW ================= */}
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
