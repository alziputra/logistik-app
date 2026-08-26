import React, { useState } from "react";
import { History, Search, FileText, ArrowLeftRight, Eye, Edit, Trash2, Package } from "lucide-react";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import Pagination from "../Common/Pagination";
import { deleteTransaksi } from "../../services/transaksiService";

export default function RiwayatTransaksi({
  transactions = [],
  setTransactions = () => {},
  setFormData = () => {},
  setItems = () => {},
  setActiveTransaction = () => {},
  setView = () => {},
  loadAllData = () => {},
  editDocument = null,
  viewDocument = null,
}) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTabFilter, setActiveTabFilter] = useState("all"); // "all" | "masuk" | "keluar"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const countAll = transactions.length;
  const countMasuk = transactions.filter(
    (t) => t.jenisTransaksi === "Barang Masuk" || t.jenisTransaksi === "Surat Masuk"
  ).length;
  const countKeluar = transactions.filter(
    (t) => t.jenisTransaksi === "Barang Keluar" || t.jenisTransaksi === "Surat Keluar"
  ).length;

  const filtered = transactions.filter((t) => {
    // 1. Tab Filter
    if (activeTabFilter === "masuk") {
      const isMasuk = t.jenisTransaksi === "Barang Masuk" || t.jenisTransaksi === "Surat Masuk";
      if (!isMasuk) return false;
    } else if (activeTabFilter === "keluar") {
      const isKeluar = t.jenisTransaksi === "Barang Keluar" || t.jenisTransaksi === "Surat Keluar";
      if (!isKeluar) return false;
    }

    // 2. Search Query Filter
    const q = search.toLowerCase();
    const itemNames = (t.items || []).map((i) => (i.namaBarang || i.nama || "").toLowerCase()).join(" ");
    return (
      t.nomorSurat?.toLowerCase().includes(q) ||
      t.penerimaNama?.toLowerCase().includes(q) ||
      t.pengirimNama?.toLowerCase().includes(q) ||
      t.tujuan?.toLowerCase().includes(q) ||
      itemNames.includes(q)
    );
  });

  const handleViewLetter = (trx) => {
    if (viewDocument) {
      viewDocument(trx);
      return;
    }
    setActiveTransaction(trx);
    setFormData({
      id: trx.id,
      nomorSurat: trx.nomorSurat,
      jenisTransaksi: trx.jenisTransaksi,
      tanggal: trx.tanggal,
      lokasi: trx.lokasi || "Jakarta",
      tujuan: trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || "",
      pihak1Nama: trx.pengirimNama || trx.pihak1Nama || "",
      pihak1Jabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pihakMengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      pihakMengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      pihak2Nama: trx.penerimaNama || trx.pihak2Nama || "",
      pihak2Jabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
    });
    setItems(
      (trx.items || []).map((item, idx) => ({
        id: item.id || idx + 1,
        namaBarang: item.namaBarang || item.nama || "",
        nama: item.nama || item.namaBarang || "",
        jumlah: Number(item.jumlah || item.kuantitas || 1),
        kuantitas: Number(item.kuantitas || item.jumlah || 1),
        satuan: item.satuan || "Unit",
        sn: item.sn || "",
        outlet: item.outlet || trx.tujuan || "",
        keterangan: item.keterangan || "",
      }))
    );
    setView("preview");
  };

  const handleEditLetter = (trx) => {
    if (editDocument) {
      editDocument(trx);
      return;
    }
    setActiveTransaction(trx);
    setFormData({
      id: trx.id,
      nomorSurat: trx.nomorSurat,
      jenisTransaksi: trx.jenisTransaksi,
      tanggal: trx.tanggal,
      lokasi: trx.lokasi || "Jakarta",
      tujuan: trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || "",
      pihak1Nama: trx.pengirimNama || trx.pihak1Nama || "",
      pihak1Jabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pihakMengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      pihakMengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      pihak2Nama: trx.penerimaNama || trx.pihak2Nama || "",
      pihak2Jabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
    });
    setItems(
      (trx.items || []).map((item, idx) => ({
        id: item.id || idx + 1,
        namaBarang: item.namaBarang || item.nama || "",
        nama: item.nama || item.namaBarang || "",
        jumlah: Number(item.jumlah || item.kuantitas || 1),
        kuantitas: Number(item.kuantitas || item.jumlah || 1),
        satuan: item.satuan || "Unit",
        sn: item.sn || "",
        outlet: item.outlet || trx.tujuan || "",
        keterangan: item.keterangan || "",
      }))
    );
    setView("form");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.id) {
        await deleteTransaksi(deleteTarget.id);
      }
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus surat transaksi:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const exportDataFormatted = filtered.map((t) => ({
    ...t,
    rincianBarangStr: (t.items || [])
      .map((it) => `${it.namaBarang || it.nama || "Barang"} (${it.jumlah || it.kuantitas || 1} ${it.satuan || "Unit"})`)
      .join(", "),
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <History className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Riwayat Transaksi</h2>
            <p className="text-xs text-slate-400">Daftar Berita Acara Serah Terima Barang.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor / nama barang..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>
          <ExcelActionButtons
            data={exportDataFormatted}
            fileName="Riwayat_Transaksi_Logistik"
            headersMap={{
              nomorSurat: "Nomor Surat",
              tanggal: "Tanggal",
              jenisTransaksi: "Jenis Transaksi",
              pengirimNama: "Pengirim",
              penerimaNama: "Penerima",
              rincianBarangStr: "Rincian Barang",
              lokasi: "Lokasi",
            }}
            showImport={false}
          />
        </div>
      </div>

      {/* Tab Filter (Semua, Surat Masuk, Surat Keluar) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTabFilter("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "all"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Semua Surat</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTabFilter === "all" ? "bg-emerald-700/80 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {countAll}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter("masuk")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "masuk"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Surat Masuk (Barang Masuk)</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTabFilter === "masuk" ? "bg-emerald-700/80 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {countMasuk}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter("keluar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "keluar"
              ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Surat Keluar (Barang Keluar)</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTabFilter === "keluar" ? "bg-amber-700/80 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            {countKeluar}
          </span>
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No</th>
                <th className="px-5 py-4">Nomor Surat</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Pengirim ➔ Penerima</th>
                <th className="px-5 py-4">Rincian Barang</th>
                <th className="px-5 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">
                    {activeTabFilter === "masuk"
                      ? "Belum ada riwayat surat masuk ditemukan."
                      : activeTabFilter === "keluar"
                      ? "Belum ada riwayat surat keluar ditemukan."
                      : "Belum ada riwayat transaksi ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((trx, idx) => (
                    <tr key={trx.id || idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 text-center text-slate-400 font-mono">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-slate-100 font-mono">{trx.nomorSurat}</td>
                      <td className="px-5 py-4 text-slate-300">{trx.tanggal}</td>
                      <td className="px-5 py-4 text-slate-300">
                        {trx.pengirimNama || trx.pihak1Nama || "-"} ➔ {trx.penerimaNama || trx.pihak2Nama || trx.tujuan || "-"}
                      </td>
                      
                      {/* Rincian Nama Barang & Kuantitas/Satuan */}
                      <td className="px-5 py-4">
                        {trx.items && trx.items.length > 0 ? (
                          <div className="space-y-1">
                            {trx.items.map((it, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="font-semibold text-slate-100">{it.namaBarang || it.nama || "Barang"}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                                  {it.jumlah || it.kuantitas || 1} {it.satuan || "Unit"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs">- Tidak ada rincian -</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Lihat / Preview Surat (Icon Only) */}
                          <button
                            type="button"
                            onClick={() => handleViewLetter(trx)}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Lihat / Cetak Surat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Surat (Icon Only) */}
                          <button
                            type="button"
                            onClick={() => handleEditLetter(trx)}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Edit Surat"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Hapus Surat (Icon Only -> Membuka ConfirmDeleteModal) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(trx)}
                            className="p-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
          totalItems={filtered.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Global Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berita Acara Transaksi?"
        message={`Apakah Anda yakin ingin menghapus surat transaksi nomor "${deleteTarget?.nomorSurat || ""}"? Data yang dihapus tidak dapat dikembalikan.`}
      />
    </div>
  );
}
