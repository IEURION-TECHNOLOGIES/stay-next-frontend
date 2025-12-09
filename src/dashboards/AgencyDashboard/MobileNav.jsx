import React from 'react';

const MobileNav = ({ menuOpen, setMenuOpen }) => {
  return (
    <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-700 px-4 py-3 shadow">
      <h1 className="text-lg font-bold">Agency Dashboard</h1>
      <button onClick={() => setMenuOpen(!menuOpen)}>
        <i className="fas fa-bars text-xl"></i>
      </button>
    </div>
  );
};

export default MobileNav;
