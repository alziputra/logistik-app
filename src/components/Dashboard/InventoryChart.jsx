import React from "react";
import { BarChart3, Package } from "lucide-react";

export default function InventoryChart({ inventory = [] }) {
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const chartData = [...safeInventory].sort((a, b) => {
    const bStok = b.kuantitas !== undefined ? b.kuantitas : (b.stok || 0);
    const aStok = a.kuantitas !== undefined ? a.kuantitas : (a.stok || 0);
    return Number(bStok) - Number(aStok);
  });
  const maxStok = chartData.length > 0 ? Math.max(...chartData.map((i) => {
    const s = i.kuantitas !== undefined ? i.kuantitas : (i.stok || 0);
    return Number(s);
  })) : 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3 shrink-0">
        <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-lg">
          <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Visualisasi Stok Master Barang (Top Item)</h3>
        </div>
      </div>
      
      <div className="p-4 flex flex-col justify-end">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-slate-500">
            <Package className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Belum ada data stok.</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-48 overflow-x-auto custom-scrollbar pb-2 pt-6 px-1">
            {chartData.slice(0, 15).map((item) => { 
              const stokValue = Number(item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0));
              const heightPct = maxStok > 0 ? (stokValue / maxStok) * 100 : 0;
              return (
                <div key={item.id || item.nama} className="flex flex-col items-center shrink-0 w-20 group h-full">
                  <div className="w-full flex-1 flex flex-col justify-end relative">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 rounded-t-md transition-all relative flex flex-col justify-end shadow-sm cursor-pointer"
                      style={{ height: `${heightPct}%`, minHeight: '4px' }}
                      title={`${item.nama} \nStok: ${stokValue} ${item.satuan || ''}`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-md border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {stokValue}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 mt-2 w-full flex justify-center items-start">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 text-center line-clamp-2 leading-tight px-1 font-medium" title={item.nama}>
                      {item.nama}
                    </span>
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
