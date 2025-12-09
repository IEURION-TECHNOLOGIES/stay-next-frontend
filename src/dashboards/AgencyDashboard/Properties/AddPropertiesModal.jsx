// import React, { useState } from "react";
// import { propertyCategories, propertyFieldRequirements } from "../../../utils/propertyCategories";
// import LoadingModal from "../../../utils/loader";
// import AGENTAPI from "../../../utils/agentaxios";

// // ------------------------- Cloudinary Upload -------------------------
// async function uploadToCloudinary(file) {
//   const data = new FormData();
//   data.append("file", file);
//   data.append("upload_preset", "testcloud"); // <-- Replace
//   data.append("cloud_name", "drt2ymnfm");    // <-- Replace

//   const res = await fetch("https://api.cloudinary.com/v1_1/drt2ymnfm/auto/upload", {
//     method: "POST",
//     body: data,
//   });

//   const json = await res.json();
//   return {
//     url: json.secure_url,
//     hash: json.asset_id,
//   };
// }

// export default function AddPropertyModal({ show, onClose, onSubmit }) {
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [videoPreviews, setVideoPreviews] = useState([]);
//   const [videoFiles, setVideoFiles] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState(false);

//   const [propertyType, setPropertyType] = useState("");
//   const [title, setTitle] = useState("");
//   const [transactionType, setTransactionType] = useState("");
//   const [duration, setDuration] = useState("");
//   const [durationSuggestions, setDurationSuggestions] = useState([]);
//   const [showDurationSuggestions, setShowDurationSuggestions] = useState(false);

//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   if (!show) return null;

//   const fieldReq = propertyFieldRequirements[propertyType] || {};

//   // ------------------------- Title Suggestions -------------------------
//   const getSuggestions = (input, type) => {
//     if (!type || !propertyCategories[type]) return [];
//     const all = propertyCategories[type];
//     if (!input.trim()) return all;
//     return all.filter((x) => x.toLowerCase().includes(input.toLowerCase()));
//   };

//   const handleTitleChange = (e) => {
//     const value = e.target.value;
//     setTitle(value);
//     setSuggestions(getSuggestions(value, propertyType));
//     setShowSuggestions(true);
//   };

//   // ------------------------- Duration Suggestions -------------------------
//   const rentDurations = ["Monthly", "Quarterly", "Bi-Annually", "Yearly"];
//   const bookDurations = ["Daily", "Weekend", "Weekly", "Full Stay"];

//   const getDurationSuggestions = (input) => {
//     const base =
//       transactionType === "rent"
//         ? rentDurations
//         : transactionType === "book"
//         ? bookDurations
//         : [];
//     if (!input.trim()) return base;
//     return base.filter((x) => x.toLowerCase().includes(input.toLowerCase()));
//   };

//   const handleDurationChange = (e) => {
//     const value = e.target.value;
//     setDuration(value);
//     setDurationSuggestions(getDurationSuggestions(value));
//     setShowDurationSuggestions(true);
//   };

//   // ------------------------- Image & Video Handlers -------------------------
//   const handleImagesChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
//     setImageFiles((prev) => [...prev, ...files]);
//     e.target.value = null;
//   };

//   const handleVideoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setVideoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
//     setVideoFiles((prev) => [...prev, file]);
//     e.target.value = null;
//   };

//   const handleRemoveImage = (i) => {
//     setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
//     setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
//   };

//   const handleRemoveVideo = (i) => {
//     setVideoPreviews((prev) => prev.filter((_, idx) => idx !== i));
//     setVideoFiles((prev) => prev.filter((_, idx) => idx !== i));
//   };

//   // ------------------------- Submit Handler -------------------------
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(false);
//     setSuccess(false);

//     try {
//       // 1️⃣ Upload images to Cloudinary
//       const uploadedImages = await Promise.all(imageFiles.map((file) => uploadToCloudinary(file)));

//       // 2️⃣ Upload videos to Cloudinary
//       const uploadedVideos = await Promise.all(videoFiles.map((file) => uploadToCloudinary(file)));

//       // 3️⃣ Create property in DB first
//       const payload = {
//         type: propertyType,
//         title,
//         transactionType,
//         duration,
//         location: e.target.location.value,
//         price: fieldReq.showPrice ? e.target.price.value : "",
//         features: fieldReq.showFeatures ? e.target.features.value : "",
//         area: fieldReq.showArea ? e.target.area.value : "",
//         bedrooms: fieldReq.showBedrooms ? e.target.bedrooms.value : "",
//         toilets: fieldReq.showToilets ? e.target.toilets.value : "",
//         images: uploadedImages.map((x) => x.url),
//         videos: uploadedVideos.map((x) => x.url),
//         fileHashes: [
//           ...uploadedImages.map((x) => x.hash),
//           ...uploadedVideos.map((x) => x.hash),
//         ],
//       };

