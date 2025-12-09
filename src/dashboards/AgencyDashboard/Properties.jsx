// src/.../Properties.jsx
import React, { useState, useEffect } from "react";
import AddPropertyModal from "./Properties/AddPropertiesModal";
import EditPropertyModal from "./Properties/EditPropertiesModal";
import PropertySlider from "./Properties/propertySlicer";
import AGENCYAPI from "../../utils/agencyaxios";
import { motion } from "framer-motion";
import LoadingModal from "../../utils/loader"; // parent-level loading modal

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewModeModal, setViewModeModal] = useState(null);
  const [view, setView] = useState(0);

  // modal status from child
  const [modalStatus, setModalStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: "Processing...",
  });

  const stored = JSON.parse(localStorage.getItem("user"));
  const userId = stored?._id;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await AGENCYAPI.get("/Agency/properties/my-properties", {
        headers: { "x-user-id": userId },
      });
      console.log(res.data);
      setProperties(res.data?.properties || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch properties");
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p._id?.toString().includes(searchTerm)
  );

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      await AGENCYAPI.delete(`/agency/properties/delete/${id}`, {
        headers: { "x-user-id": userId },
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete property");
    }
  };

  // This function is called by the AddPropertyModal to actually create the property.
  // It returns the created property object (so the modal can detect success).
  const handleAddSubmit = async (formData) => {
    try {
      const res = await AGENCYAPI.post("/agency/properties/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-user-id": userId,
        },
      });

      // Return the created property to caller (modal)
      return res.data.property;
    } catch (err) {
      console.error("Failed to add property:", err);
      // bubble error to modal
      throw err;
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      const res = await AGENCYAPI.put(
        `/agency/properties/${selectedProperty._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-id": userId,
          },
        }
      );

      setProperties((prev) =>
        prev.map((p) => (p._id === selectedProperty._id ? res.data.property : p))
      );

      setSelectedProperty(null);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update property");
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Header + Add Button (you can keep your header controls here) */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Properties
        </h1>
      </div>

{/* {/* KPI Summary Cards - Mobile: Icon top, Label + Number same row */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 px-3 lg:px-0">
  {[
    { icon: "fa-home", label: "Total Properties", value: properties.length },
    {
      icon: "fa-circle-check",
      label: "Active Listings",
      value: properties.filter((p) => p.status === "Active").length,
    },
    {
      icon: "fa-clock",
      label: "Pending Approval",
      value: properties.filter((p) => p.status === "Pending").length,
    },
    {
      icon: "fa-eye",
      label: "Total Views",
      value: properties.reduce((sum, p) => sum + (p.views || 0), 0),
    },
  ].map((card, i) => (
    <div
      key={i}
      className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-5 flex flex-col sm:flex-col lg:flex-col"
    >
      {/* Icon - Always top */}
      <div className="mb-3">
        <i className={`fas ${card.icon} text-3xl text-green-600 dark:text-green-500`}></i>
      </div>

      {/* Label and Number on the same row - Left aligned on mobile */}
      <div className="flex items-baseline justify-between flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium flex-1">
          {card.label}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-4">
          {card.value.toLocaleString()}
        </h2>
      </div>
    </div>
  ))}
</div>

      {/* Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-300">
          <i className="fas fa-home text-6xl text-gray-400 dark:text-gray-600 mb-4"></i>
          <p className="text-lg font-semibold">You have not added any property yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            <i className="fas fa-plus mr-2"></i> Add Your First Property
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((p) => (
            <div key={p._id} className="bg-white dark:bg-gray-700 rounded-xl shadow p-4">
              <div className="w-full h-56 overflow-hidden rounded-md">
                <PropertySlider videos={p.videos || []} images={p.images || [p.image]} />
              </div>

              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{p.location}</p>
              <p className="text-green-700 dark:text-green-300 font-bold">
                ₦{formatPrice(p.price)}
              </p>
              <div className="flex justify-between text-xs mt-2 text-gray-600 dark:text-gray-300">
                <span>{p.type}</span>
                <span>{p.status}</span>
              </div>

              <div className="mt-3 flex gap-2 justify-between text-sm">
                <button
                  className="text-blue-600 dark:text-blue-400"
                  onClick={() => {
                    setSelectedProperty(p);
                    setViewModeModal("view");
                  }}
                >
                  <i className="fas fa-eye mr-1"></i>View
                </button>
                <button
                  className="text-yellow-600 dark:text-yellow-400"
                  onClick={() => {
                    setSelectedProperty(p);
                    setShowEditModal(true);
                  }}
                >
                  <i className="fas fa-edit mr-1"></i>Edit
                </button>
                <button
                  className="text-red-600 dark:text-red-400"
                  onClick={() => handleDelete(p._id)}
                >
                  <i className="fas fa-trash mr-1"></i>Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full bg-white dark:bg-gray-700 rounded-xl shadow text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left">Media</th>
                <th>Title</th>
                <th>Location</th>
                <th>Price</th>
                <th>Type</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-2 w-40 h-28">
                    <div className="w-full h-full overflow-hidden rounded-md">
                      <PropertySlider videos={p.videos || []} images={p.images || [p.image]} />
                    </div>
                  </td>
                  <td>{p.title}</td>
                  <td>{p.location}</td>
                  <td>₦{formatPrice(p.price)}</td>
                  <td>{p.type}</td>
                  <td>{p.status}</td>
                  <td>{p.views}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProperty(p);
                        setViewModeModal("view");
                      }}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(p);
                        setShowEditModal(true);
                      }}
                      className="text-yellow-600 dark:text-yellow-400"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 dark:text-red-500"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewModeModal === "view" && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{selectedProperty.title}</h2>
            <div className="w-full h-56 overflow-hidden rounded-md mb-3">
              <PropertySlider
                videos={selectedProperty.videos || []}
                images={selectedProperty.images || [selectedProperty.image]}
              />
            </div>
            <p><strong>Location:</strong> {selectedProperty.location}</p>
            <p><strong>Features:</strong> {selectedProperty.features}</p>
            <p><strong>Price:</strong> ₦{formatPrice(selectedProperty.price)}</p>
            <p><strong>Area:</strong> {selectedProperty.area}</p>
            <p><strong>Beds:</strong> {selectedProperty.beds}</p>
            <p><strong>Toilets:</strong> {selectedProperty.toilets}</p>
            <p><strong>Type:</strong> {selectedProperty.type}</p>
            <p><strong>Status:</strong> {selectedProperty.status}</p>
            <button
              onClick={() => {
                setSelectedProperty(null);
                setViewModeModal(null);
              }}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add & Edit Modals */}
      <AddPropertyModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}               // returns created property
        onCreated={(property) => {
          // parent receives created property from modal and appends to list
          setProperties((prev) => [...prev, property]);
        }}
        onStatusChange={(status) => setModalStatus(status)}
      />

      {selectedProperty && (
        <EditPropertyModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
          onUpdate={handleEditSubmit}
          initialData={selectedProperty}
        />
      )}

      {/* Add button */}
      <div className="flex justify-center mt-6">
        <button
        
          onClick={() => {
            setModalStatus(false);
            setShowAddModal(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Property
        </button>
      </div>

      {/* Parent-level LoadingModal controlled by child via onStatusChange */}
      {/* <LoadingModal
        loading={modalStatus.loading}
        success={modalStatus.success}
        error={modalStatus.error}
        message={modalStatus.message}
        successMessage="Property Added Successfully!"
        errorMessage="Failed to add property. Try again."
      /> */}
    </div>
  );
}
