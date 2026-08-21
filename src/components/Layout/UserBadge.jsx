import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, Key, Info, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import UserProfileModal from "../Modal/UserProfileModal";

export default function UserBadge({ user }) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("info");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModalWithTab = (tab) => {
    setModalTab(tab);
    setIsOpen(false);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Clickable Profile Badge Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-3.5 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer select-none"
        >
          <div className="bg-emerald-100 dark:bg-emerald-950 p-1.5 rounded-full flex-shrink-0">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left text-sm pr-1">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold leading-tight uppercase tracking-wide">
              {user.role || "User"}
            </p>
            <p className="font-bold text-slate-900 dark:text-slate-200 text-xs leading-tight truncate max-w-[140px]">
              {user.name || user.email}
            </p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* User Profile Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Details Header */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {user.name || "Pengguna Logistik"}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                  {user.role || "User"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email || "-"}
              </p>
            </div>

            {/* Menu Options */}
            <div className="space-y-0.5 py-1">
              <button
                onClick={() => openModalWithTab("info")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Detail Profil Akun</span>
              </button>

              <button
                onClick={() => openModalWithTab("security")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-500" />
                <span>Ubah Password</span>
              </button>

              <button
                onClick={() => openModalWithTab("app")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Info Aplikasi</span>
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (logout) logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </>
  );
}