//       const createRes = await onSubmit(payload);
//       const propertyId = createRes;
//       console.log("YouTube upload response:", propertyId);
//       if (!propertyId) throw new Error("Property creation failed, no ID returned");

//       // 4️⃣ Upload each Cloudinary video to YouTube and update property
//       const youtubeVideos = [];
//       for (const vid of uploadedVideos) {
//         try {
//           const res = await AGENTAPI.post("/agents/properties/upload-youtube", {
//             url: vid.url,
//             title,
//             propertyId, // ✅ Send propertyId to backend
//           });

//           console.log("YouTube upload response:", propertyId);

//           youtubeVideos.push(res.data.youtubeUrl);
//         } catch (err) {
//           console.error("YouTube upload failed for video:", vid.url, err);
//         }
//       }

//       // 5️⃣ Update property with YouTube URLs
//       if (youtubeVideos.length > 0) {
//         await AGENTAPI.put(`/agents/properties/${propertyId}/youtube-videos`, { youtubeVideos });
//       }

//       setSuccess(true);
//       setTimeout(() => onClose(), 2000);

//     } catch (err) {
//       console.error("AddPropertyModal Error:", err);
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
//       <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto relative">
//         <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add Property</h2>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           {/* Property Type */}
//           <select
//             name="type"
//             value={propertyType}
//             onChange={(e) => {
//               setPropertyType(e.target.value);
//               setSuggestions(propertyCategories[e.target.value] || []);
//               setShowSuggestions(false);
//             }}
//             required
//             className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//           >
//             <option value="">Select Property Type</option>
//             {Object.keys(propertyCategories).map((type) => (
//               <option key={type} value={type}>{type}</option>
//             ))}
//           </select>

//           {/* Title */}
//           <div className="relative">
//             <input
//               name="title"
//               value={title}
//               onChange={handleTitleChange}
//               onFocus={() => {
//                 if (propertyType) {
//                   setSuggestions(getSuggestions(title, propertyType));
//                   setShowSuggestions(true);
//                 }
//               }}
//               onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
//               placeholder="Start typing title..."
//               required
//               className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//             />
//             {showSuggestions && suggestions.length > 0 && (
//               <ul className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-h-40 overflow-y-auto rounded mt-1 shadow-md">
//                 {suggestions.map((s, i) => (
//                   <li
//                     key={i}
//                     onClick={() => {
//                       setTitle(s);
//                       setShowSuggestions(false);
//                     }}
//                     className="px-3 py-2 hover:bg-green-600 hover:text-white cursor-pointer dark:hover:bg-green-700"
//                   >
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Transaction Type */}
//           <select
//             name="transactionType"
//             value={transactionType}
//             onChange={(e) => setTransactionType(e.target.value)}
//             required
//             className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//           >
//             <option value="">Listing Type</option>
//             <option value="rent">Rent</option>
//             <option value="sale">Sale</option>
//             <option value="book">Book</option>
//           </select>

//           {/* Duration */}
//           {(transactionType === "rent" || transactionType === "book") && (
//             <div className="relative">
//               <input
//                 name="duration"
//                 value={duration}
//                 onChange={handleDurationChange}
//                 onFocus={() => {
//                   setDurationSuggestions(getDurationSuggestions(duration));
//                   setShowDurationSuggestions(true);
//                 }}
//                 onBlur={() => setTimeout(() => setShowDurationSuggestions(false), 150)}
//                 placeholder={transactionType === "book" ? "Enter or select booking period..." : "Enter or select rent duration..."}
//                 required
//                 className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//               />
//               {showDurationSuggestions && durationSuggestions.length > 0 && (
//                 <ul className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-h-40 overflow-y-auto rounded mt-1 shadow-md">
//                   {durationSuggestions.map((d, i) => (
//                     <li
//                       key={i}
//                       onClick={() => {
//                         setDuration(d);
//                         setShowDurationSuggestions(false);
//                       }}
//                       className="px-3 py-2 hover:bg-green-600 hover:text-white cursor-pointer dark:hover:bg-green-700"
//                     >
//                       {d}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}

//           {/* Location */}
//           <input
//             name="location"
//             placeholder="Location"
//             required
//             className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//           />

//           {/* Price */}
//           {fieldReq.showPrice && (
//             <div className="relative w-full">
//               <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300">₦</span>
//               <input
//                 name="price"
//                 type="number"
//                 placeholder="Price"
//                 required
//                 className="w-full pl-7 border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//               />
//             </div>
//           )}

//           {/* Features */}
//           {fieldReq.showFeatures && (
//             <textarea
//               name="features"
//               placeholder="Description or Features"
//               className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
//             />
//           )}

//           {/* Area, Bedrooms, Toilets */}
//           {fieldReq.showArea && <input name="area" placeholder="Area (e.g. Sqm)" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />}
//           {fieldReq.showBedrooms && <input name="bedrooms" type="number" placeholder="Bedrooms" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />}
//           {fieldReq.showToilets && <input name="toilets" type="number" placeholder="Toilets" className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />}

//           {/* Images */}
//           {fieldReq.showImages && (
//             <div className="space-y-2">
//               <label htmlFor="imageUpload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 hover:border-green-600 transition">
//                 <span className="text-gray-600 dark:text-gray-300">Upload Images</span>
//               </label>
//               <input id="imageUpload" type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
//             </div>
//           )}
//           {imagePreviews.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {imagePreviews.map((src, i) => (
//                 <div key={i} className="relative">
//                   <img src={src} alt="" className="w-20 h-20 object-cover rounded" />
//                   <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1">×</button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Videos */}
//           {fieldReq.showVideo && (
//             <div className="space-y-2">
//               <label htmlFor="videoUpload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 hover:border-green-600 transition">
//                 <span className="text-gray-600 dark:text-gray-300">Upload a Property Video</span>
//               </label>
//               <input id="videoUpload" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
//             </div>
//           )}
//           {videoPreviews.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {videoPreviews.map((src, i) => (
//                 <div key={i} className="relative">
//                   <video src={src} controls className="w-32 h-20 rounded" />
//                   <button type="button" onClick={() => handleRemoveVideo(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1">×</button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Buttons */}
//           <div className="flex justify-end gap-2 mt-3">
//             <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 dark:text-gray-100" disabled={loading || success}>Cancel</button>
//             <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" disabled={loading || success}>Add</button>
//           </div>
//         </form>

//         <LoadingModal
//           loading={loading}
//           success={success}
//           error={error}
//           message="Adding Property..."
//           successMessage="Property Added Successfully!"
//           errorMessage="Failed to add property. Try again."
//         />
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { propertyCategories, propertyFieldRequirements } from "../../../utils/propertyCategories";
import LoadingModal from "../../../utils/loader";
import AGENTAPI from "../../../utils/agentaxios";

/* --------------------------------------------------------
   CLOUDINARY UPLOAD (Images only)
-------------------------------------------------------- */
async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "testcloud");
  data.append("cloud_name", "drt2ymnfm");

  const res = await fetch("https://api.cloudinary.com/v1_1/drt2ymnfm/auto/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  return {
    url: json.secure_url,
    hash: json.asset_id,
  };
}

export default function AddPropertyModal({ show, onClose, onSubmit }) {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [title, setTitle] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [duration, setDuration] = useState("");
  const [durationSuggestions, setDurationSuggestions] = useState([]);
  const [showDurationSuggestions, setShowDurationSuggestions] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* --------------------------------------------------------
     PRICE INPUT STATE + FORMATTER
  -------------------------------------------------------- */
  const [formattedPrice, setFormattedPrice] = useState("");

  function formatNumber(value) {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  if (!show) return null;
  const fieldReq = propertyFieldRequirements[propertyType] || {};

  const rentDurations = ["Monthly", "Quarterly", "Bi-Annually", "Yearly"];
  const bookDurations = ["Daily", "Weekend", "Weekly", "Full Stay"];

  const getSuggestions = (input, type) => {
    if (!type || !propertyCategories[type]) return [];
    const all = propertyCategories[type];
    if (!input.trim()) return all;
    return all.filter((x) => x.toLowerCase().includes(input.toLowerCase()));
  };

  const getDurationSuggestions = (input) => {
    const base =
      transactionType === "rent"
        ? rentDurations
        : transactionType === "book"
        ? bookDurations
        : [];
    if (!input.trim()) return base;
    return base.filter((x) => x.toLowerCase().includes(input.toLowerCase()));
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    setSuggestions(getSuggestions(value, propertyType));
    setShowSuggestions(true);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setDuration(value);
    setDurationSuggestions(getDurationSuggestions(value));
    setShowDurationSuggestions(true);
  };

  // Image Upload
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  // Video Upload
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    setVideoFiles((prev) => [...prev, file]);
    e.target.value = null;
  };

  const handleRemoveImage = (i) => {
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleRemoveVideo = (i) => {
    setVideoPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setVideoFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* --------------------------------------------------------
     SUBMIT HANDLER
  -------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const uploadedImages = await Promise.all(imageFiles.map(uploadToCloudinary));
      const uploadedVideos = await Promise.all(videoFiles.map(uploadToCloudinary));

      const payload = {
        type: propertyType,
        title,
        transactionType,
        duration,
        location: e.target.location.value,

        // 🔥 PRICE SENT AS CLEAN NUMBER WITHOUT COMMAS
        price: fieldReq.showPrice ? formattedPrice.replace(/,/g, "") : "",

        features: fieldReq.showFeatures ? e.target.features.value : "",
        area: fieldReq.showArea ? e.target.area.value : "",
        bedrooms: fieldReq.showBedrooms ? e.target.bedrooms.value : "",
        toilets: fieldReq.showToilets ? e.target.toilets.value : "",
        images: uploadedImages.map((x) => x.url),
        imageHashes: uploadedImages.map((x) => x.hash),
        videos: uploadedVideos.map((x) => x.url),
        videoCloudHashes: uploadedVideos.map((x) => x.hash),
      };

      const createRes = await onSubmit(payload);

      if (!createRes?._id) throw new Error("No property ID returned");

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error("Property upload error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------
     RENDER FORM
  -------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add Property</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Property Type */}
          <select
            name="type"
            value={propertyType}
            onChange={(e) => {
              setPropertyType(e.target.value);
              setSuggestions(propertyCategories[e.target.value] || []);
              setShowSuggestions(false);
            }}
            required
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Select Property Type</option>
            {Object.keys(propertyCategories).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Title */}
          <div className="relative">
            <input
              name="title"
              value={title}
              onChange={handleTitleChange}
              onFocus={() => {
                if (propertyType) {
                  setSuggestions(getSuggestions(title, propertyType));
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Start typing title..."
              required
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 bg-white dark:bg-gray-800 border w-full max-h-40 overflow-y-auto rounded mt-1 shadow-md">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setTitle(s);
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 hover:bg-green-600 hover:text-white cursor-pointer"
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
            required
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Listing Type</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
            <option value="book">Book</option>
          </select>

          {/* Duration */}
          {(transactionType === "rent" || transactionType === "book") && (
            <div className="relative">
              <input
                name="duration"
                value={duration}
                onChange={handleDurationChange}
                onFocus={() => {
                  setDurationSuggestions(getDurationSuggestions(duration));
                  setShowDurationSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowDurationSuggestions(false), 150)}
                placeholder={transactionType === "book" ? "Enter or select booking period..." : "Enter or select rent duration..."}
                required
                className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              {showDurationSuggestions && durationSuggestions.length > 0 && (
                <ul className="absolute z-20 bg-white dark:bg-gray-800 border w-full max-h-40 overflow-y-auto rounded mt-1 shadow-md">
                  {durationSuggestions.map((d, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setDuration(d);
                        setShowDurationSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-green-600 hover:text-white cursor-pointer"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Location */}
          <input
            name="location"
            placeholder="Location"
            required
            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />

          {/* PRICE WITH AUTO COMMA FORMATTING */}
          {fieldReq.showPrice && (
            <div className="relative w-full">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300">
                ₦
              </span>

              <input
                name="price"
                value={formattedPrice}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!isNaN(raw)) {
                    setFormattedPrice(formatNumber(raw));
                  }
                }}
                placeholder="Price"
                required
                className="w-full pl-7 border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          )}

          {/* Features */}
          {fieldReq.showFeatures && (
            <textarea
              name="features"
              placeholder="Description or Features"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          )}

          {fieldReq.showArea && (
            <input
              name="area"
              placeholder="Area (e.g. Sqm)"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          )}

          {fieldReq.showBedrooms && (
            <input
              name="bedrooms"
              type="number"
              placeholder="Bedrooms"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          )}

          {fieldReq.showToilets && (
            <input
              name="toilets"
              type="number"
              placeholder="Toilets"
              className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          )}

          {/* Images */}
          <label htmlFor="imageUpload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 hover:border-green-600 transition">
            <span className="text-gray-600 dark:text-gray-300">Upload Images</span>
          </label>
          <input id="imageUpload" type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="w-20 h-20 object-cover rounded" />
                  <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video */}
          <label htmlFor="videoUpload" className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 hover:border-green-600 transition">
            <span className="text-gray-600 dark:text-gray-300">Upload a Property Video</span>
          </label>
          <input id="videoUpload" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
          {videoPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {videoPreviews.map((src, i) => (
                <div key={i} className="relative">
                  <video src={src} controls className="w-32 h-20 rounded" />
                  <button type="button" onClick={() => handleRemoveVideo(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 dark:text-gray-100" disabled={loading || success}>
              Cancel
            </button>

            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" disabled={loading || success}>
              {loading ? "Uploading..." : "Add"}
            </button>
          </div>
        </form>

        <LoadingModal
          key={Date.now()}
          loading={loading}
          success={success}
          error={error}
          message="Adding Property... This may take some minutes please wait."
          successMessage="Property Added Successfully!"
          errorMessage="Failed to add property. Try again."
        />
      </div>
    </div>
  );
}
