"use client";

import { useState, useRef } from "react";
import { Search, Download, Upload, FileSpreadsheet, FileText, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Papa from "papaparse";

export default function RiwayatTransaksi({ transactions, setFormData, setItems, setActiveTransaction, setView }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });
  const fileInputRef = useRef(null);
  
  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3000);
  };

  // === LOGIKA PAGINASI ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = (transactions || []).filter((trx) => {
    const query = searchQuery.toLowerCase();
    const matchSurat = trx.nomorSurat?.toLowerCase().includes(query);
    const matchPihak = 
      trx.pengirimNama?.toLowerCase().includes(query) || 
      trx.penerimaNama?.toLowerCase().includes(query) ||
      trx.pengirimInstansi?.toLowerCase().includes(query) ||
      trx.penerimaInstansi?.toLowerCase().includes(query);
    const matchJenis = trx.jenisTransaksi?.toLowerCase().includes(query);
    const matchBarang = trx.items?.some((item) => item.nama?.toLowerCase().includes(query));
    return matchSurat || matchPihak || matchJenis || matchBarang;
  });

  // Potong array berdasarkan halaman saat ini
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat user mengetik pencarian
  };

  // ── CSV EXPORT & TEMPLATE & IMPORT ─────────────────────────────────────
  const exportToCSV = () => {
    const dataToExport = filteredTransactions.map((trx) => {
      const itemsString = trx.items?.map((i) => `${i.nama} (${i.kuantitas} ${i.satuan || "Pcs"})`).join("; ") || "-";
      return {
        "Tanggal": trx.tanggal || "",
        "No. Surat": trx.nomorSurat || "",
        "Jenis Transaksi": trx.jenisTransaksi || "",
        "Pengirim (Nama)": trx.pengirimNama || "",
        "Pengirim (Instansi)": trx.pengirimInstansi || "",
        "Penerima (Nama)": trx.penerimaNama || "",
        "Penerima (Instansi)": trx.penerimaInstansi || "",
        "Daftar Barang & Qty": itemsString,
      };
    });

    const csvString = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Riwayat_Transaksi_Logistik_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotif("Riwayat transaksi berhasil diekspor ke CSV!");
  };

  const downloadTemplateCSV = () => {
    const sampleData = [
      {
        "Tanggal": new Date().toISOString().split("T")[0],
        "No. Surat": "LOG/2026/001",
        "Jenis Transaksi": "Barang Keluar",
        "Pengirim (Nama)": "Budi Santoso",
        "Pengirim (Instansi)": "Gudang Pusat",
        "Penerima (Nama)": "Siti Aminah",
        "Penerima (Instansi)": "Pegadaian CP Kebayoran Baru",
        "Daftar Barang & Qty": "Laptop Asus (2 Unit); Kertas HVS A4 (5 Rim)",
      },
      {
        "Tanggal": new Date().toISOString().split("T")[0],
        "No. Surat": "LOG/2026/002",
        "Jenis Transaksi": "Barang Masuk",
        "Pengirim (Nama)": "Vendor PT Logistik Jaya",
        "Pengirim (Instansi)": "PT Logistik Jaya",
        "Penerima (Nama)": "Budi Santoso",
        "Penerima (Instansi)": "Gudang Pusat",
        "Daftar Barang & Qty": "Tinta Printer Epson (10 Botol)",
      },
    ];

    const csvString = Papa.unparse(sampleData);
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Import_Riwayat_Transaksi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseItemsString = (str) => {
    if (!str || str === "-") return [];
    // Format yang diharapkan: "Nama (Qty Satuan); Nama2 (Qty2 Satuan2)"
    const parts = str.split(";");
    return parts.map((part, idx) => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(.*?)(?:\s*\((?:(\d+(?:\.\d+)?)\s*(.*?))\))?$/);
      if (match) {
        return {
          id: String(Date.now() + idx),
          nama: match[1].trim(),
          kuantitas: Number(match[2]) || 1,
          satuan: match[3] || "Pcs",
        };
      }
      return {
        id: String(Date.now() + idx),
        nama: trimmed,
        kuantitas: 1,
        satuan: "Pcs",
      };
    });
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          if (!rows || rows.length === 0) {
            showNotif("File CSV kosong atau format tidak sesuai.", "error");
            setIsImporting(false);
            return;
          }

          const colRef = collection(db, "artifacts", appId, "public", "data", "transactions");
          let count = 0;

          for (const row of rows) {
            const noSurat = row["No. Surat"] || row["nomorSurat"] || row["No Surat"] || "";
            if (!noSurat.trim()) continue;

            const itemsParsed = parseItemsString(row["Daftar Barang & Qty"] || row["items"] || "");

            const payload = {
              tanggal: row["Tanggal"] || row["tanggal"] || new Date().toISOString().split("T")[0],
              nomorSurat: noSurat.trim(),
              jenisTransaksi: row["Jenis Transaksi"] || row["jenisTransaksi"] || "Barang Keluar",
              pengirimNama: row["Pengirim (Nama)"] || row["pengirimNama"] || "",
              pengirimInstansi: row["Pengirim (Instansi)"] || row["pengirimInstansi"] || "",
              penerimaNama: row["Penerima (Nama)"] || row["penerimaNama"] || "",
              penerimaInstansi: row["Penerima (Instansi)"] || row["penerimaInstansi"] || "",
              items: itemsParsed,
              createdAt: new Date().toISOString(),
            };

            await addDoc(colRef, payload);
            count++;
          }

          if (count > 0) {
            showNotif(`Berhasil mengimpor ${count} riwayat transaksi baru!`);
          } else {
            showNotif("Tidak ada data transaksi valid yang diimpor.", "error");
          }
        } catch (err) {
          console.error("Gagal mengimpor CSV transaksi:", err);
          showNotif("Gagal mengimpor data CSV.", "error");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error("PapaParse error:", err);
        showNotif("Gagal membaca file CSV.", "error");
        setIsImporting(false);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300 relative">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImportCSV}
        className="hidden"
      />

      {/* Toast Notifikasi internal */}
      {notif.show && (
        <div className={`fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl shadow-xl text-white text-sm animate-in fade-in ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notif.message}
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 tracking-tight">Pusat Riwayat Transaksi</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div><h3 className="font-bold text-sm text-gray-800">Daftar Log Transaksi</h3></div>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 items-center flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Cari data..." value={searchQuery} onChange={handleSearch} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" />
            </div>

            {/* Action Bar Berbasis Ikon */}
            <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/80 shadow-xs shrink-0">
              <button
                type="button"
                onClick={downloadTemplateCSV}
                title="Unduh Template CSV"
                aria-label="Unduh Template CSV"
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                title="Impor dari CSV"
                aria-label="Impor dari CSV"
                className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={exportToCSV}
                disabled={filteredTransactions.length === 0}
                title="Ekspor ke CSV"
                aria-label="Ekspor ke CSV"
                className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px] text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-white uppercase tracking-wide">
                <th className="py-3 px-5 font-semibold w-28">Tanggal</th>
                <th className="py-3 px-5 font-semibold w-44">No. Surat</th>
                <th className="py-3 px-5 font-semibold w-32">Jenis</th>
                <th className="py-3 px-5 font-semibold min-w-[200px]">Barang Terkait</th>
                <th className="py-3 px-5 font-semibold min-w-[200px]">Pihak Terlibat</th>
                <th className="py-3 px-5 font-semibold text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500"><FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" /><p className="font-medium text-sm">Belum ada transaksi.</p></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500"><Search className="w-10 h-10 mx-auto text-gray-300 mb-3" /><p className="font-medium text-sm">Data tidak ditemukan</p></td></tr>
              ) : (
                paginatedData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-5 text-gray-600 font-medium">{trx.tanggal}</td>
                    <td className="py-3 px-5 font-bold text-gray-800">{trx.nomorSurat}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold tracking-wide border ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}>{trx.jenisTransaksi}</span>
                    </td>
                    <td className="py-3 px-5 text-gray-700">
                      {trx.items && trx.items.length > 0 ? (
                        <div className="line-clamp-2 text-xs" title={trx.items.map(i => i.nama).join(", ")}>
                          {trx.items.map((i, idx) => (
                            <span key={i.id || idx}>{i.nama} <span className="text-gray-400">({i.kuantitas})</span>{idx < trx.items.length - 1 ? ", " : ""}</span>
                          ))}
                        </div>
                      ) : <span className="text-gray-400 italic text-xs">-</span>}
                    </td>
                    <td className="py-3 px-5 text-xs">
                      <p className="text-gray-800 font-semibold truncate max-w-[200px]">{trx.pengirimNama || "?"}</p>
                      <p className="text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[200px]"><ArrowLeft className="w-3 h-3 transform rotate-180 shrink-0" />{trx.penerimaNama || "?"}</p>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button onClick={() => { setFormData(trx); setItems(trx.items || []); setActiveTransaction(trx); setView("preview"); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors inline-block whitespace-nowrap">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* UI KONTROL PAGINASI TRANSAKSI */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
            <span className="text-sm text-gray-500 hidden sm:inline-block">
              Menampilkan <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-bold text-gray-900">{filteredTransactions.length}</span> transaksi
            </span>
            <div className="flex gap-2 ml-auto">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                Hal {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}