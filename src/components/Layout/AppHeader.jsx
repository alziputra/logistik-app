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

  return (
    <div className="hidden md:flex sticky md:top-0 z-30 h-16 md:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm items-center justify-between px-6 sm:px-8 print:hidden shrink-0 transition-colors">
      {/* Left side: Uppercase Page Title */}
      <h1 className="text-base md:text-lg font-extrabold text-slate-700 dark:text-slate-200 tracking-wider uppercase">
        {title || "DASHBOARD"}
      </h1>

      {/* Right side: Server Status, Theme Toggle, Notification Bell, User Badge */}
      <div className="flex items-center gap-4">
        <ServerStatusPill />

        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Ganti ke Tema Terang (Light Mode)" : "Ganti ke Tema Gelap (Dark Mode)"}
          className="px-4 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Gelap</span>
            </>
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
