// src/components/DataPerangkat/DataKomputer/KomputerTable.jsx
"use client";

import {
  Loader2, Network, Cpu, HardDrive, AlertTriangle,
  QrCode, Edit, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatBulanTahun, hitungSisaBulan, getStatusBadge } from "./komputerUtils";

export default function KomputerTable({
  isLoading,
  paginatedData,
  filteredData,
  userRole,
  currentPage,
  totalPages,
  startIndex,
  itemsPerPage,
  setCurrentPage,
  onEdit,
  onDelete,
  onQr,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[1300px]">
        <thead>
          <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
            <th className="p-4 font-semibold">Lokasi / Outlet</th>
            <th className="p-4 font-semibold">Hardware & S/N</th>
            <th className="p-4 font-semibold">Informasi Jaringan</th>
            <th className="p-4 font-semibold w-64">Spesifikasi Sistem</th>
            <th className="p-4 font-semibold">Vendor & Sewa</th>
            <th className="p-4 font-semibold text-center">Status & Kondisi</th>
            {userRole === "admin" && (
              <th className="p-4 font-semibold text-right">Aksi</th>
            )}
          </tr>
        </thead>

        <tbody className="text-sm divide-y divide-gray-50">
          {isLoading ? (
            <tr>
              <td colSpan="7" className="p-12 text-center text-blue-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">Memuat data...</p>
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-8 text-center text-gray-500">
                Tidak ada data komputer ditemukan.
              </td>
            </tr>
          ) : (
            paginatedData.map((comp) => {
              const sisaBulan       = hitungSisaBulan(comp.tanggalSelesai);
              const isExpiringSoon  =
                comp.status === "Sewa Berjalan" &&
                sisaBulan !== null &&
                sisaBulan <= 3 &&
                sisaBulan >= 0;
              const isExpired = comp.status === "Sewa Habis";

              let rowClass =
                "hover:bg-gray-50/80 transition-colors animate-in fade-in duration-300";
              if (isExpired)       rowClass = "bg-red-50/40 hover:bg-red-100/50 transition-colors";
              else if (isExpiringSoon) rowClass = "bg-orange-50/50 hover:bg-orange-100/50 transition-colors";

              return (
                <tr key={comp.id} className={rowClass}>
                  {/* Lokasi */}
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{comp.outlet}</p>
                    <p className="text-xs text-gray-500">ID: {comp.idOutlet}</p>
                  </td>

                  {/* Hardware */}
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{comp.produk}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">SN: {comp.sn}</p>
                  </td>

                  {/* Jaringan */}
                  <td className="p-4">
                    <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                      <Network className="w-3 h-3" /> {comp.ipAddress || "-"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      MAC: {comp.macAddress || "-"}
                    </p>
                  </td>

                  {/* Spesifikasi */}
                  <td className="p-4">
                    <p
                      className="text-xs font-semibold text-gray-800 flex items-center gap-1 mb-1 truncate"
                      title={comp.cpu}
                    >
                      <Cpu className="w-3 h-3 text-gray-400 shrink-0" />
                      {comp.cpu || "-"}
                    </p>
                    <div className="flex gap-2 text-[11px] text-gray-600 mb-1">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium border border-gray-200/50">
                        RAM: {comp.ram || "-"}
                      </span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-gray-200/50">
                        <HardDrive className="w-3 h-3" /> {comp.storage || "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate" title={comp.os}>
                      {comp.os || "OS Tidak Diketahui"}
                    </p>
                  </td>

                  {/* Vendor & Sewa */}
                  <td className="p-4">
                    <p className="font-medium text-gray-700 text-xs mb-1">{comp.penyedia}</p>
                    <div
                      className={`text-[11px] flex items-center gap-1.5 ${
                        isExpiringSoon || isExpired ? "text-gray-800 font-medium" : "text-gray-500"
                      }`}
                    >
                      {comp.tanggalMulai || comp.tanggalSelesai
                        ? `${formatBulanTahun(comp.tanggalMulai)} - ${formatBulanTahun(comp.tanggalSelesai)}`
                        : "-"}
                      {isExpiringSoon && (
                        <AlertTriangle
                          className="w-3 h-3 text-orange-500 shrink-0"
                          title="Segera Habis"
                        />
                      )}
                    </div>
                    {isExpiringSoon && (
                      <p className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-100/50 w-max px-1.5 py-0.5 rounded">
                        Sisa {sisaBulan} bln
                      </p>
                    )}
                  </td>

                  {/* Status & Kondisi */}
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusBadge(comp.status)}`}
                      >
                        {comp.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          comp.kondisi === "BAIK"
                            ? "text-green-600 bg-green-50 border-green-100"
                            : "text-orange-600 bg-orange-50 border-orange-100"
                        }`}
                      >
                        {comp.kondisi}
                      </span>
                    </div>
                  </td>

                  {/* Aksi */}
                  {userRole === "admin" && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onQr(comp)}
                          title="Cetak Label QR Code"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 my-auto mx-1" />
                        <button
                          onClick={() => onEdit(comp)}
                          title="Edit Data"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(comp.id)}
                          title="Hapus Data"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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

      {/* Paginasi */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <span className="text-sm text-gray-500 hidden sm:inline-block">
            Menampilkan{" "}
            <span className="font-bold text-gray-900">{startIndex + 1}</span>
            {" - "}
            <span className="font-bold text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>
            {" dari "}
            <span className="font-bold text-gray-900">{filteredData.length}</span> PC
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}