import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AGENTAPI from "../../utils/agentaxios";
import useAuth from "../../hooks/useAuth";

function AgentPropertiesDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const formatPrice = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActionText = (type) => {
    if (!type) return "View";
    switch (type.toLowerCase()) {
      case "sale":
      case "sell":
        return "Buy Now";
      case "rent":
        return "Rent Now";
      case "lease":
        return "Lease Now";
      default:
        return `${type} Now`;
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await AGENTAPI.get(`/agents/properties/single/${id}`);
        setProperty(res.data.property);
      } catch (err) {
        console.error("Failed to fetch property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-800">
          Please{" "}
          <span
            className="text-green-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            login
          </span>{" "}
          to view property details.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Property not found.
      </div>
    );
  }

  const videoSlides = property.videos || [];
  const imageSlides = property.images || [];
  const slides = [...videoSlides, ...imageSlides];

  const agentData = property.agent || null;
  const agentUser = agentData?.user || (typeof agentData === "object" ? agentData : null);
  const agentName = agentUser?.name || agentData?.agencyName || "Professional Agent";
  const agentImage = agentData?.profileImage || agentUser?.profileImage || "";

  return (
    <div className="container mx-auto px-4 py-8 mt-20 md:mt-10">

      {/* Title & Verified Badge */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          {/* 🌟 PROPERTY VERIFICATION BADGE */}
          {property.status === "approved" && (
            <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shadow-sm mt-1">
              <i className="fas fa-check-circle text-green-600"></i> Verified Listing
            </span>
          )}
        </div>
        <p className="text-green-600 text-xl font-semibold mt-2">
          {formatPrice(property.price)}
        </p>
        <p className="text-gray-500">{property.location}</p>
      </div>

      {/* MAIN SLIDER */}
      <div className="relative w-full max-w-4xl mx-auto mb-6 aspect-video">
        {slides[currentSlide] ? (
          slides[currentSlide].endsWith(".mp4") || slides[currentSlide].includes("video") ? (
            <video className="w-full h-full rounded-xl shadow-lg" src={slides[currentSlide]} controls></video>
          ) : (
            <img src={slides[currentSlide]} alt="Property" className="w-full h-full object-cover rounded-xl shadow-lg" />
          )
        ) : null}

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full"
            >
              ❮
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-full"
            >
              ❯
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {slides.length > 1 && (
        <div className="flex gap-3 justify-center mb-6">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-20 h-20 rounded-lg cursor-pointer border-2 overflow-hidden ${
                currentSlide === index ? "border-green-600" : "border-transparent"
              }`}
            >
              {slide.endsWith(".mp4") || slide.includes("video") ? (
                <video src={slide} className="w-full h-full object-cover"></video>
              ) : (
                <img src={slide} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* DETAILS */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
          <p><span className="font-semibold">Type:</span> {property.type}</p>
          {property.type?.toLowerCase() === "land" ? (
            <p><span className="font-semibold">Area:</span> {property.area} sq.m</p>
          ) : (
            <>
              <p><span className="font-semibold">Beds:</span> {property.bedrooms}</p>
              <p><span className="font-semibold">Toilets:</span> {property.toilets}</p>
            </>
          )}
          {property.features?.length > 0 && (
            <p className="col-span-2 md:col-span-4">
              <span className="font-semibold">Features:</span> {property.features.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* TRANSACTION BUTTON */}
      {property.transactionType && (
        <div className="flex justify-center mb-6">
          <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition transform hover:scale-[1.01]">
            {getActionText(property.transactionType)}
          </button>
        </div>
      )}

      {/* AGENT INFO */}
      {agentData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  agentImage.trim()
                    ? agentImage
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=16a34a&color=fff`
                }
                alt="Agent Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-green-600"
              />
              <span
                className={`absolute -bottom-1 right-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                  agentData.status === "approved" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {agentData.status === "approved" ? "Verified" : "Pending"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agentName}</h3>
              <p className="text-sm text-gray-500">{agentData.state || "Location not specified"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentPropertiesDetails;
