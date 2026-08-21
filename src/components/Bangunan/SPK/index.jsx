import React, { useState } from "react";
import { FileText } from "lucide-react";

export default function BangunanSPK({ type = "renovasi", setView = () => {} }) {
  const [searchQuery, setSearchQuery] = useState("");

  const getTitle = () => {
    switch (type) {
      case "elektronik": return "Daftar SPK Pekerjaan Elektronik & Perangkat";
      case "kendaraan": return "Daftar SPK Kendaraan Operasional";
      default: return "Daftar SPK Pekerjaan Renovasi & Bangunan";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{getTitle()}</h2>
            <p className="text-xs text-slate-400">Manajemen histori Surat Perjanjian Kerja (SPK) logistik Pegadaian.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center shadow-xl">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Modul Histori {getTitle()}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Penyimpanan arsip digital dokumen SPK & Addendum secara terpusat untuk pelaporan audit logistik.
        </p>
      </div>
    </div>
  );
}
