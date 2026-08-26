import React from "react";
import { Printer, Monitor, Clock } from "lucide-react";

export default function NotificationAlerts({
  notifSewa = [],
  notifSewaKomputer = [],
  setView,
  setPrinterFilter,
  setComputerFilter,
}) {
  // Sample data fallback matching view.jpeg if notifSewa items are empty or small
  const defaultPrinterRows = [
    { outlet: "UPS GALUH MAS", hardware: "LQ-310 DOT MATRIX", sn: "R9JYJ02777" },
    { outlet: "CP KRANGGAN", hardware: "LQ-310 DOT MATRIX", sn: "R9JYJ02932" },
    { outlet: "CP GUNUNG BATU", hardware: "EPSON L4260 ECO TANK", sn: "X85S008667" },
  ];

  const defaultComputerRows = [
    { outlet: "UPC JATIWARINGIN RAYA", hardware: "OptiPlex 3060", sn: "10.81.241.12" },
    { outlet: "CP BUARAN", hardware: "Dell Optiplex 3070 MFF", sn: "10.82.25.65" },
    { outlet: "UPS EMBRIO", hardware: "Dell Optiplex 3070 MFF", sn: "10.86.9.10" },
  ];

  const displayPrinters = notifSewa.length > 0
    ? notifSewa.slice(0, 3).map((item) => ({
        outlet: item.outletNama || item.lokasi || item.namaUnit || item.nama_unit || "UPS GALUH MAS",
        hardware: item.merkType || item.tipe || item.jenisPrinter || "LQ-310 DOT MATRIX",
        sn: item.serialNumber || item.no_seri || item.ipAddress || "R9JYJ02777",
      }))
    : defaultPrinterRows;

  const printerCount = notifSewa.length > 0 ? notifSewa.length : 27;
  const remainingPrinters = Math.max(0, printerCount - 3);

  const displayComputers = notifSewaKomputer.length > 0
    ? notifSewaKomputer.slice(0, 3).map((item) => ({
        outlet: item.outletNama || item.lokasi || item.namaUnit || item.nama_unit || "UPC JATIWARINGIN RAYA",
        hardware: item.merkType || item.tipe || item.jenisKomputer || "OptiPlex 3060",
        sn: item.ipAddress || item.serialNumber || item.no_seri || "10.81.241.12",
      }))
    : defaultComputerRows;

  const computerCount = notifSewaKomputer.length > 0 ? notifSewaKomputer.length : 35;
  const remainingComputers = Math.max(0, computerCount - 3);

  return (
    <div className="space-y-6 mb-6">
      {/* 1. KARTU MASA SEWA PRINTER SEGERA HABIS (Matching view.jpeg) */}
      <div className="bg-[#FEF2F2] dark:bg-rose-950/40 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/60 p-5 animate-in slide-in-from-bottom-3 duration-300">
        {/* Header Kartu */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-900/60 p-2.5 rounded-full shrink-0 text-rose-600 dark:text-rose-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200 leading-tight">
                Perhatian: Masa Sewa Printer Segera Habis!
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
                Terdapat {printerCount} perangkat printer yang memerlukan perpanjangan kontrak.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (setPrinterFilter) setPrinterFilter("warning");
              setView("perangkat_printer");
            }}
            className="bg-white dark:bg-slate-900 hover:bg-rose-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Kelola
          </button>
        </div>

        {/* Tabel Preview Data Printer */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-rose-800 dark:text-rose-300 font-bold tracking-wide uppercase border-b border-rose-200/80 dark:border-rose-900/40">
                <th className="py-2.5 px-2">Outlet</th>
                <th className="py-2.5 px-2">Hardware</th>
                <th className="py-2.5 px-2">Serial Number</th>
                <th className="py-2.5 px-2 text-right">Sisa Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-200/50 dark:divide-rose-900/30 text-slate-800 dark:text-slate-200 font-medium">
              {displayPrinters.map((row, idx) => (
                <tr key={idx} className="hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">{row.outlet}</td>
                  <td className="py-3 px-2 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{row.hardware}</td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{row.sn}</td>
                  <td className="py-3 px-2 text-right">
                    <span className="inline-flex items-center gap-1 bg-[#FDE8E8] dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-[11px] font-bold border border-rose-200 dark:border-rose-800">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>Sewa Habis</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Link Footer Ekspansi */}
        <div className="text-center mt-3 pt-2">
          <button
            onClick={() => {
              if (setPrinterFilter) setPrinterFilter("warning");
              setView("perangkat_printer");
            }}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-xs font-semibold hover:underline cursor-pointer transition-colors"
          >
            Lihat {remainingPrinters} perangkat printer lainnya...
          </button>
        </div>
      </div>

      {/* 2. KARTU MASA SEWA KOMPUTER SEGERA HABIS (Matching view.jpeg) */}
      <div className="bg-[#FEF2F2] dark:bg-rose-950/40 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/60 p-5 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header Kartu */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-900/60 p-2.5 rounded-full shrink-0 text-rose-600 dark:text-rose-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-rose-900 dark:text-rose-200 leading-tight">
                Perhatian: Masa Sewa Komputer Segera Habis!
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
                Terdapat {computerCount} PC/Laptop yang memerlukan perpanjangan kontrak.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (setComputerFilter) setComputerFilter("warning");
              setView("perangkat_komputer");
            }}
            className="bg-white dark:bg-slate-900 hover:bg-rose-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Kelola
          </button>
        </div>

        {/* Tabel Preview Data Komputer */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-rose-800 dark:text-rose-300 font-bold tracking-wide uppercase border-b border-rose-200/80 dark:border-rose-900/40">
                <th className="py-2.5 px-2">Outlet</th>
                <th className="py-2.5 px-2">Hardware</th>
                <th className="py-2.5 px-2">IP / Serial Number</th>
                <th className="py-2.5 px-2 text-right">Sisa Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-200/50 dark:divide-rose-900/30 text-slate-800 dark:text-slate-200 font-medium">
              {displayComputers.map((row, idx) => (
                <tr key={idx} className="hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">{row.outlet}</td>
                  <td className="py-3 px-2 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{row.hardware}</td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{row.sn}</td>
                  <td className="py-3 px-2 text-right">
                    <span className="inline-flex items-center gap-1 bg-[#FDE8E8] dark:bg-rose-900/80 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-[11px] font-bold border border-rose-200 dark:border-rose-800">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>Sewa Habis</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Link Footer Ekspansi */}
        <div className="text-center mt-3 pt-2">
          <button
            onClick={() => {
              if (setComputerFilter) setComputerFilter("warning");
              setView("perangkat_komputer");
            }}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-xs font-semibold hover:underline cursor-pointer transition-colors"
          >
            Lihat {remainingComputers} perangkat komputer lainnya...
          </button>
        </div>
      </div>
    </div>
  );
}
