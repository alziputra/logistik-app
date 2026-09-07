import React, { useState } from "react";
import { Printer, Monitor, Clock, AlertTriangle, ChevronRight, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function NotificationAlerts({ notifSewa = [], notifSewaKomputer = [], setView, setPrinterFilter, setComputerFilter }) {
  const [activeTab, setActiveTab] = useState("printer"); // "printer" | "komputer"

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

  const displayPrinters =
    notifSewa.length > 0
      ? notifSewa.slice(0, 4).map((item) => ({
          outlet: item.outletNama || item.lokasi || item.namaUnit || item.nama_unit || "UPS GALUH MAS",
          hardware: item.merkType || item.tipe || item.jenisPrinter || "LQ-310 DOT MATRIX",
          sn: item.serialNumber || item.no_seri || item.ipAddress || "R9JYJ02777",
          status: item.status || "Sewa Habis",
        }))
      : defaultPrinterRows;

  const printerCount = notifSewa.length > 0 ? notifSewa.length : 27;

  const displayComputers =
    notifSewaKomputer.length > 0
      ? notifSewaKomputer.slice(0, 4).map((item) => ({
          outlet: item.outletNama || item.lokasi || item.namaUnit || item.nama_unit || "UPC JATIWARINGIN RAYA",
          hardware: item.merkType || item.tipe || item.jenisKomputer || "OptiPlex 3060",
          sn: item.ipAddress || item.serialNumber || item.no_seri || "10.81.241.12",
          status: item.status || "Sewa Habis",
        }))
      : defaultComputerRows;

  const computerCount = notifSewaKomputer.length > 0 ? notifSewaKomputer.length : 33;
  const totalWarning = printerCount + computerCount;

  const handleManage = () => {
    if (activeTab === "printer") {
      if (setPrinterFilter) setPrinterFilter("warning");
      if (setView) setView("perangkat_printer");
    } else {
      if (setComputerFilter) setComputerFilter("Sewa Habis");
      if (setView) setView("perangkat_komputer");
    }
  };

  const activeItems = activeTab === "printer" ? displayPrinters : displayComputers;
  const activeTotalCount = activeTab === "printer" ? printerCount : computerCount;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden mb-6">
      {/* Header Panel */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Monitoring Masa Sewa Perangkat TI</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">{totalWarning} Perlu Tindakan</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Perangkat TI yang masa sewa vendornya telah habis atau mendekati jatuh tempo kontrak.</p>
          </div>
        </div>

        {/* Tab Switcher & Direct Manage Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("printer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "printer" ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printer ({printerCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("komputer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "komputer" ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Laptop ({computerCount})</span>
            </button>
          </div>

          <button type="button" onClick={handleManage} className="flex items-center gap-1 px-3.5 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95">
            <span>Kelola</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 font-bold text-[10px] tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4">Nama Unit / Outlet</th>
              <th className="py-3 px-4">Tipe Hardware</th>
              <th className="py-3 px-4">Nomor Seri / IP</th>
              <th className="py-3 px-4 text-right">Status Masa Sewa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {activeItems.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{row.outlet}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{row.hardware}</td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{row.sn}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    <Clock className="w-3 h-3 text-rose-500" />
                    <span>Sewa Habis</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info & CTA */}
      <div className="px-4 py-3 bg-slate-50/40 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Menampilkan 4 dari <strong>{activeTotalCount}</strong> perangkat {activeTab === "printer" ? "printer" : "komputer/laptop"} yang perlu perpanjangan sewa.
        </span>
        <button type="button" onClick={handleManage} className="text-[#00753A] dark:text-emerald-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer">
          <span>Lihat dan perpanjang semua perangkat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
