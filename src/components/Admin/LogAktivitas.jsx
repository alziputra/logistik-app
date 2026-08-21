import React from "react";
import { Activity, Clock } from "lucide-react";

export default function LogAktivitas({ logs = [] }) {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-950 p-2.5 rounded-2xl border border-indigo-800/40">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Log Aktivitas Sistem</h2>
          <p className="text-xs text-slate-400">Riwayat audit jejak aktivitas transaksi dan perubahan data.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Modul</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada log aktivitas tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {log.timestamp || log.created_at || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">{log.user || log.username || "System"}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{log.modul || log.module || "General"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.aksi || log.action || "LOG"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.keterangan || log.details || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
