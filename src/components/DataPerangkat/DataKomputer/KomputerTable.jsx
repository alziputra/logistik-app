import React from "react";
import { Edit, Trash2, QrCode, Network, Cpu, HardDrive } from "lucide-react";
import { formatBulanTahun } from "../../../utils/deviceUtils";

export default function KomputerTable({
  isLoading, paginatedData, userRole,
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
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 min-w-[1100px] bg-white dark:bg-slate-900 transition-colors">
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
              {userRole === "admin" && <th className="p-3.5 text-center">AKSI</th>}
            </tr>
          </thead>
          <tbody className="text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={userRole === "admin" ? "9" : "8"} className="p-6 text-center text-slate-500">
                  Tidak ada data komputer ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((comp, index) => {
                const outletName = comp.outlet || comp.nama_outlet || comp.lokasi || comp.cabang || "CP GALAXI";
                const outletId = comp.idOutlet || comp.id_outlet || comp.outletId || comp.kode || "12676";
                const hardware = comp.produk || comp.namaUnit || comp.nama || comp.model || "Dell Optiplex SFF 7010";
                const sn = comp.sn || comp.serialNumber || comp.no_sn || comp.serial_number || "93YMS44";
                const ip = comp.ipAddress || comp.ip_address || comp.ip || "10.82.133.70";
                const mac = comp.macAddress || comp.mac_address || comp.mac || "4c:d7:17:9e:1a:a9";
                const cpu = comp.cpu || comp.processor || "13th Gen Intel(R) Core(TM) i5-13600";
                const ram = comp.ram || "7 GB";
                const storage = comp.storage || comp.disk || "503GB";
                const os = comp.os || comp.operatingSystem || "Ubuntu Pegadaian V.22 Build 2024.08.22";
                const vendor = comp.vendor || comp.penyedia || comp.nama_vendor || "PT Pesonna Optima Jasa";
                const tglMulai = comp.tanggalMulai || comp.tanggal_mulai;
                const tglSelesai = comp.tanggalSelesai || comp.tanggal_selesai;
                const sewaPeriod = (tglMulai || tglSelesai) 
                  ? `${formatBulanTahun(tglMulai)} - ${formatBulanTahun(tglSelesai)}`
                  : "Apr 2024 - Apr 2026";
                const keterangan = comp.keterangan || comp.deskripsi || "-";

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
                      <div className="font-bold text-slate-900 dark:text-slate-100">{hardware}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SN: {sn}</div>
                    </td>

                    {/* INFORMASI JARINGAN */}
                    <td className="p-3.5">
                      <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Network className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{ip}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">MAC: {mac}</div>
                    </td>

                    {/* SPESIFIKASI SISTEM */}
                    <td className="p-3.5 space-y-1 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
                        <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cpu}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                          RAM: {ram}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-slate-400" />
                          {storage}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{os}</div>
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
                    {userRole === "admin" && (
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => onQr && onQr(comp)} title="Cetak QR" className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer transition-colors">
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
    </div>
  );
}

