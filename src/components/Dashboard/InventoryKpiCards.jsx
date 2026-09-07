import React from "react";
import { Package, ArrowUpRight, ArrowDownLeft, Laptop, ChevronRight, Boxes, CheckCircle2, AlertTriangle } from "lucide-react";

export default function InventoryKpiCards({ inventory = [], transactions = [], computers = [], laptops = [], printers = [], notifSewa = [], notifSewaKomputer = [], setView }) {
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeComputers = Array.isArray(computers) ? computers : [];
  const safeLaptops = Array.isArray(laptops) ? laptops : [];
  const safePrinters = Array.isArray(printers) ? printers : [];

  // 1. Kalkulasi Stok Gudang
  const totalPhysicalStock = safeInventory.reduce((acc, itm) => {
    const qty = Number(itm.kuantitas !== undefined ? itm.kuantitas : itm.stok || 0);
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0);
  const totalSku = safeInventory.length;

  // 2. Kalkulasi Transaksi Keluar & Masuk
  let totalKeluar = 0;
  let totalMasuk = 0;
  let pcsKeluar = 0;
  let pcsMasuk = 0;

  safeTransactions.forEach((t) => {
    const jenis = String(t.jenisTransaksi || "").toLowerCase();
    const isMasuk = jenis.includes("masuk");
    const isKeluar = jenis.includes("keluar");

    const itemsCount = Array.isArray(t.items) ? t.items.reduce((sum, i) => sum + Number(i.kuantitas || i.jumlah || 1), 0) : Number(t.jumlah || t.kuantitas || 1);

    if (isMasuk) {
      totalMasuk++;
      pcsMasuk += isNaN(itemsCount) ? 0 : itemsCount;
    } else if (isKeluar) {
      totalKeluar++;
      pcsKeluar += isNaN(itemsCount) ? 0 : itemsCount;
    }
  });

  // 3. Kalkulasi Perangkat TI
  const totalPerangkatTI = safeComputers.length + safeLaptops.length + safePrinters.length;
  const totalWarningTI = (notifSewa?.length || 0) + (notifSewaKomputer?.length || 0);
  const totalActiveTI = Math.max(0, totalPerangkatTI - totalWarningTI);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI Card 1: Total Stok Gudang */}
      <div
        onClick={() => setView && setView("master_barang")}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stok Master Barang</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{totalPhysicalStock.toLocaleString("id-ID")}</h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Unit</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            <strong className="text-slate-700 dark:text-slate-200">{totalSku}</strong> Jenis SKU Aktif
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
            Kelola <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* KPI Card 2: Surat Barang Keluar */}
      <div
        onClick={() => {
          if (setView) {
            localStorage.setItem("riwayat_active_tab", "serah_terima");
            setView("riwayat");
          }
        }}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-500/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Surat Barang Keluar</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{totalKeluar}</h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Surat BAST</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Total <strong className="text-slate-700 dark:text-slate-200">{pcsKeluar}</strong> Unit Terdistribusi
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
            Riwayat <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* KPI Card 3: Surat Barang Masuk */}
      <div
        onClick={() => {
          if (setView) {
            localStorage.setItem("riwayat_active_tab", "serah_terima");
            setView("riwayat");
          }
        }}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Surat Barang Masuk</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{totalMasuk}</h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Penerimaan</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Total <strong className="text-slate-700 dark:text-slate-200">{pcsMasuk}</strong> Unit Masuk
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
            Riwayat <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* KPI Card 4: Total Perangkat TI */}
      <div
        onClick={() => setView && setView("perangkat_komputer")}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Perangkat TI Terdata</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalPerangkatTI}</h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {totalActiveTI}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="inline-flex items-center gap-0.5 text-rose-500 font-semibold">
              <AlertTriangle className="w-3 h-3" /> {totalWarningTI} Exp
            </span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
            Detail <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
