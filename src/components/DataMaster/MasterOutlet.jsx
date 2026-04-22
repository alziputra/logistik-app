"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import OutletFormModal from "./OutletFormModal"; 

export default function MasterOutlet({ outlets, handleAddOutlet, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localOutlets, setLocalOutlets] = useState([]);

  useEffect(() => { setLocalOutlets(outlets || []); }, [outlets]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

  const showLocalNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 2500);
  };

  const filteredOutlets = localOutlets.filter((out) => {
    const q = searchQuery.toLowerCase();
    return out.nama?.toLowerCase().includes(q) || out.kode?.toLowerCase().includes(q);
  });

  const openAdd = () => { setEditingOutlet(null); setIsModalOpen(true); };
  const openEdit = (out) => { setEditingOutlet(out); setIsModalOpen(true); };
  const askDelete = (out) => { setDeleteConfirm({ show: true, id: out.id, name: out.nama }); };

  const confirmDeleteAction = async () => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "outlets", deleteConfirm.id));
      setLocalOutlets(prev => prev.filter(item => item.id !== deleteConfirm.id));
      showLocalNotif("Instansi berhasil dihapus!", "success");
    } catch (e) {
      showLocalNotif("Gagal menghapus data.", "error");
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (editingOutlet) {
      setIsSaving(true);
      try {
        const form = new FormData(e.target);
        const updatedOutlet = { kode: form.get("kode") || "-", nama: form.get("nama") };
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "outlets", editingOutlet.id), updatedOutlet);
        setLocalOutlets(prev => prev.map(item => item.id === editingOutlet.id ? { id: editingOutlet.id, ...updatedOutlet } : item));
        setIsModalOpen(false);
        showLocalNotif("Instansi diperbarui!", "success");
      } catch (error) {
        showLocalNotif("Gagal mengupdate instansi!", "error");
      } finally { setIsSaving(false); }
    } else {
      await handleAddOutlet(e);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" /> Daftar Instansi Terdaftar
          </h3>
          <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input type="text" placeholder="Cari nama atau kode..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">Total: {filteredOutlets.length}</div>
            {userRole === "admin" && (
              <button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
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
                <th className="pb-4">Nama Outlet / Instansi</th>
                {userRole === "admin" && <th className="pb-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredOutlets.length === 0 ? (
                <tr><td colSpan={userRole === "admin" ? "4" : "3"} className="py-12 text-center text-gray-400">Belum ada data instansi.</td></tr>
              ) : (
                filteredOutlets.map((out, index) => (
                  <tr key={out.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="py-3 text-center text-sm text-gray-400">{index + 1}</td>
                    <td className="py-3 font-mono text-sm text-gray-600">{out.kode || "-"}</td>
                    <td className="py-3 font-medium text-gray-800">{out.nama}</td>
                    {userRole === "admin" && (
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(out)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => askDelete(out)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      {/* ==================== MODAL TAMBAH/EDIT (DIPANGGIL DARI FILE LAIN) ==================== */}
      {userRole === "admin" && (
        <OutletFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingOutlet={editingOutlet} 
          onSubmit={onSubmit} 
          isSaving={isSaving} 
        />
      )}

      {/* ==================== MODAL KONFIRMASI HAPUS ==================== */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">Yakin hapus <span className="font-bold">{deleteConfirm.name}</span>?</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button onClick={() => setDeleteConfirm({show:false, id:null, name:""})} disabled={isSaving} className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r">BATAL</button>
              <button onClick={confirmDeleteAction} disabled={isSaving} className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors">{isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : "YA, HAPUS"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOAST NOTIFICATION ==================== */}
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm text-white animate-in slide-in-from-bottom-8 duration-300 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notif.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}{notif.message}
        </div>
      )}
    </div>
  );
}