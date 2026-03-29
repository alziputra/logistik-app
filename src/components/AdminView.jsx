"use client";

import { 
  Database, 
  Plus, 
  Box, 
  Hash, 
  Scale, 
  PackageOpen 
} from "lucide-react";

export default function AdminView({ inventory, handleAddInventory }) {
  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Kolom Kiri: Form Tambah Barang */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">Tambah Master</h3>
          </div>

          <form onSubmit={handleAddInventory} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Barang
              </label>
              <input 
                name="nama" 
                required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-800 placeholder-gray-400" 
                placeholder="Contoh: Laptop Lenovo ThinkPad" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stok Awal
                </label>
                <input 
                  name="stok" 
                  type="number" 
                  defaultValue="0" 
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-800" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Satuan
                </label>
                <select 
                  name="satuan" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-800"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Unit">Unit</option>
                  <option value="Box">Box</option>
                  <option value="Set">Set</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Simpan Barang
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Tabel Master Barang */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Ketersediaan Stok</h3>
              <p className="text-sm text-gray-500 mt-1">Daftar semua master barang yang terdaftar di sistem</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-100 whitespace-nowrap">
              Total: {inventory.length} Item
            </div>
          </div>

          <div className="overflow-x-auto flex-1 p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 text-sm">
                  <th className="pb-4 font-semibold w-12 text-center">No</th>
                  <th className="pb-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-gray-400"/> Nama Barang
                    </div>
                  </th>
                  <th className="pb-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400"/> Stok
                    </div>
                  </th>
                  <th className="pb-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-400"/> Satuan
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-gray-500">
                      <PackageOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="font-medium text-gray-600">Belum ada master barang.</p>
                      <p className="text-sm mt-1">Silakan tambah barang melalui form di sebelah kiri.</p>
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv, index) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}