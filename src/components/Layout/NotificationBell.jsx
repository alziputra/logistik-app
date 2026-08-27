import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  Printer,
  Monitor,
  MapPin,
  Building2,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
  Search,
} from "lucide-react";
import { hitungSisaBulan, hitungSisaHari, formatBulanTahun } from "../../utils/deviceUtils";

export default function NotificationBell({
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  setView,
  setPrinterSearch,
  setComputerSearch,
  setLandSearch,
  setSewaSearch,
  setPrinterFilter,
  setComputerFilter,
  setLandFilter,
  setSewaFilter,
  isMobile = false,
  showLabel = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const safePrinters = Array.isArray(printers) ? printers : [];
  const safeComputers = Array.isArray(computers) ? computers : [];
  const safeBuildingLands = Array.isArray(buildingLands) ? buildingLands : [];
  const safeBuildingSewas = Array.isArray(buildingSewas) ? buildingSewas : [];

  // Filter 1: Printers expiring within 3 months
  const printerNotifications = safePrinters
    .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
    .map((p) => {
      const sisaBulan = hitungSisaBulan(p.tanggalSelesai);
      return {
        id: `printer-${p.id || p.sn || Math.random()}`,
        type: "printer",
        category: "Printer",
        icon: Printer,
        title: p.produk || p.nama || "Perangkat Printer",
        subtitle: `Outlet: ${p.outlet || p.nama_outlet || "-"} • SN: ${p.sn || "-"}`,
        vendor: p.penyedia || p.vendor || "-",
        dueDate: p.tanggalSelesai,
        sisaBulan,
        isUrgent: sisaBulan !== null && sisaBulan <= 1,
        targetView: "perangkat_printer",
        sn: p.sn || "",
        produk: p.produk || p.nama || "",
        outlet: p.outlet || p.nama_outlet || "",
        detail: sisaBulan <= 0 ? "Sewa Segera Habis / Berakhir Bulan Ini" : `Sisa masa sewa ${sisaBulan} bulan lagi`,
      };
    })
    .filter((p) => p.sisaBulan !== null && p.sisaBulan <= 3);

  // Filter 2: Computers expiring within 3 months
  const computerNotifications = safeComputers
    .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
    .map((c) => {
      const sisaBulan = hitungSisaBulan(c.tanggalSelesai);
      return {
        id: `computer-${c.id || c.sn || Math.random()}`,
        type: "komputer",
        category: "Komputer",
        icon: Monitor,
        title: c.produk || c.hostname || "Perangkat Komputer",
        subtitle: `Outlet: ${c.outlet || c.nama_outlet || "-"} • SN: ${c.sn || "-"}`,
        vendor: c.penyedia || c.vendor || "-",
        dueDate: c.tanggalSelesai,
        sisaBulan,
        isUrgent: sisaBulan !== null && sisaBulan <= 1,
        targetView: "perangkat_komputer",
        sn: c.sn || "",
        hostname: c.hostname || "",
        produk: c.produk || "",
        outlet: c.outlet || c.nama_outlet || "",
        detail: sisaBulan <= 0 ? "Sewa Segera Habis / Berakhir Bulan Ini" : `Sisa masa sewa ${sisaBulan} bulan lagi`,
      };
    })
    .filter((c) => c.sisaBulan !== null && c.sisaBulan <= 3);

  // Filter 3: Land SHGB expiring within 30 days
  const landNotifications = safeBuildingLands
    .filter((item) => item.tgl_berakhir_shgb && item.status !== "Done")
    .map((item) => {
      const sisaHari = hitungSisaHari(item.tgl_berakhir_shgb);
      return {
        id: `land-${item.id || item.no_sertifikat || Math.random()}`,
        type: "tanah",
        category: "Aset Tanah",
        icon: MapPin,
        title: item.nama_aset || `SHGB No. ${item.no_sertifikat || item.no_shgb || "-"}` || "Aset Tanah",
        subtitle: `Lokasi: ${item.lokasi || item.alamat || item.kota || "-"} • No: ${item.no_sertifikat || item.no_shgb || "-"}`,
        vendor: item.kantor_pertanahan || "-",
        dueDate: item.tgl_berakhir_shgb,
        sisaHari,
        isUrgent: sisaHari !== null && sisaHari <= 7,
        targetView: "bangunan_tanah",
        no_sertifikat: item.no_sertifikat || "",
        no_shgb: item.no_shgb || "",
        unit_kerja: item.unit_kerja || "",
        nama_aset: item.nama_aset || "",
        detail: sisaHari <= 0 ? "SHGB Telah Jatuh Tempo" : `Sisa masa berlaku SHGB ${sisaHari} hari lagi`,
      };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  // Filter 4: Building Rentals expiring within 30 days
  const sewaNotifications = safeBuildingSewas
    .filter((item) => (item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir) && item.status !== "Done" && item.status !== "Selesai")
    .map((item) => {
      const tglAkhir = item.tgl_kontrak_berakhir || item.tanggal_kontrak_berakhir;
      const sisaHari = hitungSisaHari(tglAkhir);
      return {
        id: `sewa-${item.id || item.nama_gedung || Math.random()}`,
        type: "sewa",
        category: "Sewa Gedung",
        icon: Building2,
        title: item.nama_gedung || item.nama_outlet || item.outlet || "Sewa Bangunan",
        subtitle: `Pemilik: ${item.pemilik || item.vendor || "-"} • Lokasi: ${item.lokasi || item.alamat || "-"}`,
        vendor: item.pemilik || item.vendor || "-",
        dueDate: tglAkhir,
        sisaHari,
        isUrgent: sisaHari !== null && sisaHari <= 7,
        targetView: "bangunan_sewa",
        nama_outlet: item.nama_outlet || item.outlet || "",
        kode_outlet: item.kode_outlet || "",
        nama_gedung: item.nama_gedung || "",
        detail: sisaHari <= 0 ? "Kontrak Sewa Telah Jatuh Tempo" : `Sisa masa kontrak sewa ${sisaHari} hari lagi`,
      };
    })
    .filter((item) => item.sisaHari !== null && item.sisaHari <= 30);

  const allNotifications = [
    ...printerNotifications,
    ...computerNotifications,
    ...landNotifications,
    ...sewaNotifications,
  ];

  const totalCount = allNotifications.length;

  const filteredNotifications =
    activeTab === "all"
      ? allNotifications
      : activeTab === "printer"
      ? printerNotifications
      : activeTab === "komputer"
      ? computerNotifications
      : activeTab === "tanah"
      ? landNotifications
      : sewaNotifications;

  // DIRECT NAVIGATION HANDLER WITH AUTO-FILTER SEARCH
  const handleItemClick = (item) => {
    const { targetView, type } = item;

    if (type === "printer") {
      // Prioritize Serial Number for precise match, then product name or outlet
      const searchVal = item.sn || item.produk || item.outlet || "";
      if (setPrinterSearch) setPrinterSearch(searchVal);
      if (setPrinterFilter) setPrinterFilter("Semua");
    } else if (type === "komputer") {
      const searchVal = item.sn || item.hostname || item.produk || item.outlet || "";
      if (setComputerSearch) setComputerSearch(searchVal);
      if (setComputerFilter) setComputerFilter("Semua");
    } else if (type === "tanah") {
      const searchVal = item.no_sertifikat || item.no_shgb || item.unit_kerja || item.nama_aset || "";
      if (setLandSearch) setLandSearch(searchVal);
      if (setLandFilter) setLandFilter("");
    } else if (type === "sewa") {
      const searchVal = item.nama_outlet || item.kode_outlet || item.nama_gedung || "";
      if (setSewaSearch) setSewaSearch(searchVal);
      if (setSewaFilter) setSewaFilter("");
    }

    if (setView && targetView) {
      setView(targetView);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-2 cursor-pointer text-xs font-semibold shadow-sm ${
          isOpen ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20" : "bg-white dark:bg-slate-900"
        }`}
        title="Notifikasi Peringatan Sistem"
      >
        <div className="relative flex items-center justify-center">
          <Bell className={isMobile ? "w-5 h-5" : "w-4 h-4 text-slate-500 dark:text-slate-400"} />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </div>
        {showLabel && !isMobile && <span>Notifikasi</span>}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown / Pop-Up Window */}
      {isOpen && (
        <div
          className={`
            fixed md:absolute z-50
            top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-2
            md:w-[440px] max-w-md
            bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
            rounded-3xl shadow-2xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          `}
        >
          {/* Header Pop-Up */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-500/10 dark:bg-rose-950/60 p-2 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Notifikasi Sistem
                  </h3>
                  {totalCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white shadow-xs">
                      {totalCount} Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Klik item untuk langsung membuka & menyaring data
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
              title="Tutup Pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-3 pt-3 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto custom-scrollbar text-[11px]">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("printer")}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "printer"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Printer ({printerNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab("komputer")}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "komputer"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Komputer ({computerNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab("tanah")}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "tanah"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Tanah ({landNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab("sewa")}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "sewa"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Sewa ({sewaNotifications.length})
            </button>
          </div>

          {/* List of Notification Items */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tidak Ada Peringatan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto">
                  Semua masa sewa perangkat dan kontrak aset dalam kondisi aman.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3.5 hover:bg-emerald-50/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-start gap-3 group relative"
                  >
                    {/* Category Icon */}
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 border transition-transform group-hover:scale-105 ${
                        item.isUrgent
                          ? "bg-rose-500/10 dark:bg-rose-950/50 border-rose-500/20 text-rose-600 dark:text-rose-400"
                          : "bg-amber-500/10 dark:bg-amber-950/50 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 border ${
                            item.isUrgent
                              ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
                              : "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50"
                          }`}
                        >
                          {item.type === "tanah" || item.type === "sewa"
                            ? `${item.sisaHari <= 0 ? "Habis" : `${item.sisaHari} Hari`}`
                            : `${item.sisaBulan <= 0 ? "Habis" : `${item.sisaBulan} Bln`}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Jatuh Tempo: {formatBulanTahun(item.dueDate) || item.dueDate}</span>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/40">
                          <Search className="w-2.5 h-2.5" /> Buka & Saring <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Pop-Up */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Total <strong>{totalCount}</strong> item perlu tindakan
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
