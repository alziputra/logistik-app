"use client";

import { useState } from "react";
import { 
  Database, 
  Plus, 
  Box, 
  Hash, 
  Scale, 
  PackageOpen,
  Building2,
  CalendarDays,
  Clock,
  Search // Tambahkan icon Search
} from "lucide-react";

export default function AdminView({ inventory, handleAddInventory }) {
  // STATE UNTUK PENCARIAN
  const [searchQuery, setSearchQuery] = useState("");

  // Helper untuk memformat tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // FUNGSI: Menghitung selisih bulan secara otomatis
  const calculateMonths = () => {
    const form = document.getElementById("formAdmin");
    if (!form) return;

    const start = form.tanggal_mulai.value;
    const end = form.tanggal_selesai.value;

    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      
      if (months > 0) {
        form.masa_sewa_bulan.value = months;
      } else {
        form.masa_sewa_bulan.value = 0;
      }
    }
  };

  // FILTERING LOGIC: Menyaring data inventory berdasarkan pencarian
  const filteredInventory = inventory.filter((inv) => {
    const query = searchQuery.toLowerCase();
    return (
      inv.nama?.toLowerCase().includes(query) ||
      inv.vendor_nama?.toLowerCase().includes(query) ||
      inv.no_spk?.toLowerCase().includes(query) ||
      inv.no_pks?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-8">
      
      {/* BAGIAN ATAS: Form Tambah Barang */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">Tambah Master Barang</h3>
            <p className="text-sm text-gray-500 mt-1">Lengkapi form di bawah untuk mendaftarkan aset atau barang baru ke dalam sistem.</p>
          </div>
        </div>

        <form id="formAdmin" onSubmit={handleAddInventory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Baris 1: Info Utama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input 
                name="nama" 
                required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                placeholder="Contoh: Laptop Lenovo ThinkPad" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
              <input 
                name="stok" 
                type="number" 
                defaultValue="0" 
                min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan</label>
              <select 
                name="satuan" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800"
              >
                <option value="Pcs">Pcs</option>
                <option value="Unit">Unit</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
            </div>

            {/* Baris 2: Info Vendor & SPK */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Vendor (Jika Ada)</label>
              <input 
                name="vendor_nama" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                placeholder="PT Era Permata Sejahtera" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No. SPK</label>
              <input 
                name="no_spk" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                placeholder="2363/..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No. PKS</label>
              <input 
                name="no_pks" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                placeholder="2364/..." 
              />
            </div>

            {/* Baris 3: Tanggal & Sewa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Mulai Sewa</label>
              <input 
                name="tanggal_mulai" 
                type="date"
                onChange={calculateMonths}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Selesai Sewa</label>
              <input 
                name="tanggal_selesai" 
                type="date"
                onChange={calculateMonths}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa Sewa (Bulan)</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input 
                  name="masa_sewa_bulan" 
                  type="number"
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                  placeholder="Terisi Otomatis..." 
                />
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Simpan Data
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* BAGIAN BAWAH: Tabel Master Barang */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* HEADER TABEL DENGAN KOLOM PENCARIAN */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="shrink-0">
            <h3 className="font-bold text-lg text-gray-800">Ketersediaan Stok</h3>
            <p className="text-sm text-gray-500 mt-1">Daftar semua master barang yang terdaftar di sistem</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-center">
            {/* Input Pencarian */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari barang, vendor, atau SPK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>
            
            {/* Badge Total Item */}
            <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold border border-blue-100 whitespace-nowrap w-full sm:w-auto text-center shrink-0">
              Total: {filteredInventory.length} Item
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-500 text-sm whitespace-nowrap">
                <th className="pb-4 font-semibold w-12 text-center">No</th>
                <th className="pb-4 font-semibold min-w-[200px]">
                  <div className="flex items-center gap-2"><Box className="w-4 h-4 text-gray-400"/> Nama Barang</div>
                </th>
                <th className="pb-4 font-semibold w-24">
                  <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-400"/> Stok</div>
                </th>
                <th className="pb-4 font-semibold w-24">
                  <div className="flex items-center gap-2"><Scale className="w-4 h-4 text-gray-400"/> Satuan</div>
                </th>
                <th className="pb-4 font-semibold min-w-[250px]">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400"/> Vendor & Kontrak</div>
                </th>
                <th className="pb-4 font-semibold w-32">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-400"/> Tgl Mulai</div>
                </th>
                <th className="pb-4 font-semibold w-32">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-400"/> Tgl Selesai</div>
                </th>
                <th className="pb-4 font-semibold w-28 text-center">
                  <div className="flex items-center justify-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Durasi</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <PackageOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-600">Belum ada master barang.</p>
                    <p className="text-sm mt-1">Silakan tambah barang melalui form di atas.</p>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                // Tampilan jika pencarian tidak membuahkan hasil
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-600">Pencarian tidak ditemukan</p>
                    <p className="text-sm mt-1">Tidak ada data yang cocok dengan "{searchQuery}"</p>
                  </td>
                </tr>
              ) : (
                // Mapping menggunakan 'filteredInventory' bukan 'inventory' lagi
                filteredInventory.map((inv, index) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 text-center text-gray-400 text-sm">{index + 1}</td>
                    <td className="py-4 font-medium text-gray-800">{inv.nama}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.stok <= 5 
                          ? 'bg-red-50 text-red-600 border border-red-100' 
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {inv.stok}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-sm">{inv.satuan}</td>
                    
                    <td className="py-4 text-sm">
                      {inv.vendor_nama ? (
                        <div>
                          <p className="font-medium text-blue-700">{inv.vendor_nama}</p>
                          <p className="text-xs text-gray-500 mt-0.5">SPK: {inv.no_spk || '-'} | PKS: {inv.no_pks || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    
                    <td className="py-4 text-sm font-medium text-gray-800">
                      {inv.tanggal_mulai ? formatDate(inv.tanggal_mulai) : <span className="text-gray-400 font-normal">-</span>}
                    </td>

                    <td className="py-4 text-sm font-medium text-gray-800">
                      {inv.tanggal_selesai ? formatDate(inv.tanggal_selesai) : <span className="text-gray-400 font-normal">-</span>}
                    </td>

                    <td className="py-4 text-sm text-center">
                      {inv.masa_sewa_bulan ? (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100">
                          {inv.masa_sewa_bulan} Bln
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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