import React from "react";
import { Edit, Trash2 } from "lucide-react";

export function hitungSisaWaktu(tanggalBerakhir) {
  if (!tanggalBerakhir) return { text: "-", color: "text-slate-400" };
  const end = new Date(tanggalBerakhir);
  const now = new Date();
  if (isNaN(end.getTime())) return { text: "-", color: "text-slate-400" };

  const diffMs = end - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: "Kontrak Habis", color: "text-rose-400 font-bold" };
  } else if (diffDays <= 90) {
    return { text: `${diffDays} Hari Lagi`, color: "text-amber-400 font-bold" };
  }
  return { text: `${diffDays} Hari`, color: "text-emerald-400 font-bold" };
}

export default function SewaTable({
  paginatedData = [],
  userRole = "admin",
  startIndex = 0,
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-center">No</th>
            <th className="px-4 py-3">Nama Outlet</th>
            <th className="px-4 py-3">Kode</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-center">Tgl Mulai</th>
            <th className="px-4 py-3 text-center">Tgl Berakhir</th>
            <th className="px-4 py-3 text-center">Sisa Waktu</th>
            <th className="px-4 py-3 text-right">Harga Sewa</th>
            {userRole === "admin" && <th className="px-4 py-3 text-center">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={userRole === "admin" ? "9" : "8"} className="px-6 py-8 text-center text-slate-500 italic">
                Belum ada data sewa bangunan terdaftar.
              </td>
            </tr>
          ) : (
            paginatedData.map((item, idx) => {
              const sisa = hitungSisaWaktu(item.tgl_kontrak_berakhir);
              return (
                <tr key={item.id || idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{startIndex + idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{item.nama_outlet || item.outlet || "-"}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{item.kode_outlet || "-"}</td>
                  <td className="px-4 py-3 text-slate-300">{item.type_bangunan || item.type_outlet || "Ruko"}</td>
                  <td className="px-4 py-3 text-center text-slate-400 font-mono">{item.tgl_kontrak_mulai || "-"}</td>
                  <td className="px-4 py-3 text-center text-slate-300 font-mono">{item.tgl_kontrak_berakhir || "-"}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    <span className={sisa.color}>{sisa.text}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">
                    {item.harga_sewa ? `Rp ${Number(item.harga_sewa).toLocaleString("id-ID")}` : "-"}
                  </td>
                  {userRole === "admin" && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onEdit(item)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(item.id, item.nama_outlet || "Sewa")} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg cursor-pointer">
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
  );
}
