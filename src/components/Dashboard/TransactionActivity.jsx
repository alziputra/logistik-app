import React from "react";
import { History, ArrowUpRight, ArrowDownLeft, FileText, ChevronRight, Building2, Package, PlusCircle } from "lucide-react";

export default function TransactionActivity({ transactions = [], setView, startNewDocument }) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const defaultTransactions = [
    {
      id: "demo-1",
      nomorSurat: "453/00108.00/04/2026",
      tanggal: "2026-07-20",
      pengirimNama: "Ahmad Dendy Syaputra",
      penerimaNama: "jua",
      tujuan: "Logistik Kanwil VIII",
      jenisTransaksi: "Barang Masuk",
      items: [{ namaBarang: "Monitor LED Dell 24 Inch", jumlah: 5 }],
    },
  ];

  const displayTransactions = safeTransactions.length > 0 ? safeTransactions : defaultTransactions;

  let totalMasuk = 0;
  let totalKeluar = 0;
  safeTransactions.forEach((trx) => {
    const j = String(trx.jenisTransaksi || "").toLowerCase();
    if (j.includes("masuk")) totalMasuk++;
    else if (j.includes("keluar")) totalKeluar++;
  });

  const formatDateStr = (raw) => {
    if (!raw) return "-";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return raw;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden mb-6">
      {/* Header Panel */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Aktivitas Transaksi BAST Terbaru</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">Terverifikasi</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Rekam jejak penerimaan barang masuk dan serah terima pengeluaran barang terkini.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (setView) {
              localStorage.setItem("riwayat_active_tab", "serah_terima");
              setView("riwayat");
            }
          }}
          className="text-xs font-bold text-[#00753A] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <span>Lihat Semua Riwayat</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transaction Feed Items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {displayTransactions.slice(0, 5).map((trx) => {
          const isMasuk = String(trx.jenisTransaksi || "")
            .toLowerCase()
            .includes("masuk");
          const totalPcs = Array.isArray(trx.items) ? trx.items.reduce((sum, itm) => sum + Number(itm.kuantitas || itm.jumlah || 1), 0) : Number(trx.jumlah || trx.kuantitas || 1);

          const instansiStr = trx.tujuan || trx.outletTujuan || trx.asalOutlet || trx.penerimaInstansi || "Logistik Kanwil";

          return (
            <div key={trx.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Direction Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                    isMasuk ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {isMasuk ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isMasuk ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {trx.jenisTransaksi || (isMasuk ? "Barang Masuk" : "Barang Keluar")}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{trx.nomorSurat || "Draft"}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">{instansiStr}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Penerima: <strong className="text-slate-700 dark:text-slate-300">{trx.penerimaNama || trx.pihak2Nama || "-"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Date & Total Items */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 font-mono">{formatDateStr(trx.tanggal || trx.created_at || trx.createdAt)}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{totalPcs} Unit Barang</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Quick Action */}
      <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <span>
            Total: <strong className="text-rose-600 dark:text-rose-400">{totalKeluar} Keluar</strong>
          </span>
          <span>•</span>
          <span>
            <strong className="text-emerald-600 dark:text-emerald-400">{totalMasuk} Masuk</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof startNewDocument === "function") startNewDocument("Barang Keluar");
            if (setView) setView("form");
          }}
          className="text-[#00753A] dark:text-emerald-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Buat Surat Transaksi Baru</span>
        </button>
      </div>
    </div>
  );
}
