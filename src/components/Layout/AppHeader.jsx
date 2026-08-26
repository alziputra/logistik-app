import React from "react";
import UserBadge from "./UserBadge";
import NotificationBell from "./NotificationBell";
import ServerStatusPill from "../Notification/ServerStatusPill";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function AppHeader({
  user,
  title,
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView,
}) {
  const { theme, toggleTheme } = useTheme();

  const getHeaderDetails = () => {
    if (!title || title === "dashboard") return { category: "HOME", text: "Dashboard Inventaris" };
    if (title === "spk_renovasi") return { category: "SURAT", text: "SPK > Renovasi" };
    if (title === "spk_elektronik") return { category: "SURAT", text: "SPK > Elektronik" };
    if (title === "spk_kendaraan") return { category: "SURAT", text: "SPK > Kendaraan" };
    if (title === "sopp_pengadaan") return { category: "SURAT", text: "SOPP > Pengadaan" };
    if (title === "sopp_sewa") return { category: "SURAT", text: "SOPP > Sewa" };
    if (title === "sopp_renovasi") return { category: "SURAT", text: "SOPP > Renovasi" };
    if (title === "form") return { category: "SURAT", text: "Surat Serah Terima (BAST)" };
    if (title === "riwayat") return { category: "SURAT", text: "Riwayat Surat" };

    const formatted = title.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { category: "HOME", text: formatted };
  };

  const headerInfo = getHeaderDetails();

  return (
    <div className="hidden md:flex sticky md:top-0 z-30 h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm items-center justify-between px-6 sm:px-8 print:hidden shrink-0 transition-colors">
      {/* Left side: Breadcrumb & Title matching view.jpeg */}
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {headerInfo.category}
        </span>
        <h1 className="text-base md:text-lg font-bold text-[#00753A] dark:text-[#22C55E] tracking-tight leading-tight">
          {headerInfo.text}
        </h1>
      </div>

      {/* Right side: Server Status, Theme Toggle, Notification Bell, User Badge */}
      <div className="flex items-center gap-4">
        <ServerStatusPill />

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
          className="p-2 rounded-full border shadow-sm transition-all cursor-pointer flex items-center justify-center bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          )}
        </button>

        <NotificationBell
          printers={printers}
          computers={computers}
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          setView={setView}
          showLabel={false}
        />

        <UserBadge user={user} />
      </div>
    </div>
  );
}
