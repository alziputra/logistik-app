import React, { useState, useEffect } from "react";
import {
  Package, LayoutDashboard, ChevronDown, FileText, Monitor, Laptop, Printer, Shield,
  Users, List, Box, Building2, Database, History, Map, Building, FileCheck,
  Sun, Moon, Home, Settings, Activity, LogOut, Download, Sliders, PlusCircle, CheckSquare
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({
  view,
  setView,
  startNewDocument,
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  isSidebarOpen,
  setIsSidebarOpen,
  setLandFilter,
  setSewaFilter,
  setComputerFilter,
  setPrinterFilter,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userRole = (user?.role || "officer").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "administrator";

  // Rail categories: 'home' | 'surat' | 'master' | 'inventaris' | 'bangunan' | 'settings'
  const getCategoryFromView = (v) => {
    if (v === "dashboard" || v.startsWith("dashboard_")) return "home";
    if (v === "form" || v === "riwayat" || v.startsWith("surat_") || v.startsWith("spk_") || v.startsWith("sopp_")) return "surat";
    if (v.startsWith("master_")) return "master";
    if (v.startsWith("perangkat_") || v === "inventory") return "inventaris";
    if (v.startsWith("bangunan_")) return "bangunan";
    if (v === "kelola_user" || v === "log_aktivitas") return "settings";
    return "home";
  };

  const [activeRailCategory, setActiveRailCategory] = useState(getCategoryFromView(view));
  const [isSpkOpen, setIsSpkOpen] = useState(true);
  const [isSoppOpen, setIsSoppOpen] = useState(true);

  useEffect(() => {
    setActiveRailCategory(getCategoryFromView(view));
  }, [view]);

  const closeMenu = () => setIsSidebarOpen(false);

  const handleNavClick = (targetView) => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    setView(targetView);
  };

  const handleStartNew = () => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    if (startNewDocument) startNewDocument();
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-30 print:hidden shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
            <List className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">LogistikKu</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <NotificationBell
            printers={printers}
            computers={computers}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            isMobile={true}
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      {/* NARROW ICON RAIL (SISI PALING KIRI - HIJAU PEGADAAN) */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-20 bg-[#00753A] text-white flex-col items-center py-4 z-50 print:hidden shadow-md border-r border-[#005c2e]">
        {/* Toggle Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-emerald-100 hover:text-white hover:bg-[#005c2e] rounded-xl transition-all cursor-pointer mb-6 active:scale-95"
          title={isSidebarOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
        >
          <List className="w-6 h-6" />
        </button>

        {/* 6 Rail Menu Items Vertical Stack */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {/* 1. Home */}
          <button
            onClick={() => {
              setActiveRailCategory("home");
              handleNavClick("dashboard");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "home"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Home"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Home</span>
          </button>

          {/* 2. Surat */}
          <button
            onClick={() => {
              setActiveRailCategory("surat");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "surat"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Surat"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Surat</span>
          </button>

          {/* 3. Data Master */}
          <button
            onClick={() => {
              setActiveRailCategory("master");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "master"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Data Master"
          >
            <Database className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Data Master</span>
          </button>

          {/* 4. Inventaris */}
          <button
            onClick={() => {
              setActiveRailCategory("inventaris");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "inventaris"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Inventaris"
          >
            <Package className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Inventaris</span>
          </button>

          {/* 5. Bangunan */}
          <button
            onClick={() => {
              setActiveRailCategory("bangunan");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "bangunan"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Bangunan"
          >
            <Building2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Bangunan</span>
          </button>

          {/* 6. Pengaturan / Settings */}
          <button
            onClick={() => {
              setActiveRailCategory("settings");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
              activeRailCategory === "settings"
                ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105"
                : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Pengaturan Sistem"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Pengaturan</span>
          </button>
        </div>
      </div>

      {/* MAIN SUB-MENU SIDEBAR PANEL (Drawer matching view.jpeg) */}
      <aside
        className={`fixed top-0 left-0 md:left-20 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 print:hidden flex flex-col z-40 shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full"
        }`}
      >
        {/* Header Drawer LogistikKu */}
        <div className="flex items-center gap-3 px-5 h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button onClick={closeMenu} className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0">
            <List className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="border border-slate-300 dark:border-slate-700 p-1.5 rounded-lg text-slate-800 dark:text-slate-200">
              <Box className="w-6 h-6 shrink-0" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
              LogistikKu
            </span>
          </div>
        </div>

        {/* Sub-menu Content */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto mt-4 custom-scrollbar text-xs font-semibold">
          
          {/* CATEGORY: HOME (Dashboard Submenu matching view.jpeg) */}
          {activeRailCategory === "home" && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`w-full px-3.5 py-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                  view === "dashboard" || view === "dashboard_inventaris"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="text-xs">Dashboard Inventaris</span>
              </button>

              <button
                onClick={() => handleNavClick("dashboard_bangunan")}
                className={`w-full px-3.5 py-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                  view === "dashboard_bangunan"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="text-xs">Dashboard Bangunan</span>
              </button>

              <button
                onClick={() => handleNavClick("dashboard_pengamanan")}
                className={`w-full px-3.5 py-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                  view === "dashboard_pengamanan"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="text-xs">Dashboard Pengamanan & Korporasi</span>
              </button>
            </div>
          )}

          {/* CATEGORY: SURAT */}
          {activeRailCategory === "surat" && (
            <div className="space-y-1 animate-in fade-in duration-200">
              {/* Surat Serah Terima */}
              <button
                onClick={handleStartNew}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "form"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Surat Serah Terima</span>
              </button>

              {/* SPK Accordion */}
              <div>
                <button
                  onClick={() => setIsSpkOpen(!isSpkOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>SPK</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSpkOpen ? "rotate-180" : ""}`} />
                </button>

                {isSpkOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("spk_renovasi")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "spk_renovasi"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Renovasi
                    </button>
                    <button
                      onClick={() => handleNavClick("spk_elektronik")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "spk_elektronik"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Elektronik
                    </button>
                    <button
                      onClick={() => handleNavClick("spk_kendaraan")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "spk_kendaraan"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Kendaraan
                    </button>
                  </div>
                )}
              </div>

              {/* SOPP Accordion */}
              <div>
                <button
                  onClick={() => setIsSoppOpen(!isSoppOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sliders className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>SOPP</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSoppOpen ? "rotate-180" : ""}`} />
                </button>

                {isSoppOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("sopp_pengadaan")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "sopp_pengadaan"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Pengadaan
                    </button>
                    <button
                      onClick={() => handleNavClick("sopp_sewa")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "sopp_sewa"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Sewa
                    </button>
                    <button
                      onClick={() => handleNavClick("sopp_renovasi")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        view === "sopp_renovasi"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                      }`}
                    >
                      Renovasi
                    </button>
                  </div>
                )}
              </div>

              {/* Riwayat Surat */}
              <button
                onClick={() => handleNavClick("riwayat")}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "riwayat"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Riwayat Surat</span>
              </button>
            </div>
          )}

          {/* CATEGORY: DATA MASTER */}
          {activeRailCategory === "master" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">
                Kelola Data Master
              </div>

              <button
                onClick={() => handleNavClick("master_barang")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "master_barang"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Package className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Master Barang</span>
              </button>

              <button
                onClick={() => handleNavClick("master_vendor")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "master_vendor"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Supplier / Vendor</span>
              </button>

              <button
                onClick={() => handleNavClick("master_outlet")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "master_outlet"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Outlet & Instansi</span>
              </button>
            </div>
          )}

          {/* CATEGORY: INVENTARIS */}
          {activeRailCategory === "inventaris" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">
                Aset & Perangkat IT
              </div>

              <button
                onClick={() => handleNavClick("perangkat_komputer")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "perangkat_komputer"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Perangkat Komputer</span>
              </button>

              <button
                onClick={() => handleNavClick("perangkat_laptop")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "perangkat_laptop"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Laptop className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Perangkat Laptop</span>
              </button>

              <button
                onClick={() => handleNavClick("perangkat_printer")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "perangkat_printer"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Printer className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Perangkat Printer</span>
              </button>
            </div>
          )}

          {/* CATEGORY: BANGUNAN */}
          {activeRailCategory === "bangunan" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">
                Aset Bangunan & Fasilitas
              </div>

              <button
                onClick={() => handleNavClick("bangunan_tanah")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_tanah"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Map className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Aset Tanah</span>
              </button>

              <button
                onClick={() => handleNavClick("bangunan_sewa")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_sewa"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Aset Bangunan & Sewa</span>
              </button>

              <button
                onClick={() => handleNavClick("bangunan_renovasi")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_renovasi"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Renovasi Gedung</span>
              </button>

              <button
                onClick={() => handleNavClick("bangunan_sarana")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_sarana"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Sarana Pengamanan</span>
              </button>
            </div>
          )}

          {/* CATEGORY: PENGATURAN / SETTINGS */}
          {activeRailCategory === "settings" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">
                Pengaturan & Hak Akses
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleNavClick("kelola_user")}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                    view === "kelola_user"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                  <span>Manajemen User</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick("log_aktivitas")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "log_aktivitas"
                    ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-[#00753A] dark:text-emerald-400" />
                <span>Log Aktivitas Sistem</span>
              </button>
            </div>
          )}

        </nav>

        {/* Bottom Section Drawer (Footer) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">
            © 2026 Departemen Logistik
          </p>
        </div>
      </aside>
    </>
  );
}
