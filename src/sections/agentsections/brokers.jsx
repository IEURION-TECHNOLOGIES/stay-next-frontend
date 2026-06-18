import React, { useEffect, useState } from 'react';
import { NIGERIA_STATES } from "../../utils/states";
import AgentCard from './agentCard';
import AGENTAPI from '../../utils/agentaxios';

function Brokers() {
  const [selectedState, setSelectedState] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await AGENTAPI.get("/agents/profile/all");
        setAgents(res.data.agents || []);
        console.log("Fetched agents:", res.data.agents);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents
    .filter(agent => agent.isSuspended !== true)
    .filter(agent =>
      selectedState
        ? agent.state === selectedState
        : true
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="text-xl font-bold text-gray-800">
            Explore our trusted real estate agents
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Verified agents with active listings only.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Filter by State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- All States --</option>
            {NIGERIA_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 animate-pulse">
          Loading agents…
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center bg-red-50 p-10 rounded-xl border border-red-200">
          <p className="text-red-600 font-semibold">
            No active agents found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent._id}
              _id={agent._id}
              name={agent.user?.name || "Agent"}
              profileImage={agent.profileImage || agent.user?.profileImage || ""}
              phone={agent.phone}
              agencyName={agent.agencyName}
              agencyLogo={agent.agencyLogo}
              state={agent.state}
              status={agent.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Brokers;
