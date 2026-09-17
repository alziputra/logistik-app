import React from "react";
import { Edit, Trash2, QrCode, Monitor, Network, Cpu, HardDrive, Building2 } from "lucide-react";
import { formatBulanTahun } from "../../../utils/deviceUtils";
import Pagination from "../../Common/Pagination";

export default function KomputerTable({
  isLoading, paginatedData = [], filteredData = [], userRole,
  currentPage, totalPages, startIndex, itemsPerPage,
  setCurrentPage, onEdit, onDelete, onQr, inventoryList = [], inventory = [],
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
        <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 min-w-[1500px] bg-white dark:bg-slate-900 transition-colors">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="p-3.5 text-center w-12">No</th>
              <th className="p-3.5">OUTLET & USER</th>
              <th className="p-3.5">HARDWARE & IDENTITAS</th>
              <th className="p-3.5">JARINGAN (IP & MAC)</th>
              <th className="p-3.5">SPESIFIKASI (CPU / RAM / DISK)</th>
              <th className="p-3.5">SISTEM OPERASI</th>
              <th className="p-3.5">SPK</th>
              <th className="p-3.5">PENYEDIA / VENDOR</th>
              <th className="p-3.5">AWAL SEWA</th>
              <th className="p-3.5">AKHIR SEWA</th>
              <th className="p-3.5 text-center">STATUS & KONDISI</th>
              <th className="p-3.5">UPDATE TERAKHIR</th>
              {(userRole === "admin" || userRole === "officer" || userRole === "user") && <th className="p-3.5 text-center">AKSI</th>}
            </tr>
          </thead>
          <tbody className="text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={(userRole === "admin" || userRole === "officer" || userRole === "user") ? "13" : "12"} className="p-6 text-center text-slate-500">
                  Tidak ada data komputer ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((comp, index) => {
                const outletName = comp.outlet || comp.nama_outlet || comp.lokasi || "CP BEKASI TIMUR";
                const outletId = comp.idOutlet || comp.id_outlet || comp.kode || comp.id || "-";
                const username = comp.username || comp.user || "-";
                const hardware = comp.produk || comp.namaUnit || comp.nama || "Dell Pro Slim QCS1250";
                const hostname = comp.hostname || comp.host || "-";
                const sn = comp.sn || comp.serialNumber || comp.no_sn || "-";
                const spk = comp.no_spk || comp.spk || comp.spkNo || "-";
                const matchedInv = (inventoryList || inventory || []).find(
                  (inv) => (inv.nama && hardware && inv.nama.toLowerCase() === hardware.toLowerCase()) ||
                           (inv.no_spk && spk && spk !== "-" && inv.no_spk.toLowerCase() === spk.toLowerCase())
                );
                const fallbackVendor = matchedInv?.vendor_nama || (typeof matchedInv?.vendor === "string" ? matchedInv.vendor : matchedInv?.vendor?.nama) || "-";
                const vendor = comp.penyedia || comp.vendor || comp.nama_vendor || comp.vendorNama || (fallbackVendor !== "-" ? fallbackVendor : "-");
                const ipAddress = comp.ipAddress || comp.ip_address || comp.ip || "-";
                const macAddress = comp.macAddress || comp.mac_address || comp.mac || "-";
                const cpu = comp.cpu || comp.processor || "Intel Core i5";
                const ram = comp.ram || comp.memory || "8 GB";
                const storage = comp.storage || comp.harddisk || comp.ssd || "-";
                const os = comp.os || comp.osName || comp.operating_system || "Ubuntu";
                const osVersion = comp.osVersion || comp.os_version || "";
                const tglMulai = comp.tanggalMulai || comp.tanggal_mulai || "-";
                const tglSelesai = comp.tanggalSelesai || comp.tanggal_selesai || "-";
                const lastUpdate = comp.lastUpdate || comp.last_update || comp.tanggalUpdate || "-";
                const timeUpdate = comp.timeUpdate || comp.time_update || comp.jamUpdate || "";

                const enrichedComp = {
                  kategori: "KOMPUTER",
                  isKomputer: true,
                  idOutlet: outletId,
                  outlet: outletName,
                  username,
                  hostname,
                  produk: hardware,
                  sn,
                  no_spk: spk,
                  vendor,
                  penyedia: vendor,
                  tanggalMulai: tglMulai,
                  tanggalSelesai: tglSelesai,
                  ipAddress,
                  macAddress,
                  ram,
                  cpu,
                  storage,
                  os,
                  osVersion,
                  lastUpdate,
                  timeUpdate,
                  status: comp.status || "Sewa Berjalan",
                  kondisi: comp.kondisi || "BAIK",
                  ...comp,
                };

                return (
                  <tr key={comp.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center font-mono text-slate-400">{startIndex + index + 1}</td>
                    
                    {/* OUTLET & USER */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{outletName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          ID: {outletId}
                        </span>
                        {username !== "-" && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            @{username}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* HARDWARE & IDENTITAS */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[200px]" title={hardware}>{hardware}</span>
                      </div>
                      {hostname !== "-" && (
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono truncate max-w-[220px]" title={hostname}>
                          Host: {hostname}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono">SN: {sn}</div>
                    </td>

                    {/* JARINGAN (IP & MAC) */}
                    <td className="p-3.5">
                      <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">IP: {ipAddress}</div>
                      <div className="text-[10px] font-mono text-slate-400">MAC: {macAddress}</div>
                    </td>

                    {/* SPESIFIKASI (CPU / RAM / DISK) */}
                    <td className="p-3.5">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={cpu}>
                        {cpu}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="text-blue-500 font-semibold">{ram}</span> | <span>{storage}</span>
                      </div>
                    </td>

                    {/* SISTEM OPERASI */}
                    <td className="p-3.5">
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={os}>
                        {os}
                      </div>
                      {osVersion && (
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-300 dark:border-slate-700">
                          v{osVersion}
                        </span>
                      )}
                    </td>

                    {/* SPK */}
                    <td className="p-3.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {spk !== "-" ? spk : <span className="text-slate-400">-</span>}
                    </td>

                    {/* PENYEDIA / VENDOR */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[200px]" title={vendor}>
                        {vendor !== "-" ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{vendor}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </div>
                    </td>

                    {/* AWAL SEWA */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tglMulai}
                    </td>

                    {/* AKHIR SEWA */}
                    <td className="p-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {tglSelesai}
                    </td>

                    {/* STATUS & KONDISI */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        {renderStatusBadge(comp.status)}
                        {renderKondisiBadge(comp.kondisi)}
                      </div>
                    </td>

                    {/* UPDATE TERAKHIR */}
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300">{lastUpdate}</div>
                      {timeUpdate && <div className="text-[10px] text-slate-400">{timeUpdate}</div>}
                    </td>

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

