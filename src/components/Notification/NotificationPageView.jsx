import React from "react";
import { Bell, AlertTriangle } from "lucide-react";

export default function NotificationPageView({
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView = () => {},
}) {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-rose-950 p-2.5 rounded-2xl border border-rose-800/40">
          <Bell className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Notifikasi Peringatan System</h2>
          <p className="text-xs text-slate-400">Daftar kontrak sewa & lisensi yang segera berakhir.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-slate-100 text-lg mb-2">Ringkasan Peringatan Active</h3>
          <p className="text-sm text-slate-400">
            Periksa berkas sewa perangkat printer, komputer, maupun sertifikat SHGB tanah yang membutuhkan tindakan perpanjangan kontrak.
          </p>
        </div>
      </div>
    </div>
  );
}
