import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AGENTAPI from "../../utils/agentaxios";
import API from "../../utils/axios";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";
import { NIGERIA_STATES } from "../../utils/states";

const AgentVerification = () => {
  const { user, updateUser, clearAuthSession } = useAuth();
  const navigate = useNavigate();
  const modalTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");

  const [ninSlip, setNinSlip] = useState(null);
  const [previewNin, setPreviewNin] = useState(null);

  const [hasAgency, setHasAgency] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const res = await AGENTAPI.get("/agents/verification/my", {
          params: { userId: user._id },
        });

        const profile = res.data?.profile;

        if (profile?.status) {
          setVerificationStatus(profile.status);

          if (profile.status === "rejected") {
            setRejectionReason(
              profile.rejectionReason ||
                "Your verification was rejected. Please review your details and resubmit."
            );
          }

          // If they open this page and they are already approved, boot them out
          if (profile.status === "approved") {
            clearAuthSession();
            navigate("/login", { 
              replace: true, 
              state: { message: "Your account is approved! Please log in." } 
            });
          }
        }
      } catch (error) {
        setVerificationStatus(null);
      }
    };

    if (user?._id) {
      checkVerificationStatus();
    }
  }, [user, navigate, clearAuthSession]);

  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setPreviewProfile(URL.createObjectURL(file));
  };

  const handleNinChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNinSlip(file);
    setPreviewNin(URL.createObjectURL(file));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAgencyLogo(file);
    setPreviewLogo(URL.createObjectURL(file));
  };

  // =====================
  // SUBMIT HANDLER
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage || !ninSlip || !phone || !state) {
      return alert("Please complete all required fields");
    }

    if (hasAgency && (!agencyName || !agencyEmail || !agencyPhone || !agencyLogo)) {
      return alert("Please complete agency details");
    }

    try {
      setLoading(true);
      setShowModal(true);
      setModalMessage("Submitting verification...");

      // 1️⃣ Upload profile image
      const profileForm = new FormData();
      profileForm.append("image", profileImage);
      const profileRes = await API.post("/auth/upload-profile", profileForm);

      updateUser({
        ...user,
        profileImage: profileRes.data.profileImage,
      });

      // 2️⃣ Submit verification data
      const verifyForm = new FormData();
      verifyForm.append("phone", phone);
      verifyForm.append("state", state);
      verifyForm.append("ninSlip", ninSlip);

      if (hasAgency) {
        verifyForm.append("agencyName", agencyName);
        verifyForm.append("agencyEmail", agencyEmail);
        verifyForm.append("agencyPhone", agencyPhone);
        verifyForm.append("agencyLogo", agencyLogo);
      }

      await AGENTAPI.post("/agents/verification/submit", verifyForm, {
        params: { userId: user._id },
      });

      // ✅ CHANGE HERE: Show pending status message modal for exactly 5 seconds, then clear session and go to login
      setModalMessage("✅ Submitted successfully! Your application is now pending review. Redirecting to login in 5 seconds...");
      
      modalTimeoutRef.current = setTimeout(() => {
        setShowModal(false);
        clearAuthSession(); // Wipe provisionary access
        navigate("/login", { replace: true });
      }, 5000);

    } catch (err) {
      console.error(err);
      setModalMessage("❌ Submission failed. Try again.");
      modalTimeoutRef.current = setTimeout(() => setShowModal(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow max-w-3xl w-full">
        {verificationStatus === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <p className="font-bold">Submission Rejected:</p>
            <p>{rejectionReason}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center">
            <img src={logo} className="w-24 mx-auto mb-2" alt="Logo" />
            <h2 className="text-3xl font-bold">Agent Verification</h2>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasAgency}
              onChange={(e) => setHasAgency(e.target.checked)}
            />
            <label className="font-medium">I operate with a real estate company</label>
          </div>

          <div className={`grid gap-8 ${hasAgency ? "md:grid-cols-2" : "md:grid-cols-1 justify-items-center"}`}>
            {hasAgency && (
              <div className="space-y-5">
                <p className="text-center text-lg font-bold">Company Information</p>
                <div className="flex justify-center">
                  <CircularImageUpload
                    label="Company Logo"
                    preview={previewLogo}
                    onChange={handleLogoChange}
                  />
                </div>
                <InputField label="Company Name *" value={agencyName} setValue={setAgencyName} />
                <InputField label="Company Email *" value={agencyEmail} setValue={setAgencyEmail} />
                <InputField label="Company Phone *" value={agencyPhone} setValue={setAgencyPhone} />
              </div>
            )}

            <div className={`space-y-4 w-full ${!hasAgency ? "max-w-md" : ""}`}>
              <p className="text-center font-semibold">Personal Information</p>
              <div className="flex justify-center">
                <CircularImageUpload
                  label="Profile Photo"
                  preview={previewProfile}
                  onChange={handleProfileChange}
                />
              </div>
              <InputField label="Phone *" value={phone} setValue={setPhone} />
              <SelectField
                label="State of business or residence *"
                value={state}
                setValue={setState}
                options={NIGERIA_STATES}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <RectImageUpload
              label="Upload NIN Slip *"
              preview={previewNin}
              handleChange={handleNinChange}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-50 font-semibold"
          >
            {loading ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      </div>

      {/* 5-Second Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-3 border border-gray-100 animate-fade-in">
            <div className="text-lg font-semibold text-gray-800">
              {modalMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ...Keep existing input subcomponents exactly as they were...
const InputField = ({ label, value, setValue }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full border p-2 rounded" />
  </div>
);
const SelectField = ({ label, value, setValue, options }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full border p-2 rounded">
      <option value="">Select</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const CircularImageUpload = ({ label, preview, onChange }) => (
  <div className="flex flex-col items-center gap-2">
    <input type="file" hidden id={label} accept="image/*" onChange={onChange} />
    <label htmlFor={label} className="cursor-pointer w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center text-gray-500 hover:border-green-500 transition overflow-hidden bg-gray-50">
      {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-center text-xs px-3"><p className="font-medium">{label} *</p></div>}
    </label>
  </div>
);
const RectImageUpload = ({ label, preview, handleChange }) => (
  <div className="flex flex-col items-center">
    <input type="file" hidden id={label} accept="image/*" onChange={handleChange} />
    <label htmlFor={label} className="cursor-pointer w-72 h-44 border-2 border-dashed rounded-xl flex items-center justify-center text-sm text-gray-500 hover:border-green-500 transition overflow-hidden bg-gray-50">
      {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-center px-4"><p className="font-medium">{label}</p></div>}
    </label>
  </div>
);

export default AgentVerification;
