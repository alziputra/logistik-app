import React, { useState } from "react";
import {
  Database, Plus, Search, Edit, Trash2, Box, CheckCircle2, Clock, XCircle
} from "lucide-react";
import { addInventory, updateInventory, deleteInventory } from "../../services/inventoryService";
import BarangFormModal from "./BarangFormModal";
import { useNotification } from "../../context/NotificationContext";
import ExcelActionButtons from "../Common/ExcelActionButtons";

export default function MasterBarang({ inventory = [], vendors = [], userRole = "admin", loadAllData }) {
  const { showSuccess, showError, showConfirmDelete } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredInventory = inventory.filter((item) => {
    const q = searchQuery.toLowerCase();
    const vendorName = item.vendor_nama || item.vendor?.nama || "-";
    return (
      item.nama?.toLowerCase().includes(q) ||
      vendorName.toLowerCase().includes(q) ||
      item.no_spk?.toLowerCase().includes(q) ||
      item.no_pks?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingInv(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInv(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);
    const rawVendorNama = (form.get("vendor_nama") || "").trim();
    const vendorNamaVal = rawVendorNama === "" ? "-" : rawVendorNama;
    const matchingVendor = vendors.find(v => v.nama?.toLowerCase() === vendorNamaVal.toLowerCase());

    const payload = {
      nama: form.get("nama"),
      kuantitas: Number(form.get("kuantitas")),
      stok: Number(form.get("kuantitas")),
      satuan: form.get("satuan"),
      vendorId: matchingVendor ? matchingVendor.id : null,
      vendor_nama: vendorNamaVal,
      no_spk: form.get("no_spk") || null,
      no_pks: form.get("no_pks") || null,
      tanggal_mulai: form.get("tanggal_mulai") || null,
      tanggal_selesai: form.get("tanggal_selesai") || null,
      status: form.get("status") || "Inventaris",
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan") || 0),
    };

    try {
      if (editingInv) {
        await updateInventory(editingInv.id, payload);
        showSuccess("Berhasil Memperbarui Data!", `Data barang "${payload.nama}" berhasil diperbarui.`);
      } else {
        await addInventory(payload);
        showSuccess("Berhasil Menambahkan Data!", `Data barang "${payload.nama}" berhasil ditambahkan ke katalog master.`);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data barang:", err);
      showError(
        "Gagal Menyimpan Data",
        err.response?.data?.message || err.message || "Terjadi kesalahan saat menyimpan data barang."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (item) => {
    showConfirmDelete({
      title: "Hapus Master Barang",
      message: `Apakah Anda yakin ingin menghapus barang "${item.nama}" dari katalog master data?`,
      itemName: item.nama,
      onConfirm: async () => {
        await deleteInventory(item.id);
        showSuccess("Berhasil Menghapus Data!", `Data barang "${item.nama}" telah berhasil dihapus.`);
        if (loadAllData) loadAllData();
      },
    });
  };

  const renderStatusBadge = (status) => {
    const s = status || "Inventaris";
    if (s === "Inventaris") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700/80 shadow-sm">
          <Box className="w-3 h-3 text-slate-400" />
          Inventaris
        </span>
      );
    }
    if (s === "Sewa Berjalan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <CheckCircle2 className="w-3 h-3" />
          Sewa Berjalan
        </span>
      );
    }
    if (s === "Sewa Selesai") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
          <Clock className="w-3 h-3" />
          Sewa Selesai
        </span>
      );
    }
    if (s === "Sewa Dibatalkan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
          <XCircle className="w-3 h-3" />
          Sewa Dibatalkan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Master Data Barang / Asset</h2>
            <p className="text-xs text-slate-400">Manajemen katalog barang logistik dan stok gudang terintegrasi.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari barang, vendor, status, SPK..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
          <ExcelActionButtons
            data={filteredInventory}
            fileName="Master_Barang_Pegadaian"
            headersMap={{
              nama: "Nama Barang",
              kuantitas: "Kuantitas",
              satuan: "Satuan",
              status: "Status",
              vendor_nama: "Vendor",
              no_spk: "No SPK",
              no_pks: "No PKS",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let successCount = 0;
              for (const row of parsedRows) {
                const nama = row.nama || row["Nama Barang"] || row["nama"];
                if (!nama) continue;
                try {
                  await addInventory({
                    nama,
                    kuantitas: Number(row.kuantitas || row["Kuantitas"] || row["stok"] || 1),
                    stok: Number(row.kuantitas || row["Kuantitas"] || row["stok"] || 1),
                    satuan: row.satuan || row["Satuan"] || "Unit",
                    vendor_nama: row.vendor_nama || row["Vendor"] || "-",
                    status: row.status || row["Status"] || "Inventaris",
                    no_spk: row.no_spk || row["No SPK"] || null,
                    no_pks: row.no_pks || row["No PKS"] || null,
                  });
                  successCount++;
                } catch (err) {
                  console.error("Error import row:", err);
                }
              }
              showSuccess("Import Excel Berhasil!", `${successCount} data barang berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Barang
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">No. SPK / PKS</th>
                <th className="px-6 py-4 text-center">Status</th>
                {userRole === "admin" && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "8" : "7"} className="px-6 py-12 text-center text-slate-500 italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Box className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <p>Belum ada data barang atau tidak ditemukan hasil pencarian.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-100">{item.nama || "-"}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-400 font-mono">
                      {item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.satuan || "Pcs"}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{item.vendor_nama || item.vendor?.nama || "-"}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {item.no_spk || item.no_pks || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(item.status)}
                    </td>
                    {userRole === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Barang"
                            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl transition-all cursor-pointer border border-slate-700/60"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Hapus Barang"
                            className="p-2 bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer border border-slate-700/60 hover:border-rose-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      <BarangFormModal
        isOpen={isModalOpen}
        editingInv={editingInv}
        isSaving={isSaving}
        vendors={vendors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
