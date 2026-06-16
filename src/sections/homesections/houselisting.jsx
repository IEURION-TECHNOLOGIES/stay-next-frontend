import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AGENTAPI from "../../utils/agentaxios";
import "../../styles/houselisting.css";

const Houselisting = () => {
  const scrollRef = useRef();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all agent properties
  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log("📡 Fetching properties...");
        const res = await AGENTAPI.get("/agents/properties/approved");

        const props = res.data?.properties || [];
        console.log("✅ Raw properties from backend:", props);

        // ✅ Keep only those with an agent assigned
        const agentProps = props.filter((p) => p.agent);
        console.log("✅ After filtering (has agent):", agentProps);

        // ✅ Take only 7 unique properties
        const uniqueProps = Object.values(
          agentProps.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
          }, {})
        ).slice(0, 7);

        console.log("✅ Final listings to display:", uniqueProps);
        setListings(uniqueProps);
      } catch (err) {
        console.error("❌ Failed to fetch properties:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // 🌀 Scroll buttons
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amt = 400;
    scrollRef.current.scrollLeft += dir === "next" ? amt : -amt;
  };

  // 🏠 Property Card Component
  const Card = ({ property }) => {
    const { title, location, images = [], image, coverImage } = property;

    // ✅ Choose the right image field
    const imageSrc = images[0] || image || coverImage || "/default-house.jpg";

    return (
      <div className="bg-white rounded-xl p-4 w-[280px] md:w-[350px] h-[450px] shrink-0 shadow-lg flex flex-col justify-between">
        <div>
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-46 object-cover rounded-lg mb-4 cursor-pointer"
            onClick={() => navigate(`/properties/${property._id}`)}
          />
          <h3 className="text-2xl font-bold mb-1">{title}</h3>
          <p className="text-md text-gray-600">{location || "Location not specified"}</p>
        </div>
        <button className="bg-green-100 text-green-800 px-4 py-3 rounded mt-4 w-full flex items-center justify-center gap-2 font-semibold">
          <i className="fab fa-whatsapp text-lg"></i> WhatsApp
        </button>
      </div>
    );
  };

  // 🕓 Loading / No data messages
  if (loading)
    return <p className="text-center py-10 text-gray-600">Loading featured properties...</p>;

  if (!listings.length)
    return (
      <p className="text-center py-10 text-red-500">
        No featured agent properties available.
      </p>
    );

  // ✅ Render listings
  return (
    <div className="max-w-[1200px] mx-auto bg-white p-4 md:p-6 rounded-xl relative">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-green-800">
        Top Properties Listing
      </h2>

      {/* Scroll arrows */}
      <button
        onClick={() => scroll("prev")}
        className="hidden md:flex absolute top-1/2 left-2 -translate-y-1/2 z-10 px-3 py-2 rounded-full shadow bg-white hover:bg-gray-100"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button
        onClick={() => scroll("next")}
        className="hidden md:flex absolute top-1/2 right-2 -translate-y-1/2 z-10 px-3 py-2 rounded-full shadow bg-white hover:bg-gray-100"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Property cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-2 scrollbar-hidden"
      >
        {listings.map((p) => (
          <Card key={p._id} property={p} />
        ))}
      </div>

      {/* View more button */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-gray-100 text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          onClick={() => navigate("/properties")}
        >
          View More Listings
        </button>
      </div>
    </div>
  );
};

export default Houselisting;
