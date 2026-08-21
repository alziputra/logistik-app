import React from "react";
import { History, Plus, ArrowLeft, Activity, Layers } from "lucide-react";

export default function TransactionActivity({ transactions = [], setView }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const stats = { masuk: 0, keluar: 0, total: safeTransactions.length };
  
  safeTransactions.forEach((trx) => {
    const jenis = String(trx.jenisTransaksi).trim().toLowerCase();
    if (jenis === "barang masuk") stats.masuk++;
    else if (jenis === "barang keluar") stats.keluar++;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-lg"><Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Aktivitas Transaksi Terbaru</h3>
          </div>
          {safeTransactions.length > 0 && (
            <button
              onClick={() => {
                localStorage.setItem("riwayat_active_tab", "serah_terima");
                setView("riwayat");
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          )}
        </div>
        <div className="p-0 flex-1 overflow-hidden">
          {safeTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Belum ada aktivitas.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 flex flex-col">
              {safeTransactions.slice(0, 4).map((trx) => (
                <div key={trx.id} className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-none mb-1.5">{trx.nomorSurat}</p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">{trx.tanggal}</span>
                      <span className="truncate max-w-[200px] sm:max-w-[300px] text-slate-600 dark:text-slate-400">{trx.pengirimNama} ➔ {trx.penerimaNama}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${trx.jenisTransaksi === "Barang Masuk" ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" : "bg-amber-50 dark:bg-orange-950/80 text-amber-700 dark:text-orange-400 border-amber-200 dark:border-orange-800/40"}`}>
                      {trx.jenisTransaksi === "Barang Masuk" ? "MASUK" : "KELUAR"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-indigo-100 dark:bg-indigo-950/80 p-2 rounded-lg"><History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Total Transaksi</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keseluruhan</span></div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Barang Masuk</span></div>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{stats.masuk}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-orange-950/40 rounded-lg border border-amber-200 dark:border-orange-800/40">
            <div className="flex items-center gap-2"><ArrowLeft className="w-4 h-4 text-amber-600 dark:text-orange-400 transform rotate-180" /> <span className="text-sm font-semibold text-amber-700 dark:text-orange-400">Barang Keluar</span></div>
            <span className="text-lg font-bold text-amber-700 dark:text-orange-400">{stats.keluar}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
