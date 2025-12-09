// React core + hooks
import React, { useState, useRef, useEffect } from 'react';
// Routing
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'
import UserDropdown from '../ui/userDropdown';
// Assets
import logo from '../../assets/images/logo.png';
// Styles
import '../../styles/Header.css';

function Header() {
  const { user, logout } = useAuth();

  const navItemsLeft = [
    { label: 'Properties', path: '/properties' },
    { label: 'Find my Agents', path: '/find-agents' },
    { label: 'Professionals', path: '/building' },
  ];

  const navItemsRight = [
    { label: 'Service Provider', path: '/services' },
    { label: 'Guides', path: '/guides' },
    { label: 'About Us', path: '/about' },
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  // NEW: Detect scroll (used for sticky header)
  const [isScrolled, setIsScrolled] = useState(false);

  const languageRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const handleLanguageUpdate = () => {
    const selected = languageRef.current?.value;
    if (selected) setSelectedLanguage(selected.slice(0, 2).toUpperCase());
    setShowLanguageModal(false);
  };

  const NavLink = ({ item }) => {
    return (
      <Link
        to={item.path}
        onClick={() => setMenuOpen(false)}
        className="group relative text-lg font-semibold px-4 py-3 text-black hover:text-[#22965D]"
      >
        <span className="relative z-10">{item.label}</span>
        <span className="hidden md:block absolute left-1/2 bottom-0 w-0 h-[2px] bg-[#22965D] group-hover:w-1/2 group-hover:left-0 transition-all"></span>
        <span className="hidden md:block absolute right-1/2 bottom-0 w-0 h-[2px] bg-[#22965D] group-hover:w-1/2 group-hover:right-0 transition-all"></span>
      </Link>
    );
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect scroll for mobile + desktop sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative z-[9999] md:mb-32">

      {/* Mobile Header */}
      <div
        className={`
          flex md:hidden justify-between items-center px-2 py-2 
          fixed top-0 left-0 right-0 text-black transition-all duration-300
          ${isScrolled 
            ? "bg-gray-200 shadow-sm" 
            : "bg-white/10 backdrop-blur-md border-b border-white/5 shadow-sm"
          }
        `}
      >
        <button ref={toggleRef} onClick={() => setMenuOpen(!menuOpen)} className="text-2xl text-white">
          <i className={`text-gray-900 fas ${menuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
        <Link to="/" className="mx-10">
          <img src={logo} alt="company logo" className="h-14 w-14" />
        </Link>
        <button onClick={() => setShowLanguageModal(true)} className="flex gap-2 items-center text-[13px] hover:text-[#22965D]">
          <i className="fas fa-globe text-gray-900 text-[18px]"></i>
          <span className="text-[18px] text-gray-900">{selectedLanguage}</span>
        </button>
      </div>

      {/* ---------------------------- */}
      {/*     DESKTOP STICKY HEADER    */}
      {/* ---------------------------- */}
      <div
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300
        `}
      >

        {/* Desktop Top Utility Bar */}
        <div className="flex justify-between items-center bg-gray-100 px-48 py-2 shadow text-sm">
          <div className="flex items-center space-x-8">
            <button onClick={() => setShowLanguageModal(true)} className="flex items-center space-x-1 text-[15px] hover:text-[#22965D]">
              <i className="fas fa-globe text-[17px]"></i>
              <span>{selectedLanguage}</span>
            </button>
            <div className="text-[15px] hover:text-[#22965D] cursor-pointer">
              <i className="fas fa-gear mr-1"></i> Site settings
            </div>
          </div>
          <div className="flex items-center space-x-6 font-medium text-sm">
            <Link to="/favorites" className="hover:text-[#22965D]">
              <i className="fas fa-heart mr-1"></i>Favourite properties
            </Link>
            <Link to="/saved-searches" className="hover:text-[#22965D]">
              <i className="fas fa-star mr-1"></i>Saved searches
            </Link>
            <UserDropdown user={user} logout={logout} />
          </div>
        </div>

        {/* Desktop Main Navigation */}
        <div className="bg-transparent md:bg-white text-black px-4 md:pb-5 mb-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-5 w-full justify-center">
              {navItemsLeft.map((item, i) => <NavLink key={i} item={item} />)}
              <Link to="/" className="mx-10">
                <img src={logo} alt="company logo" className="h-14 w-14" />
              </Link>
              {navItemsRight.map((item, i) => <NavLink key={i + navItemsLeft.length} item={item} />)}
            </div>
          </div>
        </div>

      </div>
      {/* END DESKTOP STICKY */}


      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Select Language</h2>
            <select ref={languageRef} className="w-full border p-2 rounded mb-4">
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
              <option>Arabic</option>
            </select>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowLanguageModal(false)} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleLanguageUpdate} className="px-3 py-1 bg-[#22965D] text-white rounded hover:bg-green-700">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}></div>

      {/* Mobile Side Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex p-4 justify-between">
          <Link to="/">
            <img src={logo} alt="logo" className="h-10 w-10" />
          </Link>
          <button onClick={() => setMenuOpen(false)} className="text-xl text-black">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex flex-col">
          {navItemsLeft.map((item, i) => <NavLink key={i} item={item} />)}
          {navItemsRight.map((item, i) => <NavLink key={i + navItemsLeft.length} item={item} />)}

          <div className="mt-4 border-t pt-4 px-4 space-y-2">
            <Link to="/favorites" className="block hover:text-[#22965D]">
              <i className="fas fa-heart mr-1"></i>Favourite properties
            </Link>
            <Link to="/saved-searches" className="block hover:text-[#22965D]">
              <i className="fas fa-star mr-1"></i>Saved searches
            </Link>
            <UserDropdown user={user} logout={logout} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
