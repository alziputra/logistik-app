"use client";

import { useState } from "react";
import { 
  History, 
  Plus, 
  ArrowLeft, 
  Search, 
  Download,
  FileText,
  User // Pastikan ikon User di-import
} from "lucide-react";

// Terima props `user` dari komponen induk
const DashboardView = ({ transactions, setFormData, setItems, setActiveTransaction, setView, user }) => {
  // STATE UNTUK PENCARIAN
  const [searchQuery, setSearchQuery] = useState("");

  // ==============================
  // KALKULASI STATISTIK
  // ==============================
  const stats = { masuk: 0, keluar: 0, total: transactions.length };
  transactions.forEach((trx) => {
    const d = new Date(trx.tanggal);
    const today = new Date();
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      if (trx.jenisTransaksi === "Barang Masuk") stats.masuk++;
      else stats.keluar++;
    }
  });

  // ==============================
  // LOGIKA PENCARIAN (FILTER)
  // ==============================
  const filteredTransactions = transactions.filter((trx) => {
    const query = searchQuery.toLowerCase();
    
    // Pencarian mencakup No. Surat, Nama Pengirim, Nama Penerima, Jenis, dan Nama Barang
    const matchSurat = trx.nomorSurat?.toLowerCase().includes(query);
    const matchPihak = 
      trx.pengirimNama?.toLowerCase().includes(query) || 
      trx.penerimaNama?.toLowerCase().includes(query) ||
      trx.pengirimInstansi?.toLowerCase().includes(query) ||
      trx.penerimaInstansi?.toLowerCase().includes(query);
    const matchJenis = trx.jenisTransaksi?.toLowerCase().includes(query);
    
    // Cek apakah ada barang di dalam transaksi yang namanya cocok dengan pencarian
    const matchBarang = trx.items?.some((item) => 
      item.nama?.toLowerCase().includes(query)
    );

    return matchSurat || matchPihak || matchJenis || matchBarang;
  });

  // ==============================
  // EKSPOR KE EXCEL (CSV)
  // ==============================
  const exportToExcel = () => {
    // 1. Buat Header Kolom
    const headers = [
      "Tanggal", 
      "No. Surat", 
      "Jenis Transaksi", 
      "Pengirim (Nama)", 
      "Pengirim (Instansi)", 
      "Penerima (Nama)", 
      "Penerima (Instansi)", 
      "Daftar Barang & Qty"
    ];

    // 2. Susun Data Baris (Menggunakan data yang sedang difilter)
    const rows = filteredTransactions.map(trx => {
      // Gabungkan semua nama barang di transaksi ini menjadi 1 kalimat (contoh: "Laptop (2 Pcs); Mouse (5 Pcs)")
      const itemsString = trx.items
        ?.map(i => `${i.nama} (${i.kuantitas} ${i.satuan})`)
        .join("; ") || "-";

      // Array nilai untuk baris ini
      const rowData = [
        trx.tanggal,
        trx.nomorSurat,
        trx.jenisTransaksi,
        trx.pengirimNama,
        trx.pengirimInstansi,
        trx.penerimaNama,
        trx.penerimaInstansi,
        itemsString
      ];

      // Beri tanda kutip pada setiap nilai agar format rapi meski ada koma di dalam teks
      return rowData.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",");
    });

    // 3. Gabungkan Header dan Baris Data
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Proses Unduhan File
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Riwayat_Transaksi_Logistik_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER DASHBOARD DENGAN INFO USER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Logistik</h2>
        
        {/* Tampilkan profil user jika data user tersedia */}
        {user && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-800 leading-tight">{user.email}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* CARD STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <History className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Masuk (Bulan Ini)</p>
            <p className="text-2xl font-bold">{stats.masuk}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-full">
            <ArrowLeft className="w-6 h-6 text-orange-600 transform rotate-180" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Keluar (Bulan Ini)</p>
            <p className="text-2xl font-bold">{stats.keluar}</p>
          </div>
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Tabel & Fitur Pencarian */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Riwayat Transaksi</h3>
            <p className="text-sm text-gray-500 mt-1">Daftar semua surat serah terima yang telah dicetak</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-center">
            {/* Input Pencarian */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari no surat, barang, atau pihak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-sm"
              />
            </div>
            
            {/* Tombol Export Excel */}
            <button
              onClick={exportToExcel}
              disabled={filteredTransactions.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="text-sm text-gray-500 border-b border-gray-100 bg-white">
                <th className="p-4 font-semibold w-28">Tanggal</th>
                <th className="p-4 font-semibold w-48">No. Surat</th>
                <th className="p-4 font-semibold w-36">Jenis</th>
                {/* Kolom Baru: Nama Barang */}
                <th className="p-4 font-semibold min-w-[200px]">Barang Terkait</th>
                <th className="p-4 font-semibold min-w-[200px]">Pihak Terlibat</th>
                <th className="p-4 font-semibold text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-600">Belum ada transaksi.</p>
                    <p className="text-sm mt-1">Buat surat serah terima baru untuk memulai.</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-600">Transaksi tidak ditemukan</p>
                    <p className="text-sm mt-1">Tidak ada data yang cocok dengan "{searchQuery}"</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{trx.tanggal}</td>
                    <td className="p-4 font-semibold text-sm text-gray-800">{trx.nomorSurat}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          trx.jenisTransaksi === "Barang Masuk" 
                            ? "bg-green-50 text-green-700 border border-green-100" 
                            : "bg-orange-50 text-orange-700 border border-orange-100"
                        }`}
                      >
                        {trx.jenisTransaksi}
                      </span>
                    </td>
                    
                    {/* Data Kolom Nama Barang */}
                    <td className="p-4 text-sm text-gray-700">
                      {trx.items && trx.items.length > 0 ? (
                        <div className="line-clamp-2" title={trx.items.map(i => i.nama).join(", ")}>
                          {trx.items.map((i, idx) => (
                            <span key={i.id || idx}>
                              {i.nama} <span className="text-gray-400 text-xs">({i.kuantitas})</span>
                              {idx < trx.items.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    <td className="p-4 text-sm">
                      <p className="text-gray-800 font-medium">{trx.pengirimNama || "?"}</p>
                      <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3 transform rotate-180 text-gray-300" />
                        {trx.penerimaNama || "?"}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setFormData(trx);
                          setItems(trx.items || []);
                          setActiveTransaction(trx);
                          setView("preview");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors inline-block"
                      >
                        Lihat Surat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;