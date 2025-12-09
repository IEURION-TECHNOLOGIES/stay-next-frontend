import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AGENTAPI from "../../utils/agentaxios";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";
import { NIGERIA_STATES } from "../../utils/states";

const AgentVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const modalTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [hasAgency, setHasAgency] = useState(false);

  // Personal Info
  const [profileImage, setProfileImage] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [nin, setNin] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");

  // Agency Info
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const fetchVerification = async () => {
      setLoading(true);
      try {
        const res = await AGENTAPI.get("/agents/verification/my", {
          params: { userId: user._id },
        });
        const v = res.data?.profile || null;
        setVerificationData(v);

        if (!v) return;

        setHasAgency(!!v.agencyName);
        setAgencyName(v.agencyName || "");
        setAgencyEmail(v.agencyEmail || "");
        setAgencyPhone(v.agencyPhone || "");
        setPhone(v.phone || "");
        setState(v.state || "");
        setPreviewLogo(v.agencyLogo || null);
        setPreviewProfile(v.profileImage || null);
        setNin(v.nin || "");

        if (v.status === "approved") {
          setModalMessage("✅ Verification approved! Redirecting...");
          setShowModal(true);
          modalTimeoutRef.current = setTimeout(() => {
            navigate("/agent-dashboard/overview");
          }, 1500);
        }
      } catch (err) {
        console.error("Error fetching verification:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [user, navigate]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewProfile(URL.createObjectURL(file));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setAgencyLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nin || !profileImage || !phone || !state) {
      return alert("Please fill all required fields");
    }
    if (!/^\d{11}$/.test(nin)) {
      return alert("NIN must be exactly 11 digits");
    }
    if (hasAgency && (!agencyName || !agencyEmail || !agencyPhone || !agencyLogo)) {
      return alert("Please fill all agency details");
    }

    try {
      setLoading(true);
      setModalMessage("Submitting...");
      setShowModal(true);

      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("nin", nin);
      formData.append("state", state);
      formData.append("phone", phone);

      if (hasAgency) {
        formData.append("agencyName", agencyName);
        formData.append("agencyEmail", agencyEmail);
        formData.append("agencyPhone", agencyPhone);
        formData.append("agencyLogo", agencyLogo);
      }

      const res = await AGENTAPI.post("/agents/verification/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { userId: user._id },
      });

      setVerificationData(res.data?.profile || null);
      setModalMessage("✅ Submitted successfully. Verification pending...");
      modalTimeoutRef.current = setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setModalMessage("❌ Submission failed. Try again.");
      modalTimeoutRef.current = setTimeout(() => setShowModal(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  // Verification status display
  if (verificationData?.status) {
    const status = verificationData.status.toLowerCase();
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    const statusMessages = {
      pending: "Your verification is under review.",
      approved: "✅ Your verification was successful!",
      rejected: "❌ Your verification was rejected. Please resubmit.",
    };

    let actionButton = null;
    if (status === "approved") {
      actionButton = (
        <button
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          onClick={() => navigate("/agent-dashboard/overview")}
        >
          OK
        </button>
      );
    } else if (status === "rejected") {
      actionButton = (
        <button
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => navigate("/agent-verification")}
        >
          Try Again
        </button>
      );
    }

    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white backdrop-blur-sm bg-opacity-90 p-8 rounded-3xl shadow-xl max-w-md w-full text-center transition-all duration-300">
          <img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Status</h2>
          <div className={`p-4 rounded-lg font-semibold text-lg ${statusColors[status]}`}>
            {verificationData.status.toUpperCase()}
          </div>
          <p className="mt-4 text-gray-600">{statusMessages[status]}</p>
          {actionButton}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white backdrop-blur-md bg-opacity-90 shadow-xl p-10 rounded-3xl max-w-3xl w-full transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-24 h-24 mb-3" />
          <h2 className="text-3xl font-bold text-center text-gray-800">Agent Verification</h2>
          <p className="text-gray-500 text-sm text-center">Complete your verification to continue</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4">
          <span className="text-gray-700 font-semibold">Do you belong to an agency?</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-green-600"
              checked={hasAgency}
              onChange={() => setHasAgency((s) => !s)}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`grid gap-8 ${hasAgency ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 justify-items-center"}`}>
            {hasAgency && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg w-full hover:scale-[1.02] transition transform">
                <h3 className="text-xl font-semibold text-green-700 text-center mb-4">Agency Details</h3>
                <InputField label="Agency Name *" value={agencyName} setValue={setAgencyName} placeholder="Enter agency name" />
                <InputField label="Agency Email *" value={agencyEmail} setValue={setAgencyEmail} placeholder="Enter agency email" type="email" />
                <InputField label="Agency Phone *" value={agencyPhone} setValue={setAgencyPhone} placeholder="Enter agency phone" />
                <FileUpload label="Upload Agency Logo" file={agencyLogo} preview={previewLogo} handleChange={handleLogoChange} bgColor="green" />
              </div>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg w-full max-w-md hover:scale-[1.02] transition transform">
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Personal Information</h3>

              {/* Profile image */}
              <div className="flex flex-col items-center mb-10">
                <input type="file" id="profile-upload" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="hidden" />
                <label htmlFor="profile-upload" className="cursor-pointer mt-2">
                  {!previewProfile ? (
                    <div className="h-28 w-28 flex items-center justify-center bg-gray-200 rounded-full text-gray-500 text-5xl">
                      <i className="fas fa-user"></i>
                      <p className="absolute text-sm font-bold text-black mt-20">Click to upload image</p>
                    </div>
                  ) : (
                    <img src={previewProfile} alt="Profile Preview" className="h-28 w-28 object-cover rounded-full shadow-lg transition-all" />
                  )}
                </label>
              </div>

              <InputField label="NIN Number *" value={nin} setValue={setNin} placeholder="Enter your NIN number" />
              <InputField label="Phone *" value={phone} setValue={setPhone} placeholder="Enter your phone number" />
              <SelectField label="State *" value={state} setValue={setState} options={NIGERIA_STATES} />
            </div>
          </div>

          <div className="flex justify-center">
            <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
              {loading ? "Submitting..." : "Submit Verification"}
            </button>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm text-center transition-transform transform scale-105">
            <p className="font-medium">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Inputs
const InputField = ({ label, value, setValue, type = "text", placeholder = "" }) => (
  <div className="mb-4">
    <label className="block text-gray-700 mb-1 font-medium">{label}</label>
    <input type={type} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
  </div>
);

const SelectField = ({ label, value, setValue, options }) => (
  <div className="mb-4">
    <label className="block text-gray-700 mb-1 font-medium">{label}</label>
    <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition">
      <option value="" disabled>{label.replace(" *", "")}</option>
      {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
    </select>
  </div>
);

const FileUpload = ({ label, file, preview, handleChange, bgColor }) => (
  <div className="flex flex-col items-center mb-4">
    <input type="file" id={label} accept="image/*" onChange={handleChange} className="hidden" />
    <label htmlFor={label} className={`cursor-pointer bg-${bgColor}-600 hover:bg-${bgColor}-700 text-white px-4 py-2 rounded-lg shadow transition`}>{label}</label>
    {preview && <img src={preview} alt={`${label} Preview`} className="mt-3 h-28 w-28 object-cover rounded-full shadow-lg transition-all" />}
  </div>
);

export default AgentVerification;
