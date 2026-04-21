"use client";

import { useState } from "react";
import { Database, Plus, Box, Hash, Scale, Building2, CalendarDays, Clock, Search, MapPin, X } from "lucide-react";

export default function Barang({ activeMenu, inventory, handleAddInventory, outlets, handleAddOutlet, userRole }) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOutletQuery, setSearchOutletQuery] = useState("");
  const [calculatedStatus, setCalculatedStatus] = useState("Inventaris");

  const [isBarangModalOpen, setIsBarangModalOpen] = useState(false);
  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateFormLogic = () => {
    const form = document.getElementById("formAdmin");
    if (!form) return;

    const start = form.tanggal_mulai?.value;
    const end = form.tanggal_selesai?.value;

    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      if (form.masa_sewa_bulan) {
        form.masa_sewa_bulan.value = months > 0 ? months : 0;
      }
    }

    if (start && end) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const endDate = new Date(end);
      
      if (endDate >= today) {
        setCalculatedStatus("Sewa Berjalan");
      } else {
        setCalculatedStatus("Sewa Habis");
      }
    } else {
      setCalculatedStatus("Inventaris");
    }
  };

  const getStatusInfo = (inv) => {
    if (inv.status) return inv.status;
    if (!inv.tanggal_mulai || !inv.tanggal_selesai) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(inv.tanggal_selesai);
    return end >= today ? "Sewa Berjalan" : "Sewa Habis";
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Inventaris": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
      case "Sewa Habis": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredInventory = inventory.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const statusInfo = getStatusInfo(inv).toLowerCase();
    return inv.nama?.toLowerCase().includes(q) || 
           inv.vendor_nama?.toLowerCase().includes(q) || 
           inv.no_spk?.toLowerCase().includes(q) ||
           statusInfo.includes(q); 
  });

  const filteredOutlets = (outlets || []).filter((out) => {
    const q = searchOutletQuery.toLowerCase();
    return out.nama?.toLowerCase().includes(q) || out.kode?.toLowerCase().includes(q);
  });

  const onSubmitBarang = async (e) => {
    await handleAddInventory(e);
    setIsBarangModalOpen(false);
  };

  const onSubmitOutlet = async (e) => {
    await handleAddOutlet(e);
    setIsOutletModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* VIEW: MASTER BARANG */}
      {/* ========================================================================= */}
      {activeMenu === "master_barang" && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" /> Ketersediaan Stok Barang
              </h3>
              <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <input type="text" placeholder="Cari barang atau status..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
                  Total: {filteredInventory.length} Item
                </div>
                {userRole === "admin" && (
                  <button onClick={() => setIsBarangModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" /> Tambah Barang
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto p-6">
              <table className="w-full text-left min-w-[1300px]">
                <thead>
                  <tr className="border-b-2 text-gray-500 text-sm">
                    <th className="pb-4 w-12 text-center">No</th>
                    <th className="pb-4"><Box className="w-4 h-4 inline mr-2"/> Nama Barang</th>
                    <th className="pb-4"><Hash className="w-4 h-4 inline mr-2"/> Stok</th>
                    <th className="pb-4"><Scale className="w-4 h-4 inline mr-2"/> Satuan</th>
                    <th className="pb-4"><Building2 className="w-4 h-4 inline mr-2"/> Vendor & Kontrak</th>
                    <th className="pb-4"><CalendarDays className="w-4 h-4 inline mr-2"/> Tgl Mulai</th>
                    <th className="pb-4"><CalendarDays className="w-4 h-4 inline mr-2"/> Tgl Selesai</th>
                    <th className="pb-4 text-center"><Clock className="w-4 h-4 inline mr-2"/> Durasi</th>
                    <th className="pb-4 text-center">Status</th> 
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredInventory.map((inv, index) => {
                    const statusVal = getStatusInfo(inv);
                    return (
                      <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                        <td className="py-4 text-center text-sm">{index + 1}</td>
                        <td className="py-4 font-medium">{inv.nama}</td>
                        <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.stok <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{inv.stok}</span></td>
                        <td className="py-4 text-sm">{inv.satuan}</td>
                        <td className="py-4 text-sm">{inv.vendor_nama ? <div><p className="font-medium text-blue-700">{inv.vendor_nama}</p><p className="text-xs text-gray-500">SPK: {inv.no_spk || '-'}</p></div> : '-'}</td>
                        <td className="py-4 text-sm">{formatDate(inv.tanggal_mulai)}</td>
                        <td className="py-4 text-sm">{formatDate(inv.tanggal_selesai)}</td>
                        <td className="py-4 text-center text-sm">{inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : '-'}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-md text-[11px] font-bold border ${getStatusBadge(statusVal)}`}>
                            {statusVal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================= MODAL TAMBAH BARANG (FIX MOBILE SCROLL) ======================= */}
          {isBarangModalOpen && userRole === "admin" && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 pb-12 sm:pt-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
                
                {/* Header Modal - Tetap di atas */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Tambah Master Barang</h3>
                  </div>
                  <button onClick={() => setIsBarangModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Konten Form - Bisa di-scroll secara internal */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <form id="formAdmin" onSubmit={onSubmitBarang} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang *</label>
                        <input name="nama" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Laptop Lenovo..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
                        <input name="stok" type="number" defaultValue="0" min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Satuan</label>
                        <select name="satuan" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="Pcs">Pcs</option><option value="Unit">Unit</option><option value="Box">Box</option><option value="Set">Set</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Vendor (Jika Ada)</label>
                        <input name="vendor_nama" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PT Era Permata..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">No. SPK</label>
                        <input name="no_spk" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2363/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">No. PKS</label>
                        <input name="no_pks" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2364/..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Mulai Sewa</label>
                        <input name="tanggal_mulai" type="date" onChange={calculateFormLogic} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tgl Selesai Sewa</label>
                        <input name="tanggal_selesai" type="date" onChange={calculateFormLogic} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Barang</label>
                        <input type="hidden" name="status" value={calculatedStatus} />
                        <input type="text" readOnly value={calculatedStatus} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium outline-none cursor-not-allowed" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa Sewa (Bulan)</label>
                        <input name="masa_sewa_bulan" type="number" min="0" className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium outline-none cursor-not-allowed" placeholder="Otomatis..." readOnly />
                      </div>

                      {/* Tombol Action */}
                      <div className="md:col-span-4 flex flex-col sm:flex-row justify-end gap-3 mt-4 border-t border-gray-100 pt-6">
                        <button type="button" onClick={() => setIsBarangModalOpen(false)} className="w-full sm:w-auto px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
                          Batal
                        </button>
                        <button type="submit" className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                          <Plus className="w-5 h-5" /> Simpan Barang
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: MASTER OUTLET / INSTANSI */}
      {/* ========================================================================= */}
      {activeMenu === "master_outlet" && (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" /> Daftar Instansi Terdaftar
              </h3>
              <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <input type="text" placeholder="Cari nama atau kode..." value={searchOutletQuery} onChange={(e) => setSearchOutletQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
                  Total: {filteredOutlets.length}
                </div>
                {userRole === "admin" && (
                  <button onClick={() => setIsOutletModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" /> Tambah Outlet
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[600px] p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 text-gray-500 text-sm sticky top-0 bg-white">
                    <th className="pb-4 w-16 text-center">No</th>
                    <th className="pb-4 w-48">Kode Outlet</th>
                    <th className="pb-4">Nama Outlet / Instansi / Kantor</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredOutlets.length === 0 ? (
                    <tr><td colSpan="3" className="py-12 text-center text-gray-400">Belum ada data instansi.</td></tr>
                  ) : (
                    filteredOutlets.map((out, index) => (
                      <tr key={out.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                        <td className="py-3 text-center text-sm text-gray-400">{index + 1}</td>
                        <td className="py-3 font-mono text-sm text-gray-600">{out.kode || "-"}</td>
                        <td className="py-3 font-medium text-gray-800">{out.nama}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================= MODAL TAMBAH OUTLET ======================= */}
          {isOutletModalOpen && userRole === "admin" && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 pb-12 sm:pt-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-xl">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">Tambah Instansi Baru</h3>
                  </div>
                  <button onClick={() => setIsOutletModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Konten Form */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <form onSubmit={onSubmitOutlet} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Outlet (Opsional)</label>
                      <input name="kode" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Misal: 12447" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Outlet / Instansi *</label>
                      <input name="nama" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="UPC TAMAN RAFLESIA..." />
                    </div>
                    
                    {/* Tombol Action */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 border-t pt-5 border-gray-100 shrink-0">
                      <button type="button" onClick={() => setIsOutletModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">
                        Batal
                      </button>
                      <button type="submit" className="w-full sm:w-auto px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                        <Plus className="w-5 h-5" /> Simpan Outlet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}