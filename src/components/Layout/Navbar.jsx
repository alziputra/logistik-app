/// Navbar.jsx - Responsive Sidebar & Mobile Accordion Navigation
import React, { useState, useEffect } from "react";
import {
  Package,
  LayoutDashboard,
  ChevronDown,
  FileText,
  Monitor,
  Laptop,
  Printer,
  Shield,
  Users,
  List,
  Box,
  Building2,
  Database,
  History,
  Map,
  Building,
  FileCheck,
  Sun,
  Moon,
  Home,
  Settings,
  Activity,
  LogOut,
  Download,
  Sliders,
  PlusCircle,
  CheckSquare,
  X,
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
  setPrinterSearch,
  setComputerSearch,
  setLandSearch,
  setSewaSearch,
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
  const [openMobileCategories, setOpenMobileCategories] = useState({
    home: true,
    surat: true,
    master: false,
    inventaris: false,
    bangunan: false,
    settings: false,
  });

  useEffect(() => {
    const currentCat = getCategoryFromView(view);
    setActiveRailCategory(currentCat);
    setOpenMobileCategories((prev) => ({ ...prev, [currentCat]: true }));
  }, [view]);

  const toggleMobileCategory = (cat) => {
    setOpenMobileCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const closeMenu = () => setIsSidebarOpen(false);

  const handleNavClick = (targetView) => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    setView(targetView);
    if (window.innerWidth < 768) {
      closeMenu();
    }
  };

  const handleStartNew = () => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");

    if (startNewDocument) startNewDocument();
    if (window.innerWidth < 768) {
      closeMenu();
    }
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
            setPrinterSearch={setPrinterSearch}
            setComputerSearch={setComputerSearch}
            setLandSearch={setLandSearch}
            setSewaSearch={setSewaSearch}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
            setLandFilter={setLandFilter}
            setSewaFilter={setSewaFilter}
            isMobile={true}
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      {/* NARROW ICON RAIL (DESKTOP SISI PALING KIRI - HIJAU PEGADAAN) */}
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
              activeRailCategory === "home" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
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
              activeRailCategory === "surat" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
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
              activeRailCategory === "master" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
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
              activeRailCategory === "inventaris" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
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
              activeRailCategory === "bangunan" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
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
              activeRailCategory === "settings" ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
            }`}
            title="Pengaturan Sistem"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Pengaturan</span>
          </button>
        </div>
      </div>

      {/* MAIN SUB-MENU SIDEBAR PANEL (DRAWER MOBILE & DESKTOP) */}
      <aside
        className={`fixed top-0 left-0 md:left-20 h-screen w-72 md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 print:hidden flex flex-col z-50 md:z-40 shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full"
        }`}
      >
        {/* Header Drawer LogistikKu */}
        <div className="flex items-center justify-between px-5 h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#00753A] text-white p-1.5 rounded-lg">
              <Box className="w-5 h-5 shrink-0" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">LogistikKu</span>
          </div>

          <button onClick={closeMenu} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-menu Content Scrollable */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar text-xs font-semibold">
          {/* ============================================================ */}
          {/* TAMPILAN MOBILE: ACCORDION VERTICAL / MENU LIPAT (md:hidden) */}
          {/* ============================================================ */}
          <div className="md:hidden space-y-2.5">
            {/* 1. KATEGORI: HOME / DASHBOARD */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("home")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Home & Dashboard</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.home ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.home && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  <button
                    onClick={() => handleNavClick("dashboard")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "dashboard" || view === "dashboard_inventaris"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Dashboard Inventaris</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("dashboard_bangunan")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "dashboard_bangunan"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Dashboard Bangunan</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("dashboard_pengamanan")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "dashboard_pengamanan"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Dashboard Pengamanan & Korporasi</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. KATEGORI: SURAT & TRANSAKSI */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("surat")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Kelola Surat & Transaksi</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.surat ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.surat && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  <button
                    onClick={handleStartNew}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      view === "form"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span>Surat Serah Terima (BAST)</span>
                  </button>

                  {/* Nested SPK */}
                  <div>
                    <button
                      onClick={() => setIsSpkOpen(!isSpkOpen)}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400">
                          <FileCheck className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <span>SPK (Perintah Kerja)</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSpkOpen ? "rotate-180 text-[#00753A]" : ""}`} />
                    </button>
                    {isSpkOpen && (
                      <div className="ml-4 pl-3 py-1 space-y-1 text-xs border-l-2 border-emerald-500/20 dark:border-emerald-500/30 my-1">
                        {[
                          { id: "spk_renovasi", label: "Renovasi", desc: "Pekerjaan Gedung" },
                          { id: "spk_elektronik", label: "Elektronik", desc: "Perangkat IT" },
                          { id: "spk_kendaraan", label: "Kendaraan", desc: "Sewa Operasional" },
                        ].map((sub) => {
                          const isActive = view === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNavClick(sub.id)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-start gap-2 transition-all cursor-pointer ${
                                isActive
                                  ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-[#00753A] dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs leading-tight">{sub.label}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{sub.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Nested SOPP */}
                  <div>
                    <button
                      onClick={() => setIsSoppOpen(!isSoppOpen)}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400">
                          <FileCheck className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <span>SOPP</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSoppOpen ? "rotate-180 text-[#00753A]" : ""}`} />
                    </button>
                    {isSoppOpen && (
                      <div className="ml-4 pl-3 py-1 space-y-1 text-xs border-l-2 border-emerald-500/20 dark:border-emerald-500/30 my-1">
                        {[
                          { id: "sopp_pengadaan", label: "Pengadaan", desc: "Belanja Barang" },
                          { id: "sopp_sewa", label: "Sewa", desc: "Perjanjian Sewa" },
                          { id: "sopp_renovasi", label: "Renovasi", desc: "Pemeliharaan" },
                        ].map((sub) => {
                          const isActive = view === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNavClick(sub.id)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-start gap-2 transition-all cursor-pointer ${
                                isActive
                                  ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold"
                                  : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-[#00753A] dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-xs leading-tight">{sub.label}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{sub.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleNavClick("riwayat")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      view === "riwayat"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400">
                      <History className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span>Riwayat Transaksi Surat</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. KATEGORI: DATA MASTER */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("master")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Data Master</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.master ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.master && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  <button
                    onClick={() => handleNavClick("master_barang")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "master_barang"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Master Barang</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("master_vendor")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "master_vendor"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Supplier / Vendor</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("master_outlet")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "master_outlet"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Outlet & Instansi</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. KATEGORI: DATA PERANGKAT IT */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("inventaris")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Data Perangkat IT</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.inventaris ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.inventaris && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  <button
                    onClick={() => handleNavClick("perangkat_komputer")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "perangkat_komputer"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Perangkat Komputer (PC)</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("perangkat_laptop")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "perangkat_laptop"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Perangkat Laptop</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("perangkat_printer")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "perangkat_printer"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Perangkat Printer</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. KATEGORI: BANGUNAN & FASILITAS */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("bangunan")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Bangunan & Fasilitas</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.bangunan ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.bangunan && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  <button
                    onClick={() => handleNavClick("bangunan_tanah")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "bangunan_tanah"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Map className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Aset Tanah</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("bangunan_sewa")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "bangunan_sewa"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Aset Bangunan & Sewa</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("bangunan_renovasi")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "bangunan_renovasi"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Renovasi Gedung</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("bangunan_sarana")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "bangunan_sarana"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Sarana Pengamanan</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. KATEGORI: PENGATURAN SYSTEM */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button
                onClick={() => toggleMobileCategory("settings")}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                  <span className="text-xs">Pengaturan Sistem</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openMobileCategories.settings ? "rotate-180 text-[#00753A]" : ""}`} />
              </button>
              {openMobileCategories.settings && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick("kelola_user")}
                      className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                        view === "kelola_user"
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                      <span>Manajemen User</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick("log_aktivitas")}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                      view === "log_aktivitas"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                    <span>Log Aktivitas Sistem</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAMPILAN DESKTOP: SINGLE CATEGORY PANEL (hidden md:block)   */}
          {/* ============================================================ */}
          <div className="hidden md:block">
            {/* CATEGORY: HOME */}
            {activeRailCategory === "home" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">Pusat Informasi & Statistik</div>
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "dashboard" || view === "dashboard_inventaris"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Dashboard Inventaris</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Katalog & Stok Logistik</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick("dashboard_bangunan")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "dashboard_bangunan"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Dashboard Bangunan</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Sewa & Renovasi Gedung</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick("dashboard_pengamanan")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "dashboard_pengamanan"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Dashboard Pengamanan</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Fasilitas Keamanan Korporasi</span>
                  </div>
                </button>
              </div>
            )}

            {/* CATEGORY: SURAT */}
            {activeRailCategory === "surat" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">
                  Kelola Surat & Transaksi
                </div>

                {/* Surat Serah Terima */}
                <button
                  onClick={handleStartNew}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "form"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate">Surat Serah Terima</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">BAST Masuk & Keluar</span>
                  </div>
                </button>

                {/* SPK (Perintah Kerja) Dropdown */}
                <div>
                  <button
                    onClick={() => setIsSpkOpen(!isSpkOpen)}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      view?.startsWith("spk_")
                        ? "bg-[#E6F4EA]/40 dark:bg-emerald-950/40 text-[#00753A] dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold">SPK</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Surat Perintah Kerja</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isSpkOpen ? "rotate-180 text-[#00753A]" : ""}`} />
                  </button>
                  {isSpkOpen && (
                    <div className="ml-5 pl-3.5 py-1 space-y-1 text-xs border-l-2 border-emerald-500/20 dark:border-emerald-500/30 my-1">
                      {[
                        { id: "spk_renovasi", label: "Renovasi", desc: "Pekerjaan Gedung" },
                        { id: "spk_elektronik", label: "Elektronik", desc: "Perangkat IT" },
                        { id: "spk_kendaraan", label: "Kendaraan", desc: "Sewa Operasional" },
                      ].map((sub) => {
                        const isActive = view === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.id)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-[#00753A] dark:hover:text-emerald-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full transition-all mt-1.5 shrink-0 ${isActive ? "bg-[#00753A] dark:bg-emerald-400 scale-125" : "bg-slate-300 dark:bg-slate-600"}`} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs leading-tight">{sub.label}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{sub.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SOPP Dropdown */}
                <div>
                  <button
                    onClick={() => setIsSoppOpen(!isSoppOpen)}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      view?.startsWith("sopp_")
                        ? "bg-[#E6F4EA]/40 dark:bg-emerald-950/40 text-[#00753A] dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold">SOPP</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Standar Operasional Prosedur</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isSoppOpen ? "rotate-180 text-[#00753A]" : ""}`} />
                  </button>
                  {isSoppOpen && (
                    <div className="ml-5 pl-3.5 py-1 space-y-1 text-xs border-l-2 border-emerald-500/20 dark:border-emerald-500/30 my-1">
                      {[
                        { id: "sopp_pengadaan", label: "Pengadaan", desc: "Belanja Barang" },
                        { id: "sopp_sewa", label: "Sewa", desc: "Perjanjian Sewa" },
                        { id: "sopp_renovasi", label: "Renovasi", desc: "Pemeliharaan" },
                      ].map((sub) => {
                        const isActive = view === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.id)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-[#00753A] dark:hover:text-emerald-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full transition-all mt-1.5 shrink-0 ${isActive ? "bg-[#00753A] dark:bg-emerald-400 scale-125" : "bg-slate-300 dark:bg-slate-600"}`} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-xs leading-tight">{sub.label}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{sub.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Riwayat Surat */}
                <button
                  onClick={() => handleNavClick("riwayat")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "riwayat"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Riwayat Surat</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Arsip Dokumen Sah</span>
                  </div>
                </button>
              </div>
            )}

            {/* CATEGORY: DATA MASTER */}
            {activeRailCategory === "master" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">Kelola Data Master</div>
                <button
                  onClick={() => handleNavClick("master_barang")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "master_barang"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Master Barang</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Katalog & Stok Logistik</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("master_vendor")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "master_vendor"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Supplier / Vendor</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Daftar Rekanan Resmi</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("master_outlet")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "master_outlet"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Outlet & Instansi</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Unit Kerja & Cabang</span>
                  </div>
                </button>
              </div>
            )}

            {/* CATEGORY: INVENTARIS */}
            {activeRailCategory === "inventaris" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">Aset & Perangkat IT</div>
                <button
                  onClick={() => handleNavClick("perangkat_komputer")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "perangkat_komputer"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Perangkat Komputer</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">PC & All-in-One</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("perangkat_laptop")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "perangkat_laptop"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Perangkat Laptop</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Notebook Pegawai</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("perangkat_printer")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "perangkat_printer"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Perangkat Printer</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Printer & Scanner</span>
                  </div>
                </button>
              </div>
            )}

            {/* CATEGORY: BANGUNAN */}
            {activeRailCategory === "bangunan" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">Aset Bangunan & Fasilitas</div>
                <button
                  onClick={() => handleNavClick("bangunan_tanah")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "bangunan_tanah"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Map className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Aset Tanah</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Sertifikat & Lokasi Lahan</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("bangunan_sewa")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "bangunan_sewa"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Aset Bangunan & Sewa</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Gedung & Kontrak Sewa</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("bangunan_renovasi")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "bangunan_renovasi"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Renovasi Gedung</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Monitoring Proyek & Biaya</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick("bangunan_sarana")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "bangunan_sarana"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Sarana Pengamanan</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">CCTV, Alarm & APAR</span>
                  </div>
                </button>
              </div>
            )}

            {/* CATEGORY: SETTINGS */}
            {activeRailCategory === "settings" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">Pengaturan & Hak Akses</div>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick("kelola_user")}
                    className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      view === "kelola_user"
                        ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold">Manajemen User</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Hak Akses & Akun Staff</span>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => handleNavClick("log_aktivitas")}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                    view === "log_aktivitas"
                      ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">Log Aktivitas Sistem</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">Audit Trail Riwayat Kerja</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section Drawer (Footer) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">© 2026 Departemen Logistik</p>
        </div>
      </aside>
    </>
  );
}
