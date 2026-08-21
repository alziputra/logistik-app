"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import Papa from "papaparse";
import OutletFormModal from "./OutletFormModal";

export default function MasterOutlet({ outlets, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localOutlets, setLocalOutlets] = useState([]);

  useEffect(() => {
    setLocalOutlets(outlets || []);
  }, [outlets]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const fileInputRef = useRef(null);

  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

  const showLocalNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 2500);
  };

  const filteredOutlets = localOutlets.filter((out) => {
    const q = searchQuery.toLowerCase();
    return (
      out.nama?.toLowerCase().includes(q) || out.kode?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };
  const openEdit = (out) => {
    setEditingOutlet(out);
    setIsModalOpen(true);
  };
  const askDelete = (out) => {
    setDeleteConfirm({ show: true, id: out.id, name: out.nama });
  };

  const confirmDeleteAction = async () => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "logistik", "master", "outlets", deleteConfirm.id));
      setLocalOutlets((prev) =>
        prev.filter((item) => item.id !== deleteConfirm.id),
      );
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
        const updatedOutlet = {
          kode: form.get("kode") || "-",
          nama: form.get("nama"),
        };
        await updateDoc(
          doc(db, "logistik", "master", "outlets", editingOutlet.id),
          updatedOutlet,
        );
        setLocalOutlets((prev) =>
          prev.map((item) =>
            item.id === editingOutlet.id
              ? { id: editingOutlet.id, ...updatedOutlet }
              : item,
          ),
        );
        setIsModalOpen(false);
        showLocalNotif("Instansi diperbarui!", "success");
      } catch (error) {
        showLocalNotif("Gagal mengupdate instansi!", "error");
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        const form = new FormData(e.target);
        const newOutlet = {
          kode: form.get("kode") || "-",
          nama: form.get("nama"),
        };
        const docRef = await addDoc(
          collection(db, "logistik", "master", "outlets"),
          newOutlet,
        );
        setLocalOutlets((prev) => [...prev, { id: docRef.id, ...newOutlet }]);
        setIsModalOpen(false);
        showLocalNotif("Instansi berhasil ditambahkan!", "success");
      } catch (error) {
        showLocalNotif("Gagal menambahkan instansi!", "error");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // ── CSV EXPORT & TEMPLATE & IMPORT ─────────────────────────────────────
  const exportToCSV = () => {
    const dataToExport = filteredOutlets.map((item) => ({
      "Kode Outlet": item.kode || "-",
      "Nama Outlet / Instansi": item.nama || "",
    }));

    const csvString = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Master_Instansi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showLocalNotif("Data instansi berhasil diekspor ke CSV!", "success");
  };

  const downloadTemplateCSV = () => {
    const sampleData = [
      {
        "Kode Outlet": "OUT-001",
        "Nama Outlet / Instansi": "Pegadaian CP Kebayoran Baru",
      },
      {
        "Kode Outlet": "OUT-002",
        "Nama Outlet / Instansi": "Pegadaian Kanwil Jakarta 1",
      },
    ];

    const csvString = Papa.unparse(sampleData);
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Import_Instansi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          if (!rows || rows.length === 0) {
            showLocalNotif("File CSV kosong atau format tidak sesuai.", "error");
            setIsImporting(false);
            return;
          }

          const newOutlets = [];
          const colRef = collection(db, "logistik", "master", "outlets");

          for (const row of rows) {
            const nama = row["Nama Outlet / Instansi"] || row["Nama Outlet"] || row["nama"] || row["Nama"] || "";
            if (!nama.trim()) continue;

            const payload = {
              kode: row["Kode Outlet"] || row["kode"] || "-",
              nama: nama.trim(),
            };

            const docRef = await addDoc(colRef, payload);
            newOutlets.push({ id: docRef.id, ...payload });
          }

          if (newOutlets.length > 0) {
            setLocalOutlets((prev) => [...prev, ...newOutlets]);
            showLocalNotif(`Berhasil mengimpor ${newOutlets.length} instansi baru!`, "success");
          } else {
            showLocalNotif("Tidak ada data instansi valid yang diimpor.", "error");
          }
        } catch (err) {
          console.error("Gagal mengimpor CSV:", err);
          showLocalNotif("Gagal mengimpor data CSV.", "error");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error("PapaParse error:", err);
        showLocalNotif("Gagal membaca file CSV.", "error");
        setIsImporting(false);
      },
    });
  };

  // ✅ Fungsi untuk Export JSON (Pertahankan dukungan existing)
  const handleExportJSON = () => {
    const dataToExport = JSON.stringify(filteredOutlets, null, 2);
    const blob = new Blob([dataToExport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data_instansi_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showLocalNotif("Data berhasil diexport ke JSON!", "success");
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImportCSV}
        className="hidden"
      />
      {/* ==================== TABEL UTAMA ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" /> Daftar Instansi
            Terdaftar
          </h3>
          <div className="flex flex-wrap w-full lg:w-auto gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0">
              Total: {filteredOutlets.length}
            </div>

            {/* Action Bar Berbasis Ikon */}
            <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/80 shadow-xs shrink-0">
              {userRole === "admin" && (
                <button
                  type="button"
                  onClick={downloadTemplateCSV}
                  title="Unduh Template CSV"
                  aria-label="Unduh Template CSV"
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </button>
              )}

              {userRole === "admin" && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  title="Impor dari CSV"
                  aria-label="Impor dari CSV"
                  className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </button>
              )}

              <button
                type="button"
                onClick={exportToCSV}
                title="Ekspor ke CSV"
                aria-label="Ekspor ke CSV"
                className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5" />
              </button>

              {userRole === "admin" && (
                <>
                  <div className="h-6 w-px bg-gray-200 mx-1" />

                  <button
                    type="button"
                    onClick={openAdd}
                    title="Tambah Outlet Baru"
                    aria-label="Tambah Outlet Baru"
                    className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="overflow-y-auto max-h-[560px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 text-gray-500 text-xs">
                  <th className="pb-2 w-12 text-center sticky top-0 bg-white">
                    No
                  </th>
                  <th className="pb-2 w-40 sticky top-0 bg-white">
                    Kode Outlet
                  </th>
                  <th className="pb-2 sticky top-0 bg-white">
                    Nama Outlet / Instansi
                  </th>
                  {userRole === "admin" && (
                    <th className="pb-2 text-right sticky top-0 bg-white">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredOutlets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={userRole === "admin" ? "4" : "3"}
                      className="py-12 text-center text-gray-400 text-sm"
                    >
                      Belum ada data instansi/outlet.
                    </td>
                  </tr>
                ) : (
                  filteredOutlets.map((out, index) => (
                    <tr
                      key={out.id}
                      className="border-b border-gray-50 hover:bg-gray-50/80"
                    >
                      <td className="py-2 text-center text-xs text-gray-400">
                        {index + 1}
                      </td>
                      <td className="py-2 font-mono text-xs text-gray-600">
                        {out.kode || "-"}
                      </td>
                      <td className="py-2 text-sm font-medium text-gray-800">
                        {out.nama}
                      </td>
                      {userRole === "admin" && (
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(out)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => askDelete(out)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500">
                Yakin hapus{" "}
                <span className="font-bold">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, id: null, name: "" })
                }
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r"
              >
                BATAL
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isSaving}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
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

      {/* ==================== TOAST NOTIFICATION ==================== */}
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