"use client";

import { useState } from "react";
import { 
  History, Plus, ArrowLeft, Search, Download, FileText, 
  User, Activity, BarChart3, Package, AlertTriangle, Clock, Printer, Monitor 
} from "lucide-react";

// Ditambahkan prop 'notifSewaKomputer = []'
const DashboardView = ({ view, transactions, setFormData, setItems, setActiveTransaction, setView, user, inventory = [], notifSewa = [], notifSewaKomputer = [], printers = [], computers = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ==============================
  // KALKULASI STATISTIK TRANSAKSI (SEMUA WAKTU)
  // ==============================
  const stats = { masuk: 0, keluar: 0, total: transactions.length };
  
  transactions.forEach((trx) => {
    // Normalisasi teks agar kebal terhadap salah ketik (huruf besar/kecil/spasi)
    const jenis = String(trx.jenisTransaksi).trim().toLowerCase();
    
    if (jenis === "barang masuk") {
      stats.masuk++;
    } else if (jenis === "barang keluar") {
      stats.keluar++;
    }
  });

  // ==============================
  // KALKULASI STATISTIK PRINTER
  // ==============================
  const printerStats = { inventaris: 0, berjalan: 0, habis: 0 };
  printers.forEach((p) => {
    if (p.status === "Inventaris") printerStats.inventaris++;
    else if (p.status === "Sewa Berjalan") printerStats.berjalan++;
    else if (p.status === "Sewa Habis") printerStats.habis++;
  });

  // ==============================
  // KALKULASI STATISTIK KOMPUTER
  // ==============================
  const computerStats = { inventaris: 0, berjalan: 0, habis: 0 };
  computers.forEach((c) => {
    if (c.status === "Inventaris") computerStats.inventaris++;
    else if (c.status === "Sewa Berjalan") computerStats.berjalan++;
    else if (c.status === "Sewa Habis") computerStats.habis++;
  });

  // ==============================
  // PERSIAPAN DATA GRAFIK BARANG
  // ==============================
  const chartData = [...inventory].sort((a, b) => Number(b.stok) - Number(a.stok));
  const maxStok = chartData.length > 0 ? Math.max(...chartData.map((i) => Number(i.stok))) : 1;

  // ==============================
  // LOGIKA PENCARIAN TRANSAKSI
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Dashboard Logistik</h2>
          {user && (
            <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm pr-1">
                <p className="text-gray-500 text-[10px] font-medium leading-tight uppercase tracking-wide">Admin Aktif</p>
                <p className="font-bold text-gray-800 text-xs leading-tight">{user.email}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* ROW 1: CARD STATISTIK TRANSAKSI */}
        <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider pl-1">Ringkasan Transaksi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl"><History className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Total Transaksi</p><p className="text-xl font-bold text-gray-800">{stats.total}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl"><Plus className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Total Masuk</p><p className="text-xl font-bold text-gray-800">{stats.masuk}</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl"><ArrowLeft className="w-5 h-5 text-orange-600 transform rotate-180" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Total Keluar</p><p className="text-xl font-bold text-gray-800">{stats.keluar}</p></div>
          </div>
        </div>

        {/* ROW 2: CARD STATISTIK PRINTER */}
        <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider pl-1">Status Perangkat Printer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div onClick={() => setView("perangkat_printer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-green-300 hover:shadow-md transition-all group">
            <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors"><Printer className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Berjalan</p><p className="text-xl font-bold text-gray-800">{printerStats.berjalan}</p></div>
          </div>
          <div onClick={() => setView("perangkat_printer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group">
            <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition-colors"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Habis</p><p className="text-xl font-bold text-gray-800">{printerStats.habis}</p></div>
          </div>
          <div onClick={() => setView("perangkat_printer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors"><Package className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Inventaris Gudang</p><p className="text-xl font-bold text-gray-800">{printerStats.inventaris}</p></div>
          </div>
        </div>

        {/* ROW 3: CARD STATISTIK KOMPUTER */}
        <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider pl-1">Status Perangkat Komputer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-green-300 hover:shadow-md transition-all group">
            <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors"><Monitor className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Berjalan</p><p className="text-xl font-bold text-gray-800">{computerStats.berjalan}</p></div>
          </div>
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group">
            <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition-colors"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Sewa Habis</p><p className="text-xl font-bold text-gray-800">{computerStats.habis}</p></div>
          </div>
          <div onClick={() => setView("perangkat_komputer")} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors"><Package className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500 font-medium">Inventaris Gudang</p><p className="text-xl font-bold text-gray-800">{computerStats.inventaris}</p></div>
          </div>
        </div>

        {/* AREA NOTIFIKASI MASA SEWA PRINTER */}
        {notifSewa && notifSewa.length > 0 && (
          <div className="bg-red-50/80 rounded-xl shadow-sm border border-red-100 overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-5 py-3 border-b border-red-100/50 flex justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-100 p-1.5 rounded-full animate-pulse">
                  <Printer className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-red-800">Perhatian: Masa Sewa Printer Segera Habis!</h3>
                  <p className="text-xs text-red-600 font-medium">Terdapat {notifSewa.length} perangkat printer yang memerlukan perpanjangan kontrak.</p>
                </div>
              </div>
              <button onClick={() => setView("perangkat_printer")} className="hidden sm:block text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-white/60 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-white">
                Kelola &rarr;
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-red-700 bg-red-100/30 font-medium">
                  <tr>
                    <th className="px-5 py-2.5">Outlet</th>
                    <th className="px-5 py-2.5">Hardware</th>
                    <th className="px-5 py-2.5">Serial Number</th>
                    <th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100/50">
                  {notifSewa.slice(0, 3).map((item) => ( 
                    <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-5 py-2.5 font-semibold text-red-900">{item.outlet}</td>
                      <td className="px-5 py-2.5 text-red-800">{item.produk}</td>
                      <td className="px-5 py-2.5 text-red-800 font-mono">{item.sn}</td>
                      <td className="px-5 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold text-[10px]">
                          <Clock className="w-3 h-3" />
                          {item.sisaBulan === 0 ? "< 1 bln" : `${item.sisaBulan} bln`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notifSewa.length > 3 && (
              <div className="text-center py-2 bg-red-50 text-xs text-red-600 font-medium border-t border-red-100/50 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setView("perangkat_printer")}>
                Lihat {notifSewa.length - 3} perangkat printer lainnya...
              </div>
            )}
          </div>
        )}

        {/* AREA NOTIFIKASI MASA SEWA KOMPUTER */}
        {notifSewaKomputer && notifSewaKomputer.length > 0 && (
          <div className="bg-indigo-50/80 rounded-xl shadow-sm border border-indigo-100 overflow-hidden mb-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="px-5 py-3 border-b border-indigo-100/50 flex justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-100 p-1.5 rounded-full animate-pulse">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-indigo-800">Perhatian: Masa Sewa Komputer Segera Habis!</h3>
                  <p className="text-xs text-indigo-600 font-medium">Terdapat {notifSewaKomputer.length} PC/Laptop yang memerlukan perpanjangan kontrak.</p>
                </div>
              </div>
              <button onClick={() => setView("perangkat_komputer")} className="hidden sm:block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-white">
                Kelola &rarr;
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-indigo-700 bg-indigo-100/30 font-medium">
                  <tr>
                    <th className="px-5 py-2.5">Outlet</th>
                    <th className="px-5 py-2.5">Hardware</th>
                    <th className="px-5 py-2.5">IP / Serial Number</th>
                    <th className="px-5 py-2.5 text-right">Sisa Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100/50">
                  {notifSewaKomputer.slice(0, 3).map((item) => ( 
                    <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-5 py-2.5 font-semibold text-indigo-900">{item.outlet}</td>
                      <td className="px-5 py-2.5 text-indigo-800">{item.produk}</td>
                      <td className="px-5 py-2.5 text-indigo-800 font-mono">{item.ipAddress || item.sn}</td>
                      <td className="px-5 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold text-[10px]">
                          <Clock className="w-3 h-3" />
                          {item.sisaBulan === 0 ? "< 1 bln" : `${item.sisaBulan} bln`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notifSewaKomputer.length > 3 && (
              <div className="text-center py-2 bg-indigo-50 text-xs text-indigo-600 font-medium border-t border-indigo-100/50 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setView("perangkat_komputer")}>
                Lihat {notifSewaKomputer.length - 3} perangkat komputer lainnya...
              </div>
            )}
          </div>
        )}

        {/* MAIN GRID: GRAFIK (KIRI) & AKTIVITAS (KANAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* KIRI: GRAFIK STOK */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3 shrink-0">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Visualisasi Stok Gudang</h3>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-end">
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                  <Package className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data stok.</p>
                </div>
              ) : (
                <div className="flex items-end gap-2 h-56 overflow-x-auto custom-scrollbar pb-2 pt-6 px-1">
                  {chartData.map((item) => {
                    const stokValue = Number(item.stok);
                    const heightPct = maxStok > 0 ? (stokValue / maxStok) * 100 : 0;
                    return (
                      <div key={item.id} className="flex flex-col items-center shrink-0 w-20 group h-full">
                        <div className="w-full flex-1 flex flex-col justify-end relative">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 rounded-t-md transition-all relative flex flex-col justify-end shadow-sm cursor-pointer"
                            style={{ height: `${heightPct}%`, minHeight: '4px' }}
                            title={`${item.nama} \nStok: ${stokValue} ${item.satuan || ''}`}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 bg-white/90 backdrop-blur-sm px-1.5 rounded shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              {stokValue}
                            </span>
                          </div>
                        </div>
                        <div className="h-8 mt-2 w-full flex justify-center items-start">
                          <span className="text-[10px] text-gray-500 text-center line-clamp-2 leading-tight px-1 font-medium" title={item.nama}>
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

          {/* KANAN: AKTIVITAS TERBARU */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-sm text-gray-800">Aktivitas Terakhir</h3>
              </div>
            </div>
            
            <div className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] lg:max-h-none">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Belum ada aktivitas.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {transactions.slice(0, 5).map((trx) => (
                    <div key={trx.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-gray-800 leading-none">{trx.nomorSurat}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${trx.jenisTransaksi === "Barang Masuk" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {trx.jenisTransaksi === "Barang Masuk" ? "MASUK" : "KELUAR"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{trx.tanggal}</span>
                        <span className="truncate">{trx.pengirimNama} ➔ {trx.penerimaNama}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {transactions.length > 5 && (
              <button onClick={() => setView("riwayat")} className="w-full p-3 text-xs font-bold text-blue-600 bg-gray-50 hover:bg-blue-50 transition-colors border-t border-gray-100">
                Lihat Semua Riwayat &rarr;
              </button>
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 tracking-tight">Pusat Riwayat Transaksi</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-gray-800">Daftar Log Transaksi</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                <input type="text" placeholder="Cari data..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all" />
              </div>
              <button onClick={exportToExcel} disabled={filteredTransactions.length === 0} className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4" /> Export CSV
              </button>
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
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-gray-500"><Search className="w-10 h-10 mx-auto text-gray-300 mb-3" /><p className="font-medium text-sm">Data tidak ditemukan</p></td></tr>
                ) : (
                  filteredTransactions.map((trx) => (
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
        </div>
      </div>
    );
  }

  return null;
};

export default DashboardView;