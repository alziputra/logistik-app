import React from "react";
import { Bell } from "lucide-react";
import { hitungSisaBulan, hitungSisaHari } from "../../utils/deviceUtils";

export default function NotificationBell({
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView,
  isMobile = false,
  showLabel = true,
}) {
  const safePrinters = Array.isArray(printers) ? printers : [];
  const safeComputers = Array.isArray(computers) ? computers : [];
  const safeBuildingLands = Array.isArray(buildingLands) ? buildingLands : [];
  const safeBuildingSewas = Array.isArray(buildingSewas) ? buildingSewas : [];

  const printerCount = safePrinters
    .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
    .map((p) => hitungSisaBulan(p.tanggalSelesai))
    .filter((m) => m !== null && m <= 3).length;

  const computerCount = safeComputers
    .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
    .map((c) => hitungSisaBulan(c.tanggalSelesai))
    .filter((m) => m !== null && m <= 3).length;

  const landCount = safeBuildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => hitungSisaHari(item.tgl_berakhir_shgb))
    .filter((d) => d !== null && d <= 30).length;

  const sewaCount = safeBuildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done" && item.status !== "Selesai")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      return hitungSisaHari(tglAkhir);
    })
    .filter((d) => d !== null && d <= 30).length;

  const totalCount = printerCount + computerCount + landCount + sewaCount;

  return (
    <div className="relative">
      <button
        onClick={() => setView && setView("notifikasi")}
        className="relative px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm"
        title="Notifikasi Peringatan"
      >
        <div className="relative flex items-center justify-center">
          <Bell className={isMobile ? "w-5 h-5" : "w-4 h-4 text-slate-500 dark:text-slate-400"} />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
              {totalCount}
            </span>
          )}
        </div>
        {showLabel && !isMobile && <span>Notifikasi</span>}
      </button>
    </div>
  );
}
