import React, { useMemo } from "react";
import { Shield, CheckCircle2, AlertTriangle, Video, BarChart3, ArrowRight } from "lucide-react";

export default function SecurityDashboardView({ securityFacilities = [], setView, setSecurityFilter }) {
  const onlineCount = useMemo(() => {
    return securityFacilities
      .filter((f) => f.status && f.status.toLowerCase() === "online")
      .reduce((sum, f) => sum + (Number(f.jumlah_kamera) || 0), 0);
  }, [securityFacilities]);

  const offlineCount = useMemo(() => {
    return securityFacilities
      .filter((f) => f.status && f.status.toLowerCase() === "offline")
      .reduce((sum, f) => sum + (Number(f.jumlah_kamera) || 0), 0);
  }, [securityFacilities]);

  const branchData = useMemo(() => {
    const groups = {};
    securityFacilities.forEach((f) => {
      const branch = f.kantor_cabang || "Lainnya";
      const cameras = Number(f.jumlah_kamera) || 0;
      if (!groups[branch]) {
        groups[branch] = 0;
      }
      groups[branch] += cameras;
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [securityFacilities]);

  const getStatusBadge = (status) => {
    if (status && status.toLowerCase() === "online") {
      return "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40";
    }
    return "bg-rose-950/80 text-rose-400 border border-rose-800/40";
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Pemantauan CCTV</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => {
                  if (setSecurityFilter) setSecurityFilter("online");
                  setView("bangunan_sarana");
                }}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 transition-all duration-200 flex flex-col justify-between h-28 cursor-pointer hover:border-emerald-500/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-extrabold tracking-wide">CCTV Online</span>
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-3xl font-extrabold text-slate-100 tracking-tight">{onlineCount}</h4>
              </div>

              <div 
                onClick={() => {
                  if (setSecurityFilter) setSecurityFilter("offline");
                  setView("bangunan_sarana");
                }}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 transition-all duration-200 flex flex-col justify-between h-28 cursor-pointer hover:border-rose-500/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-400 font-extrabold tracking-wide">CCTV Offline</span>
                  <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800/40">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-3xl font-extrabold text-slate-100 tracking-tight">{offlineCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 flex flex-col overflow-hidden h-full">
            <div className="px-5 py-3.5 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-950 p-1.5 rounded-lg">
                  <Video className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-sm text-slate-100">Data CCTV Terbaru</h3>
              </div>
              <button
                onClick={() => setView("bangunan_sarana")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Lihat Selengkapnya <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-slate-400 bg-slate-950 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3 w-12 text-center">No</th>
                    <th className="px-5 py-3">Nama Unit Kerja</th>
                    <th className="px-5 py-3">Kantor Cabang</th>
                    <th className="px-5 py-3">Vendor</th>
                    <th className="px-5 py-3 text-right">Jumlah Kamera</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {securityFacilities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-4 text-center text-slate-500 italic">Belum ada data CCTV.</td>
                    </tr>
                  ) : (
                    securityFacilities.slice(0, 3).map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-2.5 text-center text-slate-400 font-medium">{index + 1}</td>
                        <td className="px-5 py-2.5 font-semibold text-slate-200">{item.nama_unit_kerja || "—"}</td>
                        <td className="px-5 py-2.5 text-slate-300">{item.kantor_cabang || "—"}</td>
                        <td className="px-5 py-2.5 text-slate-300 truncate max-w-[150px]" title={item.vendor}>{item.vendor || "—"}</td>
                        <td className="px-5 py-2.5 text-right font-medium text-slate-200">{item.jumlah_kamera ?? 0}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${getStatusBadge(item.status)}`}>
                            {item.status || "Offline"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
