import React from "react";
import { Edit, Trash2, QrCode, Laptop, User, Shield } from "lucide-react";
import Pagination from "../../Common/Pagination";
import { formatBulanTahun } from "../../../utils/deviceUtils";

export default function LaptopTable({
  isLoading, paginatedData = [], userRole,
  currentPage, totalPages, startIndex, itemsPerPage,
  setCurrentPage, onEdit, onDelete, onQr, filteredData = []
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
            {status || "Inventaris"}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 min-w-[1050px] bg-white dark:bg-slate-900 transition-colors">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="p-3.5 text-center w-12">No</th>
              <th className="p-3.5">PENGGUNA & JABATAN</th>
              <th className="p-3.5">HOSTNAME & S/N</th>
              <th className="p-3.5">DEPARTEMEN</th>
              <th className="p-3.5">OS & VENDOR</th>
              <th className="p-3.5">SEWA & STATUS</th>
              {userRole === "admin" && <th className="p-3.5 text-center">AKSI</th>}
            </tr>
          </thead>
          <tbody className="text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={userRole === "admin" ? "7" : "6"} className="p-6 text-center text-slate-500">
                  Tidak ada data laptop ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((laptop, index) => {
                const nik = laptop.nik || "-";
                const nama = laptop.nama || laptop.namaPengguna || "Pengguna Pegadaian";
                const jabatan = laptop.jabatan || laptop.namaJabatan || "-";
                const departemen = laptop.departemen || "Departemen Logistik & Umum";
                const hostname = laptop.hostname || laptop.deviceName || "-";
                const sn = laptop.sn || laptop.serialNumber || "-";
                const os = laptop.os || "Windows";
                const vendor = laptop.vendor || laptop.penyedia || "PT GLOBAL SOLUSINDO KOMPUDATA";
                
                const tglMulai = laptop.tanggalMulai || laptop.tanggal_mulai;
                const tglSelesai = laptop.tanggalSelesai || laptop.tanggal_selesai;
                const sewaPeriod = (tglMulai || tglSelesai) 
                  ? `${formatBulanTahun(tglMulai)} - ${formatBulanTahun(tglSelesai)}`
                  : "Jan 2024 - Jan 2026";

                const enrichedLaptop = {
                  kategori: "LAPTOP",
                  isPrinter: false,
                  nik,
                  nama,
                  jabatan,
                  departemen,
                  hostname,
                  sn,
                  produk: `Laptop ${hostname}`,
                  os,
                  vendor,
                  tanggalMulai: tglMulai || "2024-01-01",
                  tanggalSelesai: tglSelesai || "2026-01-01",
                  status: laptop.status || "Sewa Berjalan",
                  kondisi: laptop.kondisi || "BAIK",
                  outlet: departemen,
                  spkNo: laptop.spkNo || "SPK/LTP/2024/001",
                  pksNo: laptop.pksNo || "2503/00108.04/2024",
                  ...laptop,
                };

                return (
                  <tr key={laptop.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center font-mono text-slate-400">{startIndex + index + 1}</td>
                    
                    {/* PENGGUNA & JABATAN */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                        <span>{nama}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        NIK: {nik} • {jabatan}
                      </div>
                    </td>

                    {/* HOSTNAME & S/N */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono">{hostname}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">SN: {sn}</div>
                    </td>

                    {/* DEPARTEMEN */}
                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {departemen}
                      </span>
                    </td>

                    {/* OS & VENDOR */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{vendor}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">OS: {os}</div>
                    </td>

                    {/* SEWA & STATUS */}
                    <td className="p-3.5 space-y-1">
                      <div>{renderStatusBadge(laptop.status)}</div>
                      <div className="text-[11px] text-slate-400">{sewaPeriod}</div>
                    </td>

                    {/* AKSI */}
                    {userRole === "admin" && (
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => onQr && onQr(enrichedLaptop)} title="Cetak QR Code" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer transition-colors">
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button onClick={() => onEdit && onEdit(laptop)} title="Edit Laptop" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-lg cursor-pointer transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete && onDelete(laptop.id, laptop.nama || laptop.hostname)} title="Hapus Laptop" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer transition-colors">
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
