import React, { useEffect, useState } from "react";
import AGENTAPI from "../../utils/agentaxios";
import { useNavigate } from "react-router-dom";

function TrustedAgent() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [displayAgents, setDisplayAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        console.log("📡 Fetching agents from backend...");

        const res = await AGENTAPI.get("/agents/profile/all"); // Ensure backend route returns { agents: [] }

        console.log("✅ Raw response:", res.data);

        const allAgents = res.data?.agents || [];
        console.log("✅ All agents fetched:", allAgents);

        setAgents(allAgents);
      } catch (err) {
        console.error("❌ Failed to fetch agents:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // 🌀 Pick 4 random agents every 20 seconds
  useEffect(() => {
    if (agents.length === 0) return;

    const pickRandomAgents = () => {
      const shuffled = [...agents].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      setDisplayAgents(selected);
      console.log("🎯 Displaying these 4 agents:", selected);
    };

    pickRandomAgents(); // initial pick
    const interval = setInterval(pickRandomAgents, 20000); // refresh every 20 seconds

    return () => clearInterval(interval);
  }, [agents]);

  const handleFindAgents = () => {
    navigate("/find-agents");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-gray-900 rounded-xl shadow-lg -mt-60 md:-mt-16 md:mb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* 🧑‍💼 Agent Images with Verification Indicators */}
        <div className="flex items-center justify-center md:justify-start -space-x-4 overflow-x-auto">
          {loading ? (
            <p className="text-white">Loading agents...</p>
          ) : displayAgents.length === 0 ? (
            <p className="text-white">No agents available.</p>
          ) : (
            <div className="flex -space-x-4 overflow-x-auto px-2">
              {displayAgents.map((agent) => {
                const name = agent.user?.name || agent.agencyName || "Agent";
                const profileImg = agent.profileImage || agent.user?.profileImage || "/default-agent.png";
                
                return (
                  <div key={agent._id} className="relative z-10 hover:z-20 transition group">
                    <img
                      src={profileImg}
                      alt={name}
                      title={name}
                      className="h-12 w-12 md:h-14 md:w-14 rounded-full border-2 border-white object-cover hover:scale-110 transition transform duration-200"
                    />
                    {/* 🌟 ABSOLUTE VERIFICATION MINI-BADGE FOR STACKED AVATARS */}
                    {agent.status === "approved" && (
                      <span 
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center shadow-md"
                        title="Verified Agent"
                      >
                        <i className="fas fa-check text-[7px] text-white font-extrabold hidden group-hover:block"></i>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📝 Center Text */}
        <div className="text-center md:text-left flex-1 px-2">
          <h2 className="text-lg md:text-xl font-bold text-white">Our Agents</h2>
          <p className="text-white text-sm">
            Connect with agents ready to help you find your dream property.
          </p>
        </div>

        {/* 🔍 Meet Agents button */}
        <div className="hidden md:flex justify-center md:justify-end">
          <button
            onClick={handleFindAgents}
            className="bg-white text-green-900 px-4 py-3 rounded-lg hover:bg-gray-200 transition font-bold text-sm md:text-base flex items-center"
          >
            Meet Agents
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrustedAgent;
