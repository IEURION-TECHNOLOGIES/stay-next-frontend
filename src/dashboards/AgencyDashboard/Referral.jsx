import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AGENCYAPI from "../../utils/agencyaxios";

const AgencyReferralPage = () => {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    referredUsers: [],
  });
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const prevReferralCount = useRef(0);
  const stored = JSON.parse(localStorage.getItem("user"));
  const userId = stored?._id;

  const fetchReferralCode = async () => {
    if (!userId) return;
    try {
      const res = await AGENCYAPI.get("/AGENCYs/profile/code", { headers: { "x-user-id": userId } });
      setReferralCode(res.data.code);
      setReferralLink(`${window.location.origin}/register?ref=${res.data.code}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const fetchDashboard = async () => {
    if (!userId) return;
    try {
      const res = await AGENCYAPI.get("/AGENCYs/profile/referraldata", { headers: { "x-user-id": userId } });
      const newTotal = res.data.totalReferrals || 0;

      if (prevReferralCount.current > 0 && newTotal > prevReferralCount.current) {
        const newUser = res.data.referredUsers[0];
        setToastMessage(`🎉 ${newUser?.user?.name || "Someone"} just joined! +₦${newUser?.reward || 0}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }

      prevReferralCount.current = newTotal;
      setStats(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralCode();
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(`💰 Join StayNext with my link and let's earn together!\n\n${referralLink}\n\nYou get bonus, I get bonus! 🚀`);
    const url = encodeURIComponent(referralLink);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp": shareUrl = `https://api.whatsapp.com/send?text=${text}`; break;
      case "twitter": shareUrl = `https://twitter.com/intent/tweet?text=${text}`; break;
      case "facebook": shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case "email": shareUrl = `mailto:?subject=Join StayNext & Earn!&body=${text}`; break;
    }
    window.open(shareUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-8 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      {/* Font Awesome - Replace with your kit */}
      <script src="https://kit.fontawesome.com/your-kit-here.js" crossOrigin="anonymous"></script>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white relative overflow-hidden">

        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-purple-900/10 to-gray-900 opacity-50"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute top-1/4 right-0 w-96 h-96 md:w-[500px] md:h-[500px] bg-green-600 rounded-full filter blur-3xl opacity-20"
          />
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 100, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/30 flex items-center gap-3 font-bold text-sm md:text-base backdrop-blur-xl">
                <i className="fas fa-bell animate-pulse"></i>
                <span className="flex-1 text-center">{toastMessage}</span>
                <i className="fas fa-coins text-yellow-300"></i>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto">

          {/* Hero Section - Fully Responsive */}
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
              EARN MORE WITH<br className="block sm:hidden" /> EVERY FRIEND
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mt-4 md:mt-6 text-gray-300 font-medium">
              Share your link. Get paid instantly.
            </p>
            <motion.i
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="fas fa-arrow-down text-4xl sm:text-5xl md:text-6xl text-green-400 mt-6 md:mt-8 inline-block"
            />
          </motion.div>

          {/* Main Referral Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="max-w-2xl mx-auto"
          >
            <div className="backdrop-blur-2xl bg-white/10 border-2 border-gray-700 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-transparent to-purple-600/10"></div>

              <div className="relative z-10 text-center">

                {/* Title */}
                <motion.h2
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 md:mb-10 text-green-400 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-gem text-purple-400 text-3xl sm:text-4xl"></i>
                  YOUR REFERRAL LINK
                </motion.h2>

                {/* Referral Code */}
                <motion.div whileHover={{ scale: 1.05 }} className="inline-block mb-8 md:mb-10">
                  <div className="px-6 py-5 sm:px-10 sm:py-7 md:px-12 md:py-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl font-black text-4xl xs:text-5xl sm:text-6xl md:text-7xl tracking-widest text-white shadow-2xl border-4 border-white/30">
                    {referralCode}
                  </div>
                </motion.div>

                {/* Copy Button */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="relative w-full max-w-xs mx-auto px-10 py-5 sm:py-6 md:py-8 bg-white text-black text-xl sm:text-2xl font-bold rounded-full shadow-2xl overflow-hidden group"
                >
                  <span className="flex items-center justify-center gap-3">
                    {copied ? <i className="fas fa-check text-green-600 text-3xl sm:text-4xl"></i> : <i className="fas fa-copy text-2xl sm:text-3xl"></i>}
                    {copied ? "Copied!" : "Copy Your Link"}
                  </span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-60 transition" />
                </motion.button>

                {/* Share Buttons - Responsive Grid */}
                <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-10 md:mt-12 max-w-md mx-auto">
                  {[
                    { icon: "fab fa-whatsapp", color: "from-green-500 to-green-600", platform: "whatsapp" },
                    { icon: "fab fa-twitter", color: "from-gray-400 to-gray-500", platform: "twitter" },
                    { icon: "fab fa-facebook-f", color: "from-blue-600 to-blue-700", platform: "facebook" },
                    { icon: "fas fa-envelope", color: "from-purple-500 to-purple-600", platform: "email" },
                  ].map((item) => (
                    <motion.button
                      key={item.platform}
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleShare(item.platform)}
                      className={`aspect-square w-full bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-xl border-2 border-white/20`}
                    >
                      <i className={item.icon}></i>
                    </motion.button>
                  ))}
                </div>

                {/* Full Link */}
                <p className="mt-8 md:mt-10 text-gray-400 text-xs sm:text-sm md:text-base break-all px-4">
                  {referralLink}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 mt-16 md:mt-20 max-w-4xl mx-auto">
            {[
              { icon: "fas fa-users", label: "Total Referrals", value: stats.totalReferrals, textColor: "text-white" },
              { icon: "fas fa-wallet", label: "Total Earnings", value: `₦${stats.totalEarnings.toLocaleString()}`, textColor: "text-green-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-3xl p-8 text-center shadow-2xl"
              >
                <i className={`${stat.icon} text-5xl sm:text-6xl md:text-7xl text-green-400 mb-4`}></i>
                <p className="text-gray-400 text-lg sm:text-xl">{stat.label}</p>
                <motion.p
                  key={stat.value}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`text-4xl sm:text-5xl md:text-6xl font-black mt-4 ${stat.textColor}`}
                >
                  {stat.value}
                </motion.p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center mt-16 md:mt-20"
          >
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              Every share = More money in your wallet 💰
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AgencyReferralPage;