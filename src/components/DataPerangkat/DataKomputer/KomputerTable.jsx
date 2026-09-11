import React from "react";
import { Edit, Trash2, QrCode, Monitor, Network, Cpu, HardDrive } from "lucide-react";
import { formatBulanTahun } from "../../../utils/deviceUtils";
import Pagination from "../../Common/Pagination";

export default function KomputerTable({
  isLoading, paginatedData = [], filteredData = [], userRole,
  currentPage, totalPages, startIndex, itemsPerPage,
  setCurrentPage, onEdit, onDelete, onQr,
}) {
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Sewa Berjalan":
        return (
          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80">
            Sewa Berjalan
          </span>
        );
      case "Sewa Habis":
        return (
          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80">
            Sewa Habis
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            {status || "Status"}
          </span>
        );
    }
  };

  const renderKondisiBadge = (kondisi) => {
    const k = (kondisi || "BAIK").toUpperCase();
    if (k === "RUSAK") {
      return (
        <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          RUSAK
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        BAIK
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 min-w-275 bg-white dark:bg-slate-900 transition-colors">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="p-3.5 text-center w-12">No</th>
              <th className="p-3.5">LOKASI / OUTLET</th>
              <th className="p-3.5">HARDWARE & S/N</th>
              <th className="p-3.5">INFORMASI JARINGAN</th>
              <th className="p-3.5">SPESIFIKASI SISTEM</th>
              <th className="p-3.5">VENDOR & SEWA</th>
              <th className="p-3.5 text-center">STATUS & KONDISI</th>
              <th className="p-3.5">KETERANGAN</th>
              {(userRole === "admin" || userRole === "officer" || userRole === "user") && <th className="p-3.5 text-center">AKSI</th>}
            </tr>
          </thead>
          <tbody className="text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={(userRole === "admin" || userRole === "officer" || userRole === "user") ? "9" : "8"} className="p-6 text-center text-slate-500">
                  Tidak ada data komputer ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((comp, index) => {
                const outletName = comp.outlet || comp.nama_outlet || comp.lokasi || comp.cabang || "CP Jakarta Central";
                const outletId = comp.idOutlet || comp.id_outlet || comp.outletId || comp.kode || "12473";
                const hardware = comp.produk || comp.namaUnit || comp.nama || comp.model || "PC Desktop Core i5";
                const sn = comp.sn || comp.serialNumber || comp.no_sn || comp.serial_number || "SN-PC-2024-001";
                const ipAddress = comp.ipAddress || comp.ip_address || comp.ip || "-";
                const macAddress = comp.macAddress || comp.mac_address || comp.mac || "-";
                const processor = comp.processor || comp.cpu || "Intel Core i5";
                const ram = comp.ram || comp.memory || "8 GB";
                const storage = comp.storage || comp.harddisk || comp.ssd || "512 GB SSD";
                const os = comp.os || comp.operating_system || "Windows 11 Pro";
                const vendor = comp.vendor || comp.penyedia || comp.nama_vendor || "PT Transdata Global";
                const tglMulai = comp.tanggalMulai || comp.tanggal_mulai;
                const tglSelesai = comp.tanggalSelesai || comp.tanggal_selesai;
                const sewaPeriod = (tglMulai || tglSelesai) 
                  ? `${formatBulanTahun(tglMulai)} - ${formatBulanTahun(tglSelesai)}`
                  : "Jan 2024 - Jan 2026";
                const keterangan = comp.keterangan || comp.deskripsi || "-";

                const enrichedComp = {
                  kategori: "KOMPUTER",
                  isKomputer: true,
                  sn,
                  produk: hardware,
                  outlet: outletName,
                  idOutlet: outletId,
                  vendor,
                  tanggalMulai: tglMulai || "2024-01-10",
                  tanggalSelesai: tglSelesai || "2026-01-10",
                  status: comp.status || "Sewa Berjalan",
                  kondisi: comp.kondisi || "BAIK",
                  ipAddress,
                  macAddress,
                  processor,
                  ram,
                  storage,
                  os,
                  spkNo: comp.spkNo || comp.no_spk || "SPK/KMP/2024/001",
                  pksNo: comp.pksNo || comp.no_pks || "2503/00108.04/2024",
                  deskripsi: keterangan,
                  ...comp,
                };

                return (
                  <tr key={comp.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center font-mono text-slate-400">{startIndex + index + 1}</td>
                    
                    {/* LOKASI / OUTLET */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{outletName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {outletId}</div>
                    </td>

                    {/* HARDWARE & S/N */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{hardware}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">SN: {sn}</div>
                    </td>

                    {/* INFORMASI JARINGAN */}
                    <td className="p-3.5">
                      <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">IP: {ipAddress}</div>
                      <div className="text-[10px] font-mono text-slate-400">MAC: {macAddress}</div>
                    </td>

                    {/* SPESIFIKASI */}
                    <td className="p-3.5">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{processor} | {ram}</div>
                      <div className="text-[10px] text-slate-400">{storage} | {os}</div>
                    </td>

                    {/* VENDOR & SEWA */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{vendor}</div>
                      <div className="text-[11px] text-slate-400">{sewaPeriod}</div>
                    </td>

                    {/* STATUS & KONDISI */}
                    <td className="p-3.5 text-center space-y-1">
                      <div>{renderStatusBadge(comp.status)}</div>
                      <div>{renderKondisiBadge(comp.kondisi)}</div>
                    </td>

                    {/* KETERANGAN */}
                    <td className="p-3.5 text-slate-400">{keterangan}</td>

                    {/* AKSI */}
                    {(userRole === "admin" || userRole === "officer" || userRole === "user") && (
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => onQr && onQr(enrichedComp)} title="Cetak QR" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer transition-colors">
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button onClick={() => onEdit && onEdit(comp)} title="Edit" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete && onDelete(comp.id, comp.produk || comp.namaUnit)} title="Hapus" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length || paginatedData.length}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

