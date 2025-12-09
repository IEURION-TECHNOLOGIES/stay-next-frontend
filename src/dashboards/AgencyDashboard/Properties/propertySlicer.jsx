import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PropertySlider({ videos = [], images = [], _id }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [current, setCurrent] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  // Combine videos and images into one media array
  const mediaSlides = [
    ...videos.map((url) => ({ type: "video", url })),
    ...images.map((src) => ({ type: "image", src })),
  ];

  // Extend slides for infinite loop
  const extendedSlides =
    mediaSlides.length > 0
      ? [mediaSlides[mediaSlides.length - 1], ...mediaSlides, mediaSlides[0]]
      : [];

  // Handle infinite loop transition
  const handleTransitionEnd = () => {
    if (current === 0) {
      setIsAnimating(false);
      setCurrent(mediaSlides.length);
    } else if (current === mediaSlides.length + 1) {
      setIsAnimating(false);
      setCurrent(1);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const prevSlide = () => setCurrent((prev) => prev - 1);
  const nextSlide = () => setCurrent((prev) => prev + 1);

  // Navigation actions
  const handleView = () => navigate(`/properties/${_id}`);
  const handleEdit = () => navigate(`/properties/edit/${_id}`);
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      console.log("Deleting property:", _id);
    }
  };

  if (!mediaSlides.length) {
    return (
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center rounded">
        No Media
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg group">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        onTransitionEnd={handleTransitionEnd}
        className={`flex ${isAnimating ? "transition-transform duration-500 ease-in-out" : ""}`}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {extendedSlides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 h-56 relative">
            {slide.type === "video" ? (
              <video
                controls
                className="w-full h-full object-cover rounded"
                preload="metadata"
              >
                <source src={slide.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={slide.src}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white text-black rounded-full py-1 px-2 shadow opacity-0 group-hover:opacity-100 transition"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white text-black rounded-full py-1 px-2 shadow opacity-0 group-hover:opacity-100 transition"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}
