"use client";

import { useState } from "react";
import {
  Package,
  LayoutDashboard,
  Database,
  Plus,
  Menu,
  X
} from "lucide-react";

const Navbar = ({ view, setView, startNewDocument }) => {
  // State untuk mengontrol buka/tutup menu di mobile
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  // Helper agar menu tertutup otomatis setelah tombol diklik di HP
  const handleNavClick = (targetView) => {
    setView(targetView);
    closeMenu();
  };

  const handleStartNew = () => {
    startNewDocument();
    closeMenu();
  };

  return (
    <>
      {/* 📱 TOP BAR KHUSUS MOBILE */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 print:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">LogistikKu</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 🌑 OVERLAY GELAP SAAT MENU TERBUKA (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* 🖥️ SIDEBAR UTAMA (Desktop & Mobile) */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 print:hidden flex flex-col z-50 shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header / Logo di dalam Sidebar */}
        <div className="flex items-center justify-between px-6 h-16 md:h-20 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-blue-600 shrink-0" />
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">LogistikKu</span>
          </div>
          {/* Tombol Close khusus Mobile */}
          <button 
            onClick={closeMenu} 
            className="md:hidden p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="p-4 shrink-0 mt-2">
          <button
            onClick={handleStartNew}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" /> Buat Surat Baru
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${
              view === "dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>

          <button
            onClick={() => handleNavClick("admin")}
            className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${
              view === "admin"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Database className="w-5 h-5" /> Master Barang
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <p className="text-xs text-center text-gray-400 font-medium">
            © 2026 Departemen Logistik
            Developed by alzi rahmana
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;