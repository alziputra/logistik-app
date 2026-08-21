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
        className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-transparent flex items-center justify-center cursor-pointer"
        title="Notifikasi Peringatan"
      >
        <Bell className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {totalCount}
          </span>
        )}
      </button>
    </div>
  );
}
