"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Box,
  Hash,
  Scale,
  Building2,
  CalendarDays,
  Clock,
  Search,
  X,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
// PERHATIKAN: Path firebase mundur 2 kali karena sekarang ada di dalam folder
import { db } from "../../lib/firebase";

export default function MasterBarang({
  inventory,
  handleAddInventory,
  userRole,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [calculatedStatus, setCalculatedStatus] = useState("Inventaris");
  const [localInventory, setLocalInventory] = useState([]);

  useEffect(() => {
    setLocalInventory(inventory || []);
  }, [inventory]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editingInv, setEditingInv] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

  const showLocalNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 2500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateFormLogic = () => {
    const form = document.getElementById("formBarang");
    if (!form) return;
    const start = form.tanggal_mulai?.value;
    const end = form.tanggal_selesai?.value;

    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth();
      months += d2.getMonth();
      if (form.masa_sewa_bulan)
        form.masa_sewa_bulan.value = months > 0 ? months : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setCalculatedStatus(
        new Date(end) >= today ? "Sewa Berjalan" : "Sewa Habis",
      );
    } else {
      setCalculatedStatus("Inventaris");
      if (form.masa_sewa_bulan) form.masa_sewa_bulan.value = "";
    }
  };

  const getStatusInfo = (inv) => {
    if (inv.status) return inv.status;
    if (!inv.tanggal_mulai || !inv.tanggal_selesai) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(inv.tanggal_selesai) >= today
      ? "Sewa Berjalan"
      : "Sewa Habis";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Inventaris":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Sewa Berjalan":
        return "bg-green-100 text-green-700 border-green-200";
      case "Sewa Habis":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredInventory = localInventory.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const statusInfo = getStatusInfo(inv).toLowerCase();
    return (
      inv.nama?.toLowerCase().includes(q) ||
      inv.vendor_nama?.toLowerCase().includes(q) ||
      inv.no_spk?.toLowerCase().includes(q) ||
      statusInfo.includes(q)
    );
  });

  const openAdd = () => {
    setEditingInv(null);
    setCalculatedStatus("Inventaris");
    setIsModalOpen(true);
  };
  const openEdit = (inv) => {
    setEditingInv(inv);
    setCalculatedStatus(getStatusInfo(inv));
    setIsModalOpen(true);
  };
  const askDelete = (inv) => {
    setDeleteConfirm({ show: true, id: inv.id, name: inv.nama });
  };

  const confirmDeleteAction = async () => {
    setIsSaving(true);
    try {
      await deleteDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "inventory",
          deleteConfirm.id,
        ),
      );
      setLocalInventory((prev) =>
        prev.filter((item) => item.id !== deleteConfirm.id),
      );
      showLocalNotif("Barang berhasil dihapus!", "success");
    } catch (e) {
      showLocalNotif("Gagal menghapus data.", "error");
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (editingInv) {
      setIsSaving(true);
      try {
        const form = new FormData(e.target);
        const updatedInv = {
          nama: form.get("nama"),
          stok: Number(form.get("stok")) || 0,
          satuan: form.get("satuan") || "Pcs",
          vendor_nama: form.get("vendor_nama") || "",
          no_spk: form.get("no_spk") || "",
          no_pks: form.get("no_pks") || "",
          tanggal_mulai: form.get("tanggal_mulai") || "",
          tanggal_selesai: form.get("tanggal_selesai") || "",
          masa_sewa_bulan: Number(form.get("masa_sewa_bulan")) || 0,
          status: form.get("status") || "Inventaris",
        };
        await updateDoc(
          doc(
            db,
            "artifacts",
            appId,
            "public",
            "data",
            "inventory",
            editingInv.id,
          ),
          updatedInv,
        );
        setLocalInventory((prev) =>
          prev.map((item) =>
            item.id === editingInv.id
              ? { id: editingInv.id, ...updatedInv }
              : item,
          ),
        );
        setIsModalOpen(false);
        showLocalNotif("Data barang diperbarui!", "success");
      } catch (error) {
        showLocalNotif("Gagal mengupdate barang!", "error");
      } finally {
        setIsSaving(false);
      }
    } else {
      await handleAddInventory(e);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Ketersediaan Stok
            Barang
          </h3>
          <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari barang atau status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
              Total: {filteredInventory.length}
            </div>
            {userRole === "admin" && (
              <button
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Barang
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="w-full text-left min-w-[1100px]">
            <thead>
              <tr className="border-b-2 text-gray-500 text-xs">
                <th className="pb-2 w-10 text-center">No</th>
                <th className="pb-2">
                  <Box className="w-3 h-3 inline mr-1" /> Nama Barang
                </th>
                <th className="pb-2">
                  <Hash className="w-3 h-3 inline mr-1" /> Stok
                </th>
                <th className="pb-2">
                  <Scale className="w-3 h-3 inline mr-1" /> Satuan
                </th>
                <th className="pb-2">
                  <Building2 className="w-3 h-3 inline mr-1" /> Vendor & Kontrak
                </th>
                <th className="pb-2">
                  <CalendarDays className="w-3 h-3 inline mr-1" /> Mulai
                </th>
                <th className="pb-2">
                  <CalendarDays className="w-3 h-3 inline mr-1" /> Selesai
                </th>
                <th className="pb-2 text-center">
                  <Clock className="w-3 h-3 inline mr-1" /> Durasi
                </th>
                <th className="pb-2 text-center">Status</th>
                {userRole === "admin" && (
                  <th className="pb-2 text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredInventory.map((inv, index) => {
                const statusVal = getStatusInfo(inv);
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-50 hover:bg-gray-50/80"
                  >
                    <td className="py-2 text-center text-xs">{index + 1}</td>
                    <td className="py-2 text-sm font-medium">{inv.nama}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${inv.stok <= 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                      >
                        {inv.stok}
                      </span>
                    </td>
                    <td className="py-2 text-xs">{inv.satuan}</td>
                    <td className="py-2 text-xs">
                      {inv.vendor_nama ? (
                        <div>
                          <p className="font-medium text-blue-700">
                            {inv.vendor_nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            SPK: {inv.no_spk || "-"}
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 text-xs">
                      {formatDate(inv.tanggal_mulai)}
                    </td>
                    <td className="py-2 text-xs">
                      {formatDate(inv.tanggal_selesai)}
                    </td>
                    <td className="py-2 text-center text-xs">
                      {inv.masa_sewa_bulan ? `${inv.masa_sewa_bulan} Bln` : "-"}
                    </td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(statusVal)}`}
                      >
                        {statusVal}
                      </span>
                    </td>
                    {userRole === "admin" && (
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(inv)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => askDelete(inv)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && userRole === "admin" && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-start sm:items-center justify-center p-4 pt-12 pb-12 sm:pt-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 relative">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  {editingInv ? (
                    <Edit className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Database className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-800">
                  {editingInv ? "Edit Data Barang" : "Tambah Master Barang"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="formBarang" onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1.5">
                      Nama Barang *
                    </label>
                    <input
                      name="nama"
                      defaultValue={editingInv?.nama || ""}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Stok</label>
                    <input
                      name="stok"
                      type="number"
                      defaultValue={editingInv?.stok || 0}
                      min="0"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Satuan</label>
                    <select
                      name="satuan"
                      defaultValue={editingInv?.satuan || "Pcs"}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option>Pcs</option>
                      <option>Unit</option>
                      <option>Box</option>
                      <option>Set</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1.5">Nama Vendor</label>
                    <input
                      name="vendor_nama"
                      defaultValue={editingInv?.vendor_nama || ""}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">No. SPK</label>
                    <input
                      name="no_spk"
                      defaultValue={editingInv?.no_spk || ""}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">No. PKS</label>
                    <input
                      name="no_pks"
                      defaultValue={editingInv?.no_pks || ""}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Tgl Mulai</label>
                    <input
                      name="tanggal_mulai"
                      type="date"
                      defaultValue={editingInv?.tanggal_mulai || ""}
                      onChange={calculateFormLogic}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Tgl Selesai</label>
                    <input
                      name="tanggal_selesai"
                      type="date"
                      defaultValue={editingInv?.tanggal_selesai || ""}
                      onChange={calculateFormLogic}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Status</label>
                    <input
                      type="hidden"
                      name="status"
                      value={calculatedStatus}
                    />
                    <input
                      type="text"
                      readOnly
                      value={calculatedStatus}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Masa Sewa</label>
                    <input
                      name="masa_sewa_bulan"
                      type="number"
                      min="0"
                      defaultValue={editingInv?.masa_sewa_bulan || ""}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                      readOnly
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-3 mt-4 border-t pt-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSaving}
                      className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}{" "}
                      {editingInv ? "Simpan Perubahan" : "Simpan Barang"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">
                Yakin hapus{" "}
                <span className="font-bold text-gray-800">
                  {deleteConfirm.name}
                </span>
                ?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, id: null, name: "" })
                }
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r border-gray-100"
              >
                BATAL
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "YA, HAPUS"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {notif.show && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm text-white animate-in slide-in-from-bottom-8 duration-300 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {notif.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notif.message}
        </div>
      )}
    </div>
  );
}
