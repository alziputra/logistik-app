import React, { useState } from "react";
import { BarChart3, Package, TrendingUp, Layers, ArrowUpRight } from "lucide-react";

export default function InventoryChart({ inventory = [], setView }) {
  const [displayCount, setDisplayCount] = useState(10); // 10 | 15

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // Sort descending by stock quantity
  const sortedItems = [...safeInventory].sort((a, b) => {
    const bStok = Number(b.kuantitas !== undefined ? b.kuantitas : b.stok || 0);
    const aStok = Number(a.kuantitas !== undefined ? a.kuantitas : a.stok || 0);
    return bStok - aStok;
  });

  const maxStok =
    sortedItems.length > 0
      ? Math.max(
          ...sortedItems.map((i) => {
            const s = i.kuantitas !== undefined ? i.kuantitas : i.stok || 0;
            return Number(s);
          }),
        )
      : 1;

  const displayList = sortedItems.slice(0, displayCount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden mb-6">
      {/* Header Panel */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#00753A] dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Peringkat & Ketersediaan Stok Master Barang</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-[#00753A] dark:text-emerald-400 border border-emerald-500/20">Top {displayCount}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Distribusi jumlah fisik barang logistik yang siap diserahterimakan ke unit/kantor cabang.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDisplayCount(10)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${displayCount === 10 ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
            >
              Top 10
            </button>
            <button
              type="button"
              onClick={() => setDisplayCount(15)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${displayCount === 15 ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
            >
              Top 15
            </button>
          </div>

          <button type="button" onClick={() => setView && setView("master_barang")} className="text-xs font-bold text-[#00753A] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer">
            <span>Semua Barang</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-xs font-medium">Belum ada data stok master barang terdaftar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((item, idx) => {
              const stok = Number(item.kuantitas !== undefined ? item.kuantitas : item.stok || 0);
              const percentage = maxStok > 0 ? Math.round((stok / maxStok) * 100) : 0;
              const isTopThree = idx < 3;

              return (
                <div key={item.id || idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          idx === 0
                            ? "bg-amber-400 text-amber-950 font-extrabold"
                            : idx === 1
                              ? "bg-slate-300 text-slate-800"
                              : idx === 2
                                ? "bg-amber-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#00753A] dark:group-hover:text-emerald-400 transition-colors">{item.nama || item.namaBarang || "Barang"}</span>
                      {item.merk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">{item.merk}</span>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{stok.toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.satuan || "Unit"}</span>
                    </div>
                  </div>

                  {/* Progress Bar with Color Indicator */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isTopThree ? "bg-linear-to-r from-[#00753A] to-emerald-400" : "bg-linear-to-r from-emerald-600 to-teal-400"}`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
