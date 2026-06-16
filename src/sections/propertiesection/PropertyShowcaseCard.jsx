import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyFeatures from "./propertyFeatures";
import AGENTAPI from "../../utils/agentaxios";
import "../../styles/badge.css";
import LikeLove from "../../components/ui/LikeLove";

function PropertyShowcaseCard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      const res = await AGENTAPI.get(`/agents/properties/approved`);
      const data = res.data.properties || [];

      const uniqueProps = Object.values(
        data
          .filter((p) => p.agent)
          .reduce((acc, item) => {
            if (!acc[item._id]) acc[item._id] = item;
            return acc;
          }, {})
      );

      setProperties(uniqueProps);
    } catch (err) {
      console.error("❌ Failed to fetch filtered properties:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, []);


  if (loading) {
    return (
      <div className="w-full max-w-4xl p-6 border rounded-lg shadow text-center">
        Loading properties...
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="w-full max-w-4xl p-6 border rounded-lg shadow text-center text-red-500">
        No properties found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {properties.map((property) => (
        <PropertyCard key={property._id} property={property} navigate={navigate} />
      ))}
    </div>
  );
}

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
  } = property;

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const [current, setCurrent] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const sliderRef = useRef(null);

  const mediaSlides = [
  ...videos.map((src) => ({ type: "video", src })), // ⭐ videos first
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
    console.log("Contact info sent:", userEmail, userPhone);
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
              px-3 py-1 rounded-full shadow-2xl ring-2 ring-white/40 backdrop-blur-md animate-pulse-slow
              ${
                transactionType?.toLowerCase() === "sale"
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-700"
                  : transactionType?.toLowerCase() === "rent"
                  ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                  : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600"
              }`}
            style={{ animation: "floatBadge 3s ease-in-out infinite" }}
          >
            <i
              className={`fas fa-tag text-white text-base ${
                transactionType?.toLowerCase() === "sale"
                  ? "drop-shadow-[0_0_6px_#22c55e]"
                  : transactionType?.toLowerCase() === "rent"
                  ? "drop-shadow-[0_0_6px_#3b82f6]"
                  : "drop-shadow-[0_0_6px_#f97316]"
              }`}
            ></i>
            <span>FOR {transactionType?.toUpperCase()}</span>
          </div>
        )}

        {/* Slider */}
        <div className="relative w-full md:w-1/2 overflow-hidden h-72 group border rounded-2xl md:rounded-tl-xl md:rounded-bl-xl">
          <div
            ref={sliderRef}
            onTransitionEnd={handleTransitionEnd}
            className={`flex ${
              isAnimating ? "transition-transform duration-500 ease-in-out" : ""
            }`}
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
{extendedSlides.map((slide, index) => (
  <div key={index} className="w-full flex-shrink-0 h-72 relative">
    {slide.type === "video" ? (
      <video
        src={slide.src}
        controls
        className="w-full h-72 object-cover bg-black rounded"
      />
    ) : (
      <img
        src={slide.src}
        alt={`Slide ${index}`}
        className="w-full h-72 object-cover rounded"
      />
    )}
  </div>
))}

          </div>

          {/* Agent Info */}
          {agent?.profileImage && (
            <div
              className="absolute bottom-3 left-3 flex flex-col items-center z-30 cursor-pointer"
              title={`View all listings by ${agent.name}`}
              onClick={() => navigate(`/agents/${agent._id}/listings`)}
            >
              <img
                src={agent.profileImage}
                alt={agent.name || "Agent"}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
              />
              <span className="text-xs font-semibold text-white drop-shadow-md mt-1">
                {agent.name}
              </span>
            </div>
          )}

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white text-black rounded-full py-1.5 px-3 shadow opacity-0 group-hover:opacity-100"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white text-black rounded-full py-1.5 px-3 shadow opacity-0 group-hover:opacity-100"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Like/Love */}
          <div className="absolute bottom-3 right-4 flex gap-4 z-30">
            <LikeLove
              propertyId={property._id}
              initialLikes={property.likedBy || 0}
              initialLoves={property.lovedBy || 0}
            />
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 px-4 py-4 text-black rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-semibold text-gray-800 truncate">{title}</div>
            <div className="text-xl font-bold text-black">₦{formatPrice(price)}</div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center text-md text-gray-700 gap-2 font-bold">
            <span className="flex items-center gap-1">
              <i className={isLand ? "fas fa-tree" : "fas fa-home"}></i> {type}
            </span>
            <span>|</span>
            {!isLand && (
              <>
                <span className="flex items-center gap-1">
                  <i className="fas fa-bed"></i> {bedrooms} Bed
                </span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-bath"></i> {toilets} Bath
                </span>
              </>
            )}
            {isLand && (
              <span className="flex items-center gap-1">
                <i className="fas fa-ruler-combined"></i> {area}
              </span>
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

          {/* Property Features */}
          <PropertyFeatures features={features} />

          {/* Location */}
          <div className="text-sm text-gray-800">
            <i className="fas fa-map-marker-alt text-green-500 mr-2"></i>
            <a
              href={`https://www.google.com/maps/search/?query=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-700"
            >
              {location}
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              onClick={() => setShowEmailPopup(true)}
              className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded"
            >
              <i className="fas fa-envelope"></i> Email
            </button>
            <button
              onClick={() => setShowPhonePopup(true)}
              className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded"
            >
              <i className="fas fa-phone-alt"></i> Phone
            </button>
            <a
              href={`https://wa.me/${agent.verification?.phone || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-[#D1F0E2] font-bold text-green-600 text-sm px-4 py-1 rounded"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* View More */}
      <div className="w-full flex justify-center md:-mt-3 md:mb-10">
        <button
          onClick={() => navigate(`/properties/${property._id}`)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          View More
        </button>
      </div>

      {/* Modals */}
      {showEmailPopup && (
        <Modal onClose={() => setShowEmailPopup(false)}>
          <h2 className="text-lg font-bold mb-4 text-center">Contact Agent</h2>
          <input
            type="email"
            placeholder="Your Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3 text-sm"
          />
          <input
            type="tel"
            placeholder="Your Phone Number"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4 text-sm"
          />
          <button
            onClick={handleSendEmail}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Send
          </button>
        </Modal>
      )}
      {showPhonePopup && (
        <Modal onClose={() => setShowPhonePopup(false)}>
          <h2 className="text-lg font-bold text-gray-800 text-center">Call Agent</h2>
          <p className="text-sm text-gray-600">
            Agent: <strong>{agent.name}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Phone: <strong>{agent.verification?.phone}</strong>
          </p>
          <a
            href={`tel:${agent.verification?.phone}`}
            className="inline-block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2 text-center"
          >
            Call Now
          </a>
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg relative">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

export default PropertyShowcaseCard;
export { PropertyCard };
