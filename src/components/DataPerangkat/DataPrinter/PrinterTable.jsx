// src/components/DataPerangkat/DataPrinter/PrinterTable.jsx
"use client";

import {
  Loader2, AlertTriangle, QrCode, Edit, Trash2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { formatBulanTahun, hitungSisaBulan, getStatusBadge } from "./printerUtils";

export default function PrinterTable({
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
      <table className="w-full text-left min-w-[1100px]">
        <thead>
          <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
            <th className="p-4 font-semibold">Outlet</th>
            <th className="p-4 font-semibold">Hardware & S/N</th>
            <th className="p-4 font-semibold">Penyedia</th>
            <th className="p-4 font-semibold">Masa Sewa</th>
            <th className="p-4 font-semibold text-center">Status & Kondisi</th>
            {userRole === "admin" && (
              <th className="p-4 font-semibold text-right">Aksi</th>
            )}
          </tr>
        </thead>

        <tbody className="text-sm divide-y divide-gray-50">
          {isLoading ? (
            <tr>
              <td colSpan="6" className="p-12 text-center text-blue-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-500">Memuat data...</p>
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                Tidak ada data printer ditemukan.
              </td>
            </tr>
          ) : (
            paginatedData.map((printer) => {
              const sisaBulan      = hitungSisaBulan(printer.tanggalSelesai);
              const isExpiringSoon =
                printer.status === "Sewa Berjalan" &&
                sisaBulan !== null &&
                sisaBulan <= 3 &&
                sisaBulan >= 0;
              const isExpired = printer.status === "Sewa Habis";

              let rowClass =
                "hover:bg-gray-50/80 transition-colors animate-in fade-in duration-300";
              if (isExpired)
                rowClass = "bg-red-50/40 hover:bg-red-100/50 transition-colors animate-in fade-in duration-300";
              else if (isExpiringSoon)
                rowClass = "bg-orange-50/50 hover:bg-orange-100/50 transition-colors animate-in fade-in duration-300";

              return (
                <tr key={printer.id} className={rowClass}>
                  {/* Outlet */}
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{printer.outlet}</p>
                    <p className="text-xs text-gray-500">ID: {printer.idOutlet}</p>
                  </td>

                  {/* Hardware */}
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{printer.produk}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">SN: {printer.sn}</p>
                  </td>

                  {/* Penyedia */}
                  <td className="p-4 font-medium text-gray-700">{printer.penyedia}</td>

                  {/* Masa Sewa */}
                  <td className="p-4 text-xs">
                    <div
                      className={`flex items-center gap-1.5 ${
                        isExpiringSoon || isExpired ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {printer.tanggalMulai || printer.tanggalSelesai ? (
                        `${formatBulanTahun(printer.tanggalMulai)} - ${formatBulanTahun(printer.tanggalSelesai)}`
                      ) : (
                        <span className="italic text-gray-400">Tidak ada data</span>
                      )}
                      {isExpiringSoon && (
                        <AlertTriangle
                          className="w-3.5 h-3.5 text-orange-500"
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
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusBadge(printer.status)}`}
                      >
                        {printer.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          printer.kondisi === "BAIK"
                            ? "text-green-600 bg-green-50 border-green-100"
                            : "text-orange-600 bg-orange-50 border-orange-100"
                        }`}
                      >
                        {printer.kondisi}
                      </span>
                    </div>
                  </td>

                  {/* Aksi */}
                  {userRole === "admin" && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onQr(printer)}
                          title="Cetak Label QR Code"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 my-auto mx-1" />
                        <button
                          onClick={() => onEdit(printer)}
                          title="Edit Data"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(printer.id)}
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
            <span className="font-bold text-gray-900">{filteredData.length}</span> printer
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