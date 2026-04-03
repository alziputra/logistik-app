"use client";

import { useState } from "react";
import { 
  History, Plus, ArrowLeft, Search, Download, FileText, 
  User, Activity, BarChart3, Package 
} from "lucide-react";

// Menerima prop 'inventory'
const DashboardView = ({ view, transactions, setFormData, setItems, setActiveTransaction, setView, user, inventory = [] }) => {
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
  // PERSIAPAN DATA GRAFIK BARANG
  // ==============================
  // PERBAIKAN: Gunakan Number() untuk memastikan stok dibaca sebagai angka, bukan teks
  const chartData = [...inventory].sort((a, b) => Number(b.stok) - Number(a.stok));
  
  // Mencari nilai stok tertinggi untuk menghitung persentase tinggi balok grafik
  const maxStok = chartData.length > 0 ? Math.max(...chartData.map((i) => Number(i.stok))) : 1;

  // ==============================
  // LOGIKA PENCARIAN
  // ==============================
  const filteredTransactions = transactions.filter((trx) => {
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

  const exportToExcel = () => {
    const headers = ["Tanggal", "No. Surat", "Jenis Transaksi", "Pengirim (Nama)", "Pengirim (Instansi)", "Penerima (Nama)", "Penerima (Instansi)", "Daftar Barang & Qty"];
    const rows = filteredTransactions.map(trx => {
      const itemsString = trx.items?.map(i => `${i.nama} (${i.kuantitas} ${i.satuan})`).join("; ") || "-";
      const rowData = [trx.tanggal, trx.nomorSurat, trx.jenisTransaksi, trx.pengirimNama, trx.pengirimInstansi, trx.penerimaNama, trx.penerimaInstansi, itemsString];
      return rowData.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Riwayat_Transaksi_Logistik_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================================
  // RENDER 1: MODE DASHBOARD MURNI (HANYA INFORMASI)
  // ==========================================================
  if (view === "dashboard") {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Logistik</h2>
          {user && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 text-xs font-medium leading-tight">Admin Aktif:</p>
                <p className="font-bold text-gray-800 leading-tight">{user.email}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* CARD STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full"><History className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Transaksi</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full"><Plus className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Masuk (Bulan Ini)</p><p className="text-2xl font-bold">{stats.masuk}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full"><ArrowLeft className="w-6 h-6 text-orange-600 transform rotate-180" /></div>
            <div><p className="text-sm text-gray-500">Keluar (Bulan Ini)</p><p className="text-2xl font-bold">{stats.keluar}</p></div>
          </div>
        </div>

        {/* ======================= */}
        {/* GRAFIK STOK BARANG */}
        {/* ======================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Stok Barang</h3>
              <p className="text-sm text-gray-500">Grafik keseluruhan ketersediaan barang di gudang saat ini</p>
            </div>
          </div>
          
          <div className="p-6">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mb-3" />
                <p>Belum ada data stok barang.</p>
              </div>
            ) : (
              // Kontainer utama grafik
              <div className="flex items-end gap-3 h-72 overflow-x-auto custom-scrollbar pb-2 pt-8 px-2">
                {chartData.map((item) => {
                  const stokValue = Number(item.stok);
                  const heightPct = maxStok > 0 ? (stokValue / maxStok) * 100 : 0;
                  
                  return (
                    // PERBAIKAN: Menambahkan 'h-full' agar wadah mengambil tinggi maksimal
                    <div key={item.id} className="flex flex-col items-center shrink-0 w-24 group h-full">
                      
                      {/* Area khusus untuk batang grafik, menggunakan flex-1 agar memenuhi ruang */}
                      <div className="w-full flex-1 flex flex-col justify-end relative">
                        {/* Batang Grafik */}
                        <div 
                          className="w-full bg-purple-500 hover:bg-purple-400 rounded-t-md transition-all relative flex flex-col justify-end shadow-sm cursor-pointer"
                          style={{ height: `${heightPct}%`, minHeight: '4px' }}
                          title={`${item.nama} \nStok: ${stokValue} ${item.satuan || ''}`}
                        >
                          {/* Label Angka Stok di atas batang */}
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-1.5 rounded border border-gray-100">
                            {stokValue}
                          </span>
                        </div>
                      </div>

                      {/* Label Nama Barang dengan area tinggi tetap (h-10) di bawah */}
                      <div className="h-10 mt-3 w-full flex justify-center items-start">
                        <span className="text-[11px] text-gray-600 text-center line-clamp-2 leading-tight px-1 font-medium" title={item.nama}>
                          {item.nama}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* INFO TAMBAHAN: AKTIVITAS TERBARU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-800">5 Transaksi Terakhir</h3>
          </div>
          <div className="p-0">
            {transactions.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Belum ada aktivitas transaksi.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.slice(0, 5).map((trx) => (
                  <div key={trx.id} className="p-4 px-6 hover:bg-gray-50 flex justify-between items-center transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">{trx.nomorSurat}</p>
                      <p className="text-sm text-gray-500">{trx.tanggal} • {trx.pengirimNama} ➔ {trx.penerimaNama}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {trx.jenisTransaksi}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER 2: MODE RIWAYAT TRANSAKSI (TABEL & PENCARIAN)
  // ==========================================================
  if (view === "riwayat") {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pusat Riwayat Transaksi</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Data Transaksi</h3>
              <p className="text-sm text-gray-500 mt-1">Gunakan kotak pencarian untuk mencari riwayat secara spesifik.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-center">
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                <input type="text" placeholder="Cari no surat, barang, pihak..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-sm" />
              </div>
              <button onClick={exportToExcel} disabled={filteredTransactions.length === 0} className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100 bg-white">
                  <th className="p-4 font-semibold w-28">Tanggal</th>
                  <th className="p-4 font-semibold w-48">No. Surat</th>
                  <th className="p-4 font-semibold w-36">Jenis</th>
                  <th className="p-4 font-semibold min-w-[200px]">Barang Terkait</th>
                  <th className="p-4 font-semibold min-w-[200px]">Pihak Terlibat</th>
                  <th className="p-4 font-semibold text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="6" className="py-16 text-center text-gray-500"><FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="font-medium text-gray-600">Belum ada transaksi.</p></td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan="6" className="py-16 text-center text-gray-500"><Search className="w-12 h-12 mx-auto text-gray-300 mb-4" /><p className="font-medium text-gray-600">Transaksi tidak ditemukan</p></td></tr>
                ) : (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{trx.tanggal}</td>
                      <td className="p-4 font-semibold text-sm text-gray-800">{trx.nomorSurat}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-50 text-green-700 border border-green-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>{trx.jenisTransaksi}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {trx.items && trx.items.length > 0 ? (
                          <div className="line-clamp-2" title={trx.items.map(i => i.nama).join(", ")}>
                            {trx.items.map((i, idx) => (
                              <span key={i.id || idx}>{i.nama} <span className="text-gray-400 text-xs">({i.kuantitas})</span>{idx < trx.items.length - 1 ? ", " : ""}</span>
                            ))}
                          </div>
                        ) : <span className="text-gray-400 italic">-</span>}
                      </td>
                      <td className="p-4 text-sm">
                        <p className="text-gray-800 font-medium">{trx.pengirimNama || "?"}</p>
                        <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><ArrowLeft className="w-3 h-3 transform rotate-180 text-gray-300" />{trx.penerimaNama || "?"}</p>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setFormData(trx); setItems(trx.items || []); setActiveTransaction(trx); setView("preview"); }} className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors inline-block">
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
  }

  return null;
};

export default DashboardView;