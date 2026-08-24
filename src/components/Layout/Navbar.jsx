import React, { useState, useEffect } from "react";
import {
  Package, LayoutDashboard, ChevronDown, FileText, Monitor, Printer, Shield,
  Users, List, Cpu, Box, Building2, Database, History, Map, Building, Hammer, FileCheck,
  Sun, Moon, Home, Settings, Activity, Car, Lock, Unlock, AlertTriangle, Download, Sliders, CheckSquare, Clock, PlusCircle
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
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // 4 Active Rail Categories: 'surat' | 'tetap' | 'sewa' | 'settings'
  const getCategoryFromView = (v) => {
    if (v === "form" || v === "riwayat" || v.startsWith("surat_")) return "surat";
    if (v === "kelola_user" || v === "log_aktivitas" || v.startsWith("master_")) return "settings";
    if (v.startsWith("bangunan_") || v.startsWith("spk_") || v.startsWith("sopp_")) return "sewa";
    return "tetap";
  };

  const [activeRailCategory, setActiveRailCategory] = useState(getCategoryFromView(view));

  useEffect(() => {
    setActiveRailCategory(getCategoryFromView(view));
  }, [view]);

  // Accordion Toggles
  const [isPengajuanTetapOpen, setIsPengajuanTetapOpen] = useState(true);
  const [isPengajuanSewaOpen, setIsPengajuanSewaOpen] = useState(true);
  const [isAdministrasiOpen, setIsAdministrasiOpen] = useState(false);
  const [isAsetOpen, setIsAsetOpen] = useState(false);
  const [isManajemenOpen, setIsManajemenOpen] = useState(view === "kelola_user" || view === "log_aktivitas");
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(view.startsWith("master_"));

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
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">FAST LOGISTIK</span>
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

      {/* NARROW ICON RAIL (4 MENU UTAMA SISI PALING KIRI) */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-20 bg-[#00382B] dark:bg-slate-950 text-white flex-col items-center py-4 z-50 print:hidden shadow-md border-r border-emerald-900/40 dark:border-slate-800">
        {/* Toggle Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-emerald-100 hover:text-white hover:bg-emerald-900/50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer mb-6 active:scale-95"
          title={isSidebarOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
        >
          <List className="w-6 h-6" />
        </button>

        {/* 4 Rail Menu Items */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          {/* 1. Buat Surat */}
          <button
            onClick={() => {
              setActiveRailCategory("surat");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1.5 transition-all cursor-pointer w-16 py-3 ${
              activeRailCategory === "surat"
                ? "bg-white text-emerald-900 shadow-md font-extrabold scale-105"
                : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/40"
            }`}
            title="Masukan buat surat disini"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Buat Surat</span>
          </button>

          {/* 2. Aset Tetap */}
          <button
            onClick={() => {
              setActiveRailCategory("tetap");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1.5 transition-all cursor-pointer w-16 py-3 ${
              activeRailCategory === "tetap"
                ? "bg-white text-emerald-900 shadow-md font-extrabold scale-105"
                : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/40"
            }`}
            title="Aset Tetap"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Aset Tetap</span>
          </button>

          {/* 3. Aset Sewa */}
          <button
            onClick={() => {
              setActiveRailCategory("sewa");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1.5 transition-all cursor-pointer w-16 py-3 ${
              activeRailCategory === "sewa"
                ? "bg-white text-emerald-900 shadow-md font-extrabold scale-105"
                : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/40"
            }`}
            title="Aset Sewa"
          >
            <Building2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Aset Sewa</span>
          </button>

          {/* 4. Pengaturan */}
          <button
            onClick={() => {
              setActiveRailCategory("settings");
              if (!isSidebarOpen) setIsSidebarOpen(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1.5 transition-all cursor-pointer w-16 py-3 ${
              activeRailCategory === "settings"
                ? "bg-white text-emerald-900 shadow-md font-extrabold scale-105"
                : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/40"
            }`}
            title="Pengaturan"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight text-center">Pengaturan</span>
          </button>
        </div>
      </div>

      {/* MAIN SUB-MENU SIDEBAR PANEL */}
      <aside
        className={`fixed top-0 left-0 md:left-20 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 print:hidden flex flex-col z-40 shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full"
        }`}
      >
        {/* Header Drawer */}
        <div className="flex items-center gap-3 px-4 h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button onClick={closeMenu} className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0">
            <List className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/40 p-1.5 rounded-lg">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <span className="font-extrabold text-base md:text-lg text-emerald-700 dark:text-emerald-400 tracking-tight italic">
              FAST <span className="text-slate-800 dark:text-slate-100 not-italic text-sm font-bold">LOGISTIK</span>
            </span>
          </div>
        </div>

        {/* Sub-menu Content Sesuai Kategori Rail Active */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4 custom-scrollbar pb-6 text-xs font-semibold">

          {/* ========================================================================= */}
          {/* CATEGORY 1: BUAT SURAT (Letter Generator Catalog Hub)                     */}
          {/* ========================================================================= */}
          {activeRailCategory === "surat" && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Pilih Modul Surat
              </div>

              {/* BAST Surat Serah Terima */}
              <button
                onClick={handleStartNew}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "form"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div>Berita Acara (BAST)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Barang Masuk / Keluar / Mutasi</div>
                </div>
              </button>

              {/* SPK Surat Perjanjian Kerja */}
              <button
                onClick={() => handleNavClick("spk_renovasi")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view.startsWith("spk_")
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <FileCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div>Surat Perjanjian (SPK)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Renovasi / IT / Kendaraan</div>
                </div>
              </button>

              {/* SOPP Generator */}
              <button
                onClick={() => handleNavClick("sopp_generator")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "sopp_generator" || view === "sopp_sewa"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div>Pedoman SOPP</div>
                  <div className="text-[10px] text-slate-400 font-normal">Standar Prosedur Operasional</div>
                </div>
              </button>

              {/* Riwayat Transaksi & Surat */}
              <button
                onClick={() => handleNavClick("riwayat")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors mt-2 ${
                  view === "riwayat"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div>Riwayat Surat</div>
                  <div className="text-[10px] text-slate-400 font-normal">Daftar Surat Masuk & Keluar</div>
                </div>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 2: ASET TETAP (Video Timestamps 0:13 - 0:22)                    */}
          {/* ========================================================================= */}
          {activeRailCategory === "tetap" && (
            <div className="space-y-1 animate-in fade-in duration-200">
              {/* Beranda */}
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "dashboard"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Beranda</span>
              </button>

              {/* Pengajuan (Accordion) */}
              <div>
                <button
                  onClick={() => setIsPengajuanTetapOpen(!isPengajuanTetapOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Pengajuan</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPengajuanTetapOpen ? "rotate-180" : ""}`} />
                </button>
                {isPengajuanTetapOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={handleStartNew}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "form" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Buat Pengajuan Baru
                    </button>
                    <button
                      onClick={() => handleNavClick("riwayat")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "riwayat" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Daftar Pengajuan / Riwayat
                    </button>
                  </div>
                )}
              </div>

              {/* Aset Tanah */}
              <button
                onClick={() => handleNavClick("bangunan_tanah")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_tanah"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Map className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aset Tanah</span>
              </button>

              {/* Aset Bangunan */}
              <button
                onClick={() => handleNavClick("bangunan_sewa")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_sewa"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aset Bangunan</span>
              </button>

              {/* Aset Kendaraan */}
              <button
                onClick={() => handleNavClick("spk_kendaraan")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "spk_kendaraan"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Car className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aset Kendaraan</span>
              </button>

              {/* Aset Inventaris & IT */}
              <button
                onClick={() => handleNavClick("perangkat_komputer")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view.startsWith("perangkat_")
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aset Inventaris & IT</span>
              </button>

              {/* Aset Disewakan */}
              <button
                onClick={() => handleNavClick("sopp_sewa")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "sopp_sewa"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aset Disewakan</span>
              </button>

              {/* Persetujuan */}
              <button
                onClick={() => handleNavClick("spk_renovasi")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "spk_renovasi"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Persetujuan</span>
              </button>

              {/* Laporan */}
              <button
                onClick={() => handleNavClick("log_aktivitas")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "log_aktivitas"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Laporan & Jejak Audit</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 3: ASET SEWA (Video Timestamps 0:23 - 0:39)                    */}
          {/* ========================================================================= */}
          {activeRailCategory === "sewa" && (
            <div className="space-y-1 animate-in fade-in duration-200">
              {/* Beranda */}
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "dashboard"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Beranda</span>
              </button>

              {/* Pengajuan (Accordion) */}
              <div>
                <button
                  onClick={() => setIsPengajuanSewaOpen(!isPengajuanSewaOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Pengajuan</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPengajuanSewaOpen ? "rotate-180" : ""}`} />
                </button>
                {isPengajuanSewaOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={handleStartNew}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "form" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Pengajuan Baru
                    </button>
                    <button
                      onClick={() => handleNavClick("riwayat")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "riwayat" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Approval / Status
                    </button>
                  </div>
                )}
              </div>

              {/* SPK */}
              <button
                onClick={() => handleNavClick("spk_renovasi")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "spk_renovasi"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <FileCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>SPK</span>
              </button>

              {/* Administrasi (Accordion) */}
              <div>
                <button
                  onClick={() => setIsAdministrasiOpen(!isAdministrasiOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Administrasi</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isAdministrasiOpen ? "rotate-180" : ""}`} />
                </button>
                {isAdministrasiOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("bangunan_renovasi")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Registrasi
                    </button>
                    <button
                      onClick={() => handleNavClick("riwayat")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Penyerahan
                    </button>
                    <button
                      onClick={() => handleNavClick("riwayat")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Pengembalian
                    </button>
                  </div>
                )}
              </div>

              {/* Aset (Accordion) */}
              <div>
                <button
                  onClick={() => setIsAsetOpen(!isAsetOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Aset</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isAsetOpen ? "rotate-180" : ""}`} />
                </button>
                {isAsetOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("master_barang")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Blokir
                    </button>
                    <button
                      onClick={() => handleNavClick("master_barang")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Buka Blokir
                    </button>
                  </div>
                )}
              </div>

              {/* Vendor */}
              <button
                onClick={() => handleNavClick("master_vendor")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "master_vendor"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Vendor</span>
              </button>

              {/* Kehilangan */}
              <button
                onClick={() => handleNavClick("bangunan_sarana")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "bangunan_sarana"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Kehilangan</span>
              </button>

              {/* Laporan */}
              <button
                onClick={() => handleNavClick("log_aktivitas")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "log_aktivitas"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Laporan</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CATEGORY 4: PENGATURAN (Video Timestamps 0:40 - 0:49)                    */}
          {/* ========================================================================= */}
          {activeRailCategory === "settings" && (
            <div className="space-y-2 animate-in fade-in duration-200">
              {/* Manajemen (Accordion) */}
              <div>
                <button
                  onClick={() => setIsManajemenOpen(!isManajemenOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Manajemen</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isManajemenOpen ? "rotate-180" : ""}`} />
                </button>
                {isManajemenOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("kelola_user")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "kelola_user" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      User & Akses
                    </button>
                    <button
                      onClick={() => handleNavClick("kelola_user")}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                    >
                      Role & Izin
                    </button>
                  </div>
                )}
              </div>

              {/* Master Data (Accordion) */}
              <div>
                <button
                  onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                  className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Master Data</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMasterDataOpen ? "rotate-180" : ""}`} />
                </button>
                {isMasterDataOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick("master_barang")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "master_barang" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Barang / Manufaktur
                    </button>
                    <button
                      onClick={() => handleNavClick("master_vendor")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "master_vendor" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Supplier / Vendor
                    </button>
                    <button
                      onClick={() => handleNavClick("master_outlet")}
                      className={`w-full px-3 py-1.5 rounded-lg text-left transition-colors ${
                        view === "master_outlet" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                      }`}
                    >
                      Outlet & Instansi
                    </button>
                  </div>
                )}
              </div>

              {/* Lookup & Parameter */}
              <button
                onClick={() => handleNavClick("sopp_generator")}
                className="w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Sliders className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Lookup & Parameter</span>
              </button>

              {/* Riwayat Penarikan Data */}
              <button
                onClick={() => handleNavClick("log_aktivitas")}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                  view === "log_aktivitas"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Download className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Riwayat Penarikan Data</span>
              </button>
            </div>
          )}

        </nav>
      </aside>
    </>
  );
}
