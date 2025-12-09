import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // your auth context

const PolicyPage = ()=> {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user?.role) setRole(user.role.toLowerCase());
  }, [user]);

  // ===== POLICIES =====
  const policies = {
    visitor: [
      "Clients (visitors, buyers, renters, or bookers) must never make payments directly to agents.",
      "Clients have the right to verify listed properties after or before making any payment.",
      "Payments are processed only after verification approval.",
      "If a client is not satisfied after property verification, refund requests can be initiated.",
      "Ensure you meet agents only in safe, public environments.",
      "We prioritize user safety and protect against fraudulent property listings.",
      "All transactions are handled through verified and secure channels only."
    ],
    agent: [
      "Agents must upload only verified and authentic property listings.",
      "Agents are prohibited from requesting direct payments from clients.",
      "All payments should go through the official platform to protect both clients and agents.",
      "Agents must maintain transparency, honesty, and professionalism at all times.",
      "Agents must cooperate with clients for safe and verifiable inspections.",
      "Violation of these policies may lead to account suspension or permanent deactivation."
    ],
   agency: [
  "Real estate companies are fully responsible for the authenticity, accuracy, and legitimacy of every property they list on the platform.",
  "All properties must undergo proper verification and documentation checks before being uploaded.",
  "Property details such as price, location, ownership status, images, and supporting documents must be accurate and up-to-date.",
  "Real estate companies must not request or accept direct payments from clients outside the approved payment channels.",
  "Inspection of properties must be transparent, safe, and accessible to clients upon request.",
  "Refunds must be honored if a client rejects a property after proper verification and inspection.",
  "Hidden charges, misleading information, or deceptive listing practices are strictly prohibited.",
  "Companies must maintain professionalism and protect clients from fraudulent or unsafe property dealings.",
  "The platform reserves the right to suspend or remove any real estate company that violates these policies."
],

    serviceprovider: [
      "Service providers (electricians, cleaners, movers, etc.) must only accept verified service requests.",
      "All payments are handled through the platform to prevent fraud.",
      "Providers must deliver services as described and within agreed timelines.",
      "Unsafe or unprofessional behavior may lead to suspension.",
      "Clients can report misconduct, and investigations will follow immediately."
    ],
    professional: [
      "Professionals (lawyers, surveyors, valuers, etc.) must verify property legitimacy before approval.",
      "All dealings must be transparent, recorded, and safe for all users.",
      "Professionals must not charge clients outside the platform for listed services.",
      "We reserve the right to review and revoke professional access for misconduct."
    ],
    hotel: [
  "All hotel bookings must be made through the platform or verified hotel channels only.",
  "Guests should never make direct payments to hotel staff outside approved payment methods.",
  "Full details of room type, pricing, and amenities must be clearly provided before booking.",
  "Guests have the right to inspect their room upon arrival before confirming check-in.",
  "Hotels must maintain cleanliness, safety, and standard hospitality requirements.",
  "Any hidden charges or unapproved fees are strictly prohibited.",
  "Guests must provide valid identification during check-in for security purposes.",
  "Refunds follow the hotel's cancellation policy, which must be clearly stated and transparent.",
  "Illegal activities, violence, or property damage by guests may lead to penalties or immediate ejection.",
  "Hotels are responsible for the safety of guests' personal property within reasonable limits.",
  "Staff must maintain professionalism, confidentiality, and proper customer service at all times.",
  "Guests must report issues immediately for quick resolution by hotel management.",
  "Hotel staff cannot request or accept bribes, special payments, or personal deals from guests.",
  "All hotel listings must be accurate, updated, and verified before being visible on the platform.",
  "Any violation of safety, payment, or operational rules may lead to suspension from the platform."
]

  };

  const activePolicy = policies[role] || [];

  // ===== Handle Continue =====
  const handleContinue = () => {
    if (!agreed) return;

    if (role === "agent") {
      navigate("/agent-verification");
    } else if(role === "visitor"){
      navigate("/visitor-more");
    } else if (role === "agency") {
      navigate("/agency-verification");
    } else if(role === "serviceprovider"){
      navigate("/service-verification");
    }else if(role === "professional"){
      navigate("/professional-verification");
    }else if(role === "hotel"){
      navigate("/hotel-verification");
    }else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8 border-t-8 border-green-600">
      <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
        {role === "agency"
          ? "Real Estate Company Policy"
          : role
          ? `${role.charAt(0).toUpperCase() + role.slice(1)} Policy`
          : "User Policy"}
      </h1>


        {activePolicy.length ? (
          <ul className="space-y-3 text-gray-700 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4">
            {activePolicy.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <i className="fas fa-check text-green-600 mt-1"></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No policy available for your role yet.
          </p>
        )}

        {/* Agreement Checkbox */}
        <div className="flex items-center mt-6">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="agree" className="ml-2 text-gray-700">
            I have read and agree with the above policy.
          </label>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!agreed}
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold transition ${
            agreed
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}


export default PolicyPage