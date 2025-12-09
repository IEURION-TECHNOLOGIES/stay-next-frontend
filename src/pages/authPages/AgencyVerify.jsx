import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AGENCYAPI from "../../utils/agencyaxios"; 
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";

const AgencyRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const modalTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const [verificationData, setVerificationData] = useState(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  // Fetch Agency Verification
  useEffect(() => {
    if (!user?._id) return;

    const fetchVerification = async () => {
      setLoading(true);

      try {
        const res = await AGENCYAPI.get("/agency/verification/my", {
          params: { userId: user._id },
        });

        const v = res.data?.profile || null;
        setVerificationData(v);

        if (!v) return;

        setAgencyName(v.agencyName || "");
        setAgencyEmail(v.agencyEmail || "");
        setAgencyPhone(v.agencyPhone || "");
        setRcNumber(v.rcNumber || "");
        setPreviewLogo(v.agencyLogo || null);

        if (v.status === "approved") {
          setModalMessage("✅ Agency Verified! Redirecting...");
          setShowModal(true);

          modalTimeoutRef.current = setTimeout(() => {
            navigate("/agency-dashboard/overview");
          }, 1500);
        }
      } catch (err) {
        console.error("Agency fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [user, navigate]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setAgencyLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agencyName || !agencyEmail || !agencyPhone || !rcNumber || !agencyLogo)
      return alert("Please fill in all required fields.");

    try {
      setLoading(true);
      setModalMessage("Submitting...");
      setShowModal(true);

      const formData = new FormData();
      formData.append("agencyName", agencyName);
      formData.append("agencyEmail", agencyEmail);
      formData.append("agencyPhone", agencyPhone);
      formData.append("rcNumber", rcNumber);
      formData.append("agencyLogo", agencyLogo);

      const res = await AGENCYAPI.post(
        "/agency/verification/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          params: { userId: user._id },
        }
      );

      setVerificationData(res.data?.profile || null);
      setModalMessage("✅ Submitted successfully. Verification pending...");

      modalTimeoutRef.current = setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setModalMessage("❌ Submission failed. Try again.");
      modalTimeoutRef.current = setTimeout(() => setShowModal(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  // Status Page
  if (verificationData?.status) {
    const status = verificationData.status.toLowerCase();
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    const statusMessages = {
      pending: "Your agency verification is under review.",
      approved: "Your agency has been approved!",
      rejected: "Your agency verification was rejected. Please resubmit.",
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <img src={logo} alt="Logo" className="w-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Real Estate Company Verification Status</h2>
          <div className={`p-4 rounded-lg font-semibold text-lg ${statusColors[status]}`}>
            {verificationData.status.toUpperCase()}
          </div>
          <p className="mt-4 text-gray-600">{statusMessages[status]}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-xl p-10 rounded-3xl max-w-xl w-full">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-24 h-24 mb-3" />
            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Real Estate Company Verification
            </h2>
            <p className="text-gray-500 text-sm text-center">
              Verify your real estate company to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <InputField label="Agency Name *" value={agencyName} setValue={setAgencyName} />

            <InputField
              label="Agency Email *"
              value={agencyEmail}
              setValue={setAgencyEmail}
              type="email"
            />

            <InputField
              label="Agency Phone *"
              value={agencyPhone}
              setValue={setAgencyPhone}
            />

            <InputField
              label="RC Number *"
              value={rcNumber}
              setValue={setRcNumber}
            />

            <FileUpload
              label="Upload Agency Logo *"
              file={agencyLogo}
              preview={previewLogo}
              handleChange={handleLogoChange}
              bgColor="green"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
            >
              {loading ? "Submitting..." : "Submit Agency"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
             onClick={() => navigate("/agency-dashboard/overview")}>
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm text-center">
            <p className="font-medium">{modalMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

// Generic Input Component
const InputField = ({ label, value, setValue, type = "text" }) => (
  <div>
    <label className="block mb-1 text-gray-700 font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
    />
  </div>
);

// Logo Upload Component
const FileUpload = ({ label, preview, handleChange, bgColor }) => (
  <div className="flex flex-col items-center">
    <input type="file" id={label} accept="image/*" onChange={handleChange} className="hidden" />

    <label
      htmlFor={label}
      className={`cursor-pointer bg-${bgColor}-600 hover:bg-${bgColor}-700 text-white px-4 py-2 rounded-lg shadow transition`}
    >
      {label}
    </label>

    {preview && (
      <img
        src={preview}
        alt="Preview"
        className="mt-3 h-28 w-28 rounded-xl object-cover shadow-lg"
      />
    )}
  </div>
);

export default AgencyRegistration;
