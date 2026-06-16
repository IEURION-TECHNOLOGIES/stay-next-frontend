import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../sections/purposeSections/purposeNav";
import PropertiesNav from "../../sections/propertiesection/propertiesNav";
import ResultCard from "../../sections/searchSections/ResultCard";
import AGENTAPI from "../../utils/agentaxios";

// Scroll-changing Ad images
const adImages = [
  "https://images.unsplash.com/photo-1599423300746-b62533397364?fit=crop&w=300&h=600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=300&h=600",
  "https://images.unsplash.com/photo-1600607681928-46063e0f79c2?fit=crop&w=300&h=600",
];

function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParam = new URLSearchParams(location.search).get("query");

  const [selectedType, setSelectedType] = useState("All");
  const [adIndex, setAdIndex] = useState(0);
  const [filters, setFilters] = useState({});
  const [purpose, setPurpose] = useState(queryParam ? queryParam.toLowerCase() : "all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Map query to UI tab
  useEffect(() => {
    if (!queryParam) {
      setSelectedType("All");
      setPurpose("all");
      return;
    }

    const formatted =
      queryParam.toLowerCase() === "sale" ? "Buy"
      : queryParam.charAt(0).toUpperCase() + queryParam.slice(1);
    setSelectedType(formatted);
    setPurpose(queryParam.toLowerCase());
  }, [queryParam]);

  // ✅ Handle tab select
  const handleSelect = (tab) => {
    setSelectedType(tab); // highlight immediately
    let queryValue = tab === "Buy" ? "sale" : tab.toLowerCase();

    if (tab === "All") {
      setPurpose("all");
      setFilters({});
      navigate("/properties", { replace: true });
    } else {
      setPurpose(tab.toLowerCase());
      navigate(`/purpose?query=${queryValue}`, { replace: true });
    }
  };

  // ✅ Filters
  const handleFilterChange = (newFilters) => setFilters(newFilters);

  // ✅ Ad rotation
  useEffect(() => {
    const handleScroll = () => {
      const nextIndex = Math.floor(window.scrollY / 1000) % adImages.length;
      setAdIndex(nextIndex);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Fetch search results based on query
  useEffect(() => {
    const fetchResults = async () => {
      if (!queryParam) return;
      try {
        setLoading(true);
        setResults([]);

        const res = await AGENTAPI.get("/agents/properties/approved");
        const props = res.data.properties || [];
        const q = queryParam.toLowerCase();

        const exact = props.find(
          (p) =>
            p.title.toLowerCase() === q ||
            p.location.toLowerCase() === q ||
            p.type.toLowerCase() === q
        );

        let similar = props.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q)
        );

        if (exact) {
          similar = [exact, ...similar.filter((p) => p._id !== exact._id)];
        }

        setResults(similar);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryParam]);

  return (
    <div className="space-y-2 mb-5 relative">
      {/* Tabs */}
      <div className="px-8 mt-24 md:absolute md:left-[0px] md:top-0 md:mt-5">
        <Navbar selectedType={selectedType} onSelect={handleSelect} />
      </div>

      {/* Filters */}
      <div className="px-4 md:ml-56">
        <PropertiesNav onFilterChange={handleFilterChange} />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-6 mt-4 overflow-visible">
        {/* Results Section */}
        <div className="space-y-6 px-3 md:px-7 overflow-visible">
          <h1 className="text-2xl font-bold mb-6">
            Search Results for "{queryParam}"
          </h1>

          {loading ? (
            <div className="p-6 text-center">Loading search results...</div>
          ) : results.length > 0 ? (
            <ResultCard results={results} />
          ) : (
            <div className="w-full max-w-4xl p-6 border rounded-lg shadow text-center text-red-500 font-semibold">
              No properties found for "{queryParam}"
            </div>
          )}
        </div>

        {/* Sticky Ad */}
        <div className="hidden lg:block sticky top-24 h-fit w-[360px] md:-z-20">
          <img
            src={adImages[adIndex]}
            alt={`Ad ${adIndex + 1}`}
            className="w-full rounded-xl shadow-lg object-cover transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}

export default SearchResultsPage;
