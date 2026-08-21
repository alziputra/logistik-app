import React from "react";
import { Printer, Monitor } from "lucide-react";

export default function NotificationAlerts({ notifSewa = [], notifSewaKomputer = [], setView, setPrinterFilter, setComputerFilter }) {
  return (
    <>
      {notifSewa && notifSewa.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/60 rounded-xl shadow-sm border border-rose-200 dark:border-rose-800/40 overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-5 py-3 border-b border-rose-200 dark:border-rose-800/40 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-100 dark:bg-rose-900/60 p-1.5 rounded-full animate-pulse">
                <Printer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300">Perhatian: Masa Sewa Printer Segera Habis!</h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Terdapat {notifSewa.length} perangkat printer yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (setPrinterFilter) setPrinterFilter("warning");
                setView("perangkat_printer");
              }}
              className="hidden sm:block text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white transition-colors bg-rose-100 dark:bg-rose-900/40 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800/50 cursor-pointer"
            >
              Kelola &rarr;
            </button>
          </div>
        </div>
      )}

      {notifSewaKomputer && notifSewaKomputer.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/60 rounded-xl shadow-sm border border-rose-200 dark:border-rose-800/40 overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-5 py-3 border-b border-rose-200 dark:border-rose-800/40 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-100 dark:bg-rose-900/60 p-1.5 rounded-full animate-pulse">
                <Monitor className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300">Perhatian: Masa Sewa Komputer Segera Habis!</h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Terdapat {notifSewaKomputer.length} PC/Laptop yang memerlukan perpanjangan kontrak.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (setComputerFilter) setComputerFilter("warning");
                setView("perangkat_komputer");
              }}
              className="hidden sm:block text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white transition-colors bg-rose-100 dark:bg-rose-900/40 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800/50 cursor-pointer"
            >
              Kelola &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
