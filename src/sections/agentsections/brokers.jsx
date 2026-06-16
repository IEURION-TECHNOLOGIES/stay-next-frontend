// import React, { useEffect, useState } from 'react';
// import { NIGERIA_STATES } from "../../utils/states";
// import AgentCard from './agentCard';
// import AGENTAPI from '../../utils/axios';
// import useAuth from '../../hooks/useAuth'; 
// import { useNavigate } from 'react-router-dom';

// function Brokers() {
//   const { user } = useAuth();
//   const [selectedState, setSelectedState] = useState("");
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) return;
//     const fetchAgents = async () => {
//       try {
//         setLoading(true);
//         const res = await AGENTAPI.get('/agents');
//         console.log("Fetched agents:", res.data.agents);
//         setAgents(res.data.agents || []);
//       } catch (err) {
//         console.error("Failed to fetch agents:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAgents();
//   }, [user]);

//   // ✅ Only show agents that are approved
//   const approvedAgents = agents.filter(
//     (agent) => agent.isVerified || agent.verification?.status === "Approved"
//   );

//   const filteredAgents = selectedState
//     ? approvedAgents.filter(agent => agent.verification?.state === selectedState)
//     : approvedAgents;

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
//         <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
//           <h2 className="text-xl font-bold text-gray-800">
//             Explore our trusted real estate agents
//           </h2>
//           <p className="text-gray-600 text-sm mt-2">
//             Agents with a proven track record of high response rates and authentic listings.
//           </p>
//         </div>

//         <div className="flex flex-col">
//           <label 
//             htmlFor="state-select" 
//             className="text-sm font-semibold text-gray-700 mb-2"
//           >
//             Filter by State
//           </label>
//           <select
//             id="state-select"
//             value={selectedState}
//             onChange={e => setSelectedState(e.target.value)}
//             disabled={!user}
//             className={`px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 ${
//               !user ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white"
//             }`}
//           >
//             <option value="">-- Choose a state --</option>
//             {NIGERIA_STATES.map(state => (
//               <option key={state} value={state}>{state}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Agent Grid / Messages */}
//       <div>
//         {!user ? (
//           <div className="text-center bg-gray-100 p-10 rounded-2xl shadow-md border">
//             <p className="text-lg font-semibold text-gray-700">
//               You need to{" "}
//               <span
//                 onClick={() => navigate('/login')}
//                 className="text-green-600 cursor-pointer hover:underline"
//               >
//                 login
//               </span>{" "}
//               to see all our trusted agents.
//             </p>
//           </div>
//         ) : loading ? (
//           <div className="flex justify-center py-16">
//             <p className="text-gray-600 animate-pulse">Loading agents...</p>
//           </div>
//         ) : filteredAgents.length === 0 ? (
//           <div className="text-center bg-red-50 p-10 rounded-2xl shadow border border-red-200">
//             <p className="text-lg font-semibold text-red-600">
//               No agents found for this state.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredAgents.map(agent => (
//               <AgentCard 
//                 key={agent._id} 
//                 {...agent}
//                 state={agent.verification?.state}
//                 agencyLogo={agent.verification?.agencyLogo}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Brokers;

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

  // 🚫 REMOVE SUSPENDED AGENTS + FILTER BY STATE
  const filteredAgents = agents
    .filter(agent => agent.user?.isSuspended !== true)
    .filter(agent =>
      selectedState
        ? agent.profile?.state === selectedState
        : true
    );
    console.log("Filtered Agents:", filteredAgents);

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
            <option value="">-- Choose a state --</option>
            {NIGERIA_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">
          Loading agents…
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center bg-red-50 p-10 rounded-xl">
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
              name={agent.user?.name}
              profileImage={agent.user?.profileImage}
              phone={agent.profile?.phone}
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