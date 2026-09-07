import React from "react";
import { PlusCircle, PackagePlus, Building2, History, Activity, Calendar, ShieldCheck } from "lucide-react";

export default function DashboardHero({ user = {}, setView, startNewDocument }) {
  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName =
    user?.name || (user?.email === "admin@logistik.com" || user?.email?.includes("admin") ? "Alzi Rahmana Putra" : user?.email === "officer@gmail.com" ? "Dio Haris Kurniawan" : user?.email?.split("@")[0] || "Petugas Logistik");

  const userRole = user?.role || "ADMINISTRATOR";

  const handleCreateBAST = () => {
    if (typeof startNewDocument === "function") {
      startNewDocument("Barang Keluar");
    }
    if (typeof setView === "function") {
      setView("form");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#005a2b] via-[#00753A] to-emerald-700 text-white shadow-lg p-5 sm:p-6 mb-6">
      {/* Background Decorative Circles */}
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-32 -bottom-12 w-40 h-40 rounded-full bg-emerald-400/15 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Greeting & Status */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-emerald-100 border border-white/20 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{userRole}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-100/90 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDateStr}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Selamat Datang, <span className="text-emerald-200">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">Pusat Komando Manajemen Inventaris, Pengelolaan Perangkat TI, dan Administrasi Berita Acara Serah Terima (BAST).</p>
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Quick Action 1: Buat BAST */}
          <button
            type="button"
            onClick={handleCreateBAST}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-[#00753A] rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#00753A]" />
            <span>Buat Surat BAST</span>
          </button>

          {/* Quick Action 2: Tambah Barang */}
          <button
            type="button"
            onClick={() => setView && setView("master_barang")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/20 backdrop-blur-xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <PackagePlus className="w-4 h-4 text-emerald-200" />
            <span>Master Barang</span>
          </button>

          {/* Quick Action 3: Master Outlet */}
          <button
            type="button"
            onClick={() => setView && setView("master_outlet")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/20 backdrop-blur-xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Building2 className="w-4 h-4 text-emerald-200" />
            <span>Instansi / Outlet</span>
          </button>

          {/* Quick Action 4: Riwayat */}
          <button
            type="button"
            onClick={() => setView && setView("riwayat")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/20 backdrop-blur-xs transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <History className="w-4 h-4 text-emerald-200" />
            <span>Riwayat BAST</span>
          </button>
        </div>
      </div>
    </div>
  );
}
