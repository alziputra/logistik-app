import React, { useState, useMemo } from "react";
import {
  Map, Key, Hammer, Clock, ArrowRight, Shield,
  CheckCircle2, AlertTriangle, FileText, Handshake,
  BarChart3, TrendingUp, Loader2, CheckCircle
} from "lucide-react";

export default function BuildingDashboardView({
  buildingLands = [],
  buildingSewas = [],
  buildingRenovations = [],
  setView,
  setLandFilter,
  setSewaFilter,
}) {
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));
  const [confirmItem, setConfirmItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const getStatusInfo = (sewa) => {
    if (sewa.status === "Done" || sewa.status === "Selesai") return "Selesai";
    if (sewa.status === "Sewa Habis" || sewa.status === "Expired") return "Sewa Habis";
    const tglAkhir = sewa.tgl_kontrak_berakhir || sewa.tanggal_kontrak_berakhir;
    if (!tglAkhir) return "Aktif";
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglSelesai = new Date(tglAkhir);
    tglSelesai.setHours(0, 0, 0, 0);

    if (tglSelesai < hariIni) return "Sewa Habis";

    const diffTime = tglSelesai.getTime() - hariIni.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return "Hampir Habis";
    return "Aktif";
  };

  const hitungSisaHari = (tanggalSelesai) => {
    if (!tanggalSelesai) return null;
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglSelesai = new Date(tanggalSelesai);
    tglSelesai.setHours(0, 0, 0, 0);

    const diffTime = tglSelesai.getTime() - hariIni.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const hitungSisaWaktuText = (tanggalSelesai) => {
    const diffDays = hitungSisaHari(tanggalSelesai);
    if (diffDays === null) return "—";
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return `${diffDays} hari`;

    const hariIni = new Date();
    const tglSelesai = new Date(tanggalSelesai);
    const diffMonths = (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 + (tglSelesai.getMonth() - hariIni.getMonth());
    return `${diffMonths > 0 ? diffMonths : 0} bln`;
  };

  const formatHarga = (harga) => {
    if (harga === null || harga === undefined) return "—";
    return `Rp ${Number(harga).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const alertTanah = buildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => ({
      ...item,
      sisaHari: hitungSisaHari(item.tgl_berakhir_shgb),
    }))
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30)
    .sort((a, b) => a.sisaHari - b.sisaHari);

  const alertSewa = buildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      return {
        ...item,
        tglAkhir,
        sisaHari: hitungSisaHari(tglAkhir),
      };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30)
    .sort((a, b) => a.sisaHari - b.sisaHari);

  return (
    <div className="space-y-6">
      {/* ALERT TANAH */}
      {alertTanah.length > 0 && (
        <div className="bg-rose-950/60 rounded-xl shadow-sm border border-rose-800/40 overflow-hidden mb-4 p-4">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-sm text-rose-300">Perhatian: SHGB Tanah Segera Habis!</h3>
              <p className="text-xs text-rose-400">Terdapat {alertTanah.length} aset tanah yang mendekati masa habis berlaku SHGB.</p>
            </div>
          </div>
        </div>
      )}

      {/* ALERT SEWA */}
      {alertSewa.length > 0 && (
        <div className="bg-rose-950/60 rounded-xl shadow-sm border border-rose-800/40 overflow-hidden mb-4 p-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-sm text-rose-300">Perhatian: Kontrak Sewa Bangunan Segera Habis!</h3>
              <p className="text-xs text-rose-400">Terdapat {alertSewa.length} sewa bangunan yang mendekati masa habis kontrak.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Aset Tanah</span>
            <Map className="w-5 h-5 text-emerald-400" />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-100">{buildingLands.length}</h4>
          <p className="text-xs text-slate-500 mt-1">Total sertifikat terdaftar</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Sewa Bangunan</span>
            <Key className="w-5 h-5 text-teal-400" />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-100">{buildingSewas.length}</h4>
          <p className="text-xs text-slate-500 mt-1">Kontrak aktif & selesai</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Renovasi Gedung</span>
            <Hammer className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-100">{buildingRenovations.length}</h4>
          <p className="text-xs text-slate-500 mt-1">Pekerjaan fisik terdaftar</p>
        </div>
      </div>
    </div>
  );
}
