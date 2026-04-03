"use client";

import { useState } from "react";
import {
  Package, LayoutDashboard, Plus, Menu, X, LogOut, ChevronDown, Box, Building2, Database
} from "lucide-react";

const Navbar = ({ view, setView, startNewDocument, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Biarkan dropdown otomatis terbuka jika user sedang berada di halaman Master
  const [isMasterOpen, setIsMasterOpen] = useState(view.startsWith("master_"));

  const closeMenu = () => setIsOpen(false);

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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 print:hidden shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">LogistikKu</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 print:hidden flex flex-col z-50 shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between px-6 h-16 md:h-20 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Package className="w-6 h-6 md:w-7 md:h-7 text-blue-600 shrink-0" />
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">LogistikKu</span>
          </div>
          <button onClick={closeMenu} className="md:hidden p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 shrink-0 mt-2">
          <button onClick={handleStartNew} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95">
            <Plus className="w-5 h-5" /> Buat Surat Baru
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2 custom-scrollbar">
          <button onClick={() => handleNavClick("dashboard")} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>

          <div className="space-y-1">
            <button onClick={() => setIsMasterOpen(!isMasterOpen)} className={`w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between transition-colors ${view.startsWith("master_") ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" /> Data Master
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isMasterOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-gray-100 ml-6 mt-1">
                {/* MENU MASTER BARANG */}
                <button onClick={() => handleNavClick("master_barang")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "master_barang" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"}`}>
                  <Box className="w-4 h-4" /> Master Barang
                </button>
                {/* MENU MASTER INSTANSI */}
                <button onClick={() => handleNavClick("master_outlet")} className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${view === "master_outlet" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:text-purple-700 hover:bg-purple-50"}`}>
                  <Building2 className="w-4 h-4" /> Master Instansi
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={handleLogout} className="w-full py-2.5 px-4 mb-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Keluar Sistem
          </button>
          <div className="text-xs text-center text-gray-400 font-medium leading-relaxed">
            <p>© 2026 Departemen Logistik</p>
            <p>Developed by Alzi Rahmana Putra</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;