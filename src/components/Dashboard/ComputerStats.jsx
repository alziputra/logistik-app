import React from "react";
import { Monitor, CheckCircle, AlertTriangle, Package } from "lucide-react";

export default function ComputerStats({ computers = [], setView, setComputerFilter }) {
  const safeComputers = Array.isArray(computers) ? computers : [];
  const computerStats = { inventaris: 0, berjalan: 0, habis: 0 };
  const groupedComputers = {}; 
  
  safeComputers.forEach((c) => {
    if (c.status === "Inventaris") computerStats.inventaris++;
    else if (c.status === "Sewa Berjalan") computerStats.berjalan++;
    else if (c.status === "Sewa Habis" || c.status === "Sewa Selesai") computerStats.habis++;

    const nama = c.produk || "Tidak Diketahui";
    groupedComputers[nama] = (groupedComputers[nama] || 0) + 1;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pl-1">
        <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Data PC & Komputer (Total: <span className="text-emerald-600 dark:text-emerald-400">{safeComputers.length} Unit</span>)</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => {
              if (setComputerFilter) setComputerFilter("Sewa Berjalan");
              setView("perangkat_komputer");
            }} 
            className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
          >
            <div className="bg-emerald-100 dark:bg-emerald-950 p-3 rounded-xl group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors"><CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sewa Berjalan</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{computerStats.berjalan}</p></div>
          </div>
          <div 
            onClick={() => {
              if (setComputerFilter) setComputerFilter("Sewa Habis");
              setView("perangkat_komputer");
            }} 
            className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-rose-500/50 hover:shadow-md transition-all group"
          >
            <div className="bg-rose-100 dark:bg-rose-950 p-3 rounded-xl group-hover:bg-rose-200 dark:group-hover:bg-rose-900 transition-colors"><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sewa Selesai</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{computerStats.habis}</p></div>
          </div>
          <div 
            onClick={() => {
              if (setComputerFilter) setComputerFilter("Inventaris");
              setView("perangkat_komputer");
            }} 
            className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group"
          >
            <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors"><Package className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inventaris Gudang</p><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{computerStats.inventaris}</p></div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">Rincian Model / Hardware</h4>
          <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[88px] pr-1">
            {Object.keys(groupedComputers).length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada rincian.</p>
            ) : (
              <ul className="space-y-1">
                {Object.entries(groupedComputers).map(([nama, count]) => (
                  <li key={nama} className="text-xs flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[120px]">{nama}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{count} Unit</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
