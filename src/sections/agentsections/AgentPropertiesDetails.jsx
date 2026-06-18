Let's add that verified property badge! Since your `property` object includes its own top-level `status: "approved"` right alongside the agent's status, we can render a beautiful verification badge right next to the property title inside both the **Details Screen** and the **Showcase Card**.

Here are the updated components with the badge logic added seamlessly.

---

### 1️⃣ Updated `AgentPropertiesDetails` File

This adds a green check badge directly next to the property title string if `property.status === "approved"`.

```javascript
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

```

---

### 2️⃣ Updated `PropertyCard` Component (inside `PropertyShowcaseCard.js`)

This automatically updates the properties feed loop to inject a direct verified indicator icon directly into the card body text layer structure.

```javascript
/* ---------------- PROPERTY CARD ---------------- */
function PropertyCard({ property }) {
  const navigate = useNavigate();
  const {
    images = [],
    videos = [],
    price,
    type,
    bedrooms,
    toilets,
    area,
    transactionType,
    highlights = [],
    location,
    agent = {},
    features = [],
    title,
    status, // 🌟 Pulling top-level payload approval verification state status 
  } = property;

  const formatPrice = (price) => price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const [current, setCurrent] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const sliderRef = useRef(null);

  const mediaSlides = [
    ...videos.map((src) => ({ type: "video", src })),
    ...images.map((src) => ({ type: "image", src })),
  ];

  const extendedSlides =
    mediaSlides.length > 0
      ? [mediaSlides[mediaSlides.length - 1], ...mediaSlides, mediaSlides[0]]
      : [];

  const handleTransitionEnd = () => {
    if (current === 0) setCurrent(mediaSlides.length);
    else if (current === mediaSlides.length + 1) setCurrent(1);
  };

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const prevSlide = () => setCurrent((prev) => prev - 1);
  const nextSlide = () => setCurrent((prev) => prev + 1);

  const handleSendEmail = () => {
    setShowEmailPopup(false);
    setUserEmail("");
    setUserPhone("");
  };

  const isLand = type?.toLowerCase() === "land";

  return (
    <>
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl items-start gap-6 border rounded-xl bg-white shadow-lg overflow-hidden">
        {/* Transaction Type Label */}
        {transactionType && (
          <div
            className={`absolute top-4 left-4 z-30 flex items-center gap-2 text-white text-sm font-extrabold tracking-wide 
              px-3 py-1 rounded-full shadow-2xl ring-2 ring-white/40 backdrop-blur-md
              ${
                transactionType?.toLowerCase() === "sale"
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-700"
                  : transactionType?.toLowerCase() === "rent"
                  ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                  : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600"
              }`}
            style={{ animation: "floatBadge 3s ease-in-out infinite" }}
          >
            <i className="fas fa-tag text-white text-base"></i>
            <span>FOR {transactionType?.toUpperCase()}</span>
          </div>
        )}

        {/* Slider */}
        <div className="relative w-full md:w-1/2 overflow-hidden h-72 group border rounded-2xl md:rounded-tl-xl md:rounded-bl-xl">
          <div
            ref={sliderRef}
            onTransitionEnd={handleTransitionEnd}
            className={`flex ${isAnimating ? "transition-transform duration-500 ease-in-out" : ""}`}
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {extendedSlides.map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0 h-72 relative">
                {slide.type === "video" ? (
                  <video src={slide.src} controls className="w-full h-72 object-cover bg-black rounded" />
                ) : (
                  <img src={slide.src} alt={`Slide ${index}`} className="w-full h-72 object-cover rounded" />
                )}
              </div>
            ))}
          </div>

          {/* Agent Info */}
          {agent?.profileImage && (
            <div
              className="absolute bottom-3 left-3 flex flex-col items-center z-30 cursor-pointer"
              onClick={() => navigate(`/agents/${agent._id}/listings`)}
            >
              <img src={agent.profileImage} alt={agent.name || "Agent"} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
              <span className="text-xs font-semibold text-white drop-shadow-md mt-1">{agent.name}</span>
            </div>
          )}

          {/* Arrows */}
          <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white text-black rounded-full py-1.5 px-3 shadow opacity-0 group-hover:opacity-100">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white text-black rounded-full py-1.5 px-3 shadow opacity-0 group-hover:opacity-100">
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Like/Love */}
          <div className="absolute bottom-3 right-4 flex gap-4 z-30">
            <LikeLove propertyId={property._id} initialLikes={property.likedBy || 0} initialLoves={property.lovedBy || 0} />
          </div>
        </div>

        {/* Details Wrapper */}
        <div className="w-full md:w-1/2 px-4 py-4 text-black rounded-lg space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col max-w-[65%]">
              {/* 🌟 TITLE WITH INTEGRATED VERIFIED CHECK BADGE */}
              <div className="flex items-center gap-1.5 text-2xl font-semibold text-gray-800">
                <span className="truncate">{title}</span>
                {status === "approved" && (
                  <i className="fas fa-check-circle text-green-500 text-lg flex-shrink-0" title="Verified Property Listing"></i>
                )}
              </div>
            </div>
            <div className="text-xl font-bold text-black text-right whitespace-nowrap">₦{formatPrice(price)}</div>
          </div>

          {/* Features line */}
          <div className="flex flex-wrap items-center text-md text-gray-700 gap-2 font-bold">
            <span className="flex items-center gap-1">
              <i className={isLand ? "fas fa-tree" : "fas fa-home"}></i> {type}
            </span>
            <span>|</span>
            {!isLand && (
              <>
                <span className="flex items-center gap-1"><i className="fas fa-bed"></i> {bedrooms} Bed</span>
                <span>|</span>
                <span className="flex items-center gap-1"><i className="fas fa-bath"></i> {toilets} Bath</span>
              </>
            )}
            {isLand && (
              <span className="flex items-center gap-1"><i className="fas fa-ruler-combined"></i> {area}</span>
            )}
          </div>

          {/* Highlights */}
          <div className="flex gap-2 text-lg text-green-600 flex-wrap">
            {highlights.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-1">|</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>

          <PropertyFeatures features={features} />

          {/* Location */}
          <div className="text-sm text-gray-800">
            <i className="fas fa-map-marker-alt text-green-500 mr-2"></i>
            <a href={`https://www.google.com/maps/search/?query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
              {location}
            </a>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button onClick={() => setShowEmailPopup(true)} className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded">
              <i className="fas fa-envelope"></i> Email
            </button>
            <button onClick={() => setShowPhonePopup(true)} className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded">
              <i className="fas fa-phone-alt"></i> Phone
            </button>
            <a href={`https://wa.me/${agent.verification?.phone || ""}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded">
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* View More Trigger */}
      <div className="w-full flex justify-center md:-mt-3 md:mb-10">
        <button onClick={() => navigate(`/properties/${property._id}`)} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition">
          View More
        </button>
      </div>
    </>
  );
}

```
