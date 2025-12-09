import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../../utils/autotop';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const AgencyDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <ScrollToTop />

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 shadow">
        <MobileNav setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-64 z-10 bg-white dark:bg-gray-800 shadow">
        <Sidebar setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={() => setMenuOpen(false)}
          ></div>

          <div className="absolute top-0 left-0 h-full w-2/3 bg-white dark:bg-gray-800 shadow z-40">
            <Sidebar setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 overflow-y-auto pt-16 lg:pt-4 px-4 pb-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AgencyDashboard;
