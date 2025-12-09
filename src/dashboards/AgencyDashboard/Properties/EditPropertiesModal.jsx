import React, { useState, useEffect } from "react";
import AGENTAPI from "../../../utils/agentaxios";
import { propertyCategories } from "../../../utils/propertyCategories";
import LoadingModal from "../../../utils/loader";

export default function EditPropertyModal({ show, onClose, initialData, onUpdate }) {
  const [propertyType, setPropertyType] = useState("");
  const [title, setTitle] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [duration, setDuration] = useState("");

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const stored = JSON.parse(localStorage.getItem("user"));
  const userId = stored?._id;

  /* ✅ Load existing property data */
  useEffect(() => {
    if (initialData) {
      setPropertyType(initialData.type || "");
      setTitle(initialData.title || "");
      setTransactionType(initialData.transactionType || "");
      setDuration(initialData.duration || "");

      setImagePreviews(
        initialData.images?.map((img) => ({ url: img, isNew: false })) || []
      );

      setVideoPreviews(
        initialData.videos?.map((vid) => ({ url: vid, isNew: false })) || []
      );
    }
  }, [initialData]);

  if (!show) return null;

  /* ✅ Suggestions Generator */
  const getSuggestions = (input, type) => {
    if (!type || !propertyCategories[type]) return [];
    const all = propertyCategories[type];
    if (!input.trim()) return all;
    return all.filter((x) => x.toLowerCase().includes(input.toLowerCase()));
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    setSuggestions(getSuggestions(value, propertyType));
    setShowSuggestions(true);
  };

  /* ✅ Remove OLD IMAGE (database media) */
  const handleRemoveImage = async (url) => {
    setLoading(true);
    try {
      await AGENTAPI.delete("/agents/properties/delete-image", {
        data: { propertyId: initialData._id, imageUrl: url },
      });
      setImagePreviews((prev) => prev.filter((i) => i.url !== url));
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setTimeout(() => setSuccess(false), 1500);
      setTimeout(() => setError(false), 1500);
      setLoading(false);
    }
  };

  /* ✅ Remove OLD VIDEO */
  const handleRemoveVideo = async (url) => {
    setLoading(true);
    try {
      await AGENTAPI.delete("/agents/properties/delete-video", {
        data: { propertyId: initialData._id, videoUrl: url },
      });
      setVideoPreviews((prev) => prev.filter((v) => v.url !== url));
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setTimeout(() => setSuccess(false), 1500);
      setTimeout(() => setError(false), 1500);
      setLoading(false);
    }
  };

  /* ✅ Add NEW IMAGES */
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), isNew: true })),
    ]);
  };

  /* ✅ Add NEW VIDEOS */
  const handleAddVideos = (e) => {
    const files = Array.from(e.target.files);
    setNewVideos((prev) => [...prev, ...files]);
    setVideoPreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), isNew: true })),
    ]);
  };

  /* ✅ Remove NEW FILES before uploading */
  const handleRemoveNew = (list, setList, setPreview, index) => {
    const newFile = list[index];
    setList((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) =>
      prev.filter((p) => p.url !== URL.createObjectURL(newFile))
    );
  };

  /* ✅ SUBMIT UPDATE */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.target;
      const formData = new FormData();

      formData.append("type", propertyType);
      formData.append("title", title);
      formData.append("transactionType", transactionType);
      formData.append("location", form.location.value);
      formData.append("price", form.price.value);
      formData.append("features", form.features.value || "");
      formData.append("duration", duration);

      if (propertyType === "Land") {
        formData.append("area", form.area?.value || "");
      } else {
        if (form.bedrooms?.value) formData.append("bedrooms", form.bedrooms.value);
        if (form.toilets?.value) formData.append("toilets", form.toilets.value);
      }

      newImages.forEach((img) => formData.append("images", img));
      newVideos.forEach((vid) => formData.append("videos", vid));

      /* ✅ Call parent update handler WITH formData  */
      await onUpdate(formData);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError(false);
        setSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-md max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">Edit Property</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Property Type */}
          <select
            name="type"
            value={propertyType}
            onChange={(e) => {
              setPropertyType(e.target.value);
              setSuggestions(propertyCategories[e.target.value] || []);
            }}
            required
            className="w-full border p-2 rounded dark:bg-gray-800"
          >
            <option value="">Select Property Type</option>
            {Object.keys(propertyCategories).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Title with Suggestions */}
          <div className="relative">
            <input
              name="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Property Title"
              className="w-full border p-2 rounded dark:bg-gray-800"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute bg-white dark:bg-gray-800 w-full border rounded shadow max-h-40 overflow-y-auto z-20">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setTitle(s);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-green-600 hover:text-white"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Transaction Type */}
          <select
            name="transactionType"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full border p-2 rounded dark:bg-gray-800"
          >
            <option value="">Select Transaction</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
            <option value="book">Book</option>
          </select>

          {(transactionType === "rent" || transactionType === "book") && (
            <input
              name="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (6 months)"
              className="w-full border p-2 rounded dark:bg-gray-800"
            />
          )}

          <input
            name="location"
            defaultValue={initialData.location}
            placeholder="Location"
            className="w-full border p-2 rounded dark:bg-gray-800"
          />

          <input
            name="price"
            type="number"
            defaultValue={initialData.price}
            placeholder="Price"
            className="w-full border p-2 rounded dark:bg-gray-800"
          />

          {/* CONDITIONAL FIELDS */}
          {propertyType === "Land" && (
            <input
              name="area"
              type="number"
              defaultValue={initialData.area}
              placeholder="Area (sqm)"
              className="w-full border p-2 rounded dark:bg-gray-800"
            />
          )}

          {propertyType !== "Land" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                name="bedrooms"
                type="number"
                defaultValue={initialData.bedrooms}
                placeholder="Bedrooms"
                className="border p-2 rounded dark:bg-gray-800"
              />
              <input
                name="toilets"
                type="number"
                defaultValue={initialData.toilets}
                placeholder="Toilets"
                className="border p-2 rounded dark:bg-gray-800"
              />
            </div>
          )}

          <textarea
            name="features"
            defaultValue={initialData.features}
            placeholder="Features (comma separated)"
            className="w-full border p-2 rounded dark:bg-gray-800"
          />

          {/* Add New Images */}
          <label className="cursor-pointer block border-2 border-dashed p-3 rounded text-center dark:border-gray-600">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
          </label>

          {/* Add New Videos */}
          <label className="cursor-pointer block border-2 border-dashed p-3 rounded text-center dark:border-gray-600">
            Upload Videos
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={handleAddVideos}
            />
          </label>

          {/* PREVIEW IMAGES */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.url} className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded-full"
                    onClick={() =>
                      p.isNew
                        ? handleRemoveNew(newImages, setNewImages, setImagePreviews, i)
                        : handleRemoveImage(p.url)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PREVIEW VIDEOS */}
          {videoPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {videoPreviews.map((v, i) => (
                <div key={i} className="relative w-28 h-20 bg-black rounded overflow-hidden">
                  <video src={v.url} className="w-full h-full" controls />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded-full"
                    onClick={() =>
                      v.isNew
                        ? handleRemoveNew(newVideos, setNewVideos, setVideoPreviews, i)
                        : handleRemoveVideo(v.url)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
              Save
            </button>
          </div>
        </form>

        <LoadingModal
          loading={loading}
          success={success}
          error={error}
          message="Updating Property..."
          successMessage="Property Updated!"
          errorMessage="Update Failed."
        />
      </div>
    </div>
  );
}
