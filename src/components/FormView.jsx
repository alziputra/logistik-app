"use client";
import { FileText, ArrowLeft, Plus, Trash2 } from "lucide-react";

const FormView = ({ formData, handleInputChange, items, handleItemChange, addItem, removeItem, setView, inventory, outlets }) => (
  <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 print:hidden mt-6">
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <FileText className="text-blue-500" /> Buat Surat Serah Terima
      </h2>
      <button
        onClick={() => setView("preview")}
        className="bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2"
      >
        Lanjut ke Preview <ArrowLeft className="w-4 h-4 transform rotate-180" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="text-sm block mb-1 font-medium text-gray-600">Transaksi</label>
        <select
          name="jenisTransaksi"
          value={formData.jenisTransaksi}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-gray-50"
        >
          <option>Barang Keluar</option>
          <option>Barang Masuk</option>
        </select>
      </div>
      <div>
        <label className="text-sm block mb-1 font-medium text-gray-600">Nomor Surat</label>
        <input
          type="text"
          name="nomorSurat"
          value={formData.nomorSurat}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-sm block mb-1 font-medium text-gray-600">Tanggal</label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-sm block mb-1 font-medium text-gray-600">Lokasi</label>
        <input
          type="text"
          name="lokasi"
          value={formData.lokasi}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
        <h3 className="font-bold text-sm mb-3 text-blue-800 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span> Yang Menyerahkan
        </h3>
        <input name="pengirimNama" value={formData.pengirimNama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
        <input name="pengirimJabatan" value={formData.pengirimJabatan} onChange={handleInputChange} placeholder="Jabatan" className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
        <input list="db-instansi" name="pengirimInstansi" value={formData.pengirimInstansi} onChange={handleInputChange} placeholder="Instansi / Area" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
      </div>
      <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
        <h3 className="font-bold text-sm mb-3 text-purple-800 flex items-center gap-2">
          <span className="bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span> Mengetahui
        </h3>
        <input name="mengetahuiNama" value={formData.mengetahuiNama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500" />
        <input name="mengetahuiJabatan" value={formData.mengetahuiJabatan} onChange={handleInputChange} placeholder="Jabatan" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500" />
      </div>
      <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
        <h3 className="font-bold text-sm mb-3 text-green-800 flex items-center gap-2">
          <span className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span> Yang Menerima
        </h3>
        <input name="penerimaNama" value={formData.penerimaNama} onChange={handleInputChange} placeholder="Nama Lengkap" className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500" />
        <input name="penerimaJabatan" value={formData.penerimaJabatan} onChange={handleInputChange} placeholder="Jabatan" className="w-full p-2 mb-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500" />
        <input list="db-instansi" name="penerimaInstansi" value={formData.penerimaInstansi} onChange={handleInputChange} placeholder="Instansi / Area" className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500" />
      </div>
    </div>

    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-lg text-gray-800">Daftar Barang</h3>
      <button onClick={addItem} className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-200 transition-colors">
        <Plus className="w-4 h-4 mr-1" /> Tambah Baris
      </button>
    </div>

    <datalist id="db-barang">{inventory.map((i) => <option key={i.id} value={i.nama} />)}</datalist>
    {/* PERBAIKAN: Gunakan data 'outlets' dari Firebase untuk autocomplete instansi */}
    <datalist id="db-instansi">
      {outlets && outlets.map((out) => (
        <option key={out.id} value={out.nama} />
      ))}
    </datalist>
  
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-sm text-gray-600">
            <th className="p-3 border-b w-10 text-center font-semibold">No</th>
            <th className="p-3 border-b min-w-[200px] font-semibold">Nama Barang</th>
            <th className="p-3 border-b w-32 font-semibold">S/N</th>
            <th className="p-3 border-b w-20 text-center font-semibold">Qty</th>
            <th className="p-3 border-b w-24 font-semibold">Satuan</th>
            <th className="p-3 border-b w-56 font-semibold">Outlet Tujuan</th>
            <th className="p-3 border-b font-semibold">Keterangan</th>
            <th className="p-3 border-b w-12 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b hover:bg-gray-50/50">
              <td className="p-2 text-center text-gray-500 text-sm">{idx + 1}</td>
              <td className="p-2">
                <input list="db-barang" value={item.nama} onChange={(e) => handleItemChange(item.id, "nama", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Ketik/Pilih Barang..." />
              </td>
              <td className="p-2">
                <input value={item.sn} onChange={(e) => handleItemChange(item.id, "sn", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500" placeholder="S/N" />
              </td>
              <td className="p-2">
                <input type="number" min="1" value={item.kuantitas} onChange={(e) => handleItemChange(item.id, "kuantitas", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm text-center outline-none focus:border-blue-500" />
              </td>
              <td className="p-2">
                <select value={item.satuan} onChange={(e) => handleItemChange(item.id, "satuan", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500 bg-white">
                  <option>Pcs</option><option>Unit</option><option>Box</option>
                </select>
              </td>
              <td className="p-2">
                <input list="db-instansi" value={item.outlet || ""} onChange={(e) => handleItemChange(item.id, "outlet", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Pilih Outlet..." />
              </td>
              <td className="p-2">
                <input value={item.keterangan} onChange={(e) => handleItemChange(item.id, "keterangan", e.target.value)} className="w-full p-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Catatan..." />
              </td>
              <td className="p-2 text-center">
                <button onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-red-500 disabled:opacity-30 p-1.5 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default FormView;