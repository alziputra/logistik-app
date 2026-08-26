import React, { useState } from "react";
import { Laptop, Search, Plus } from "lucide-react";

import LaptopTable from "./LaptopTable";
import LaptopModal from "./LaptopModal";
import QrLabelModal from "../../Modal/QrLabelModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addLaptop, updateLaptop, deleteLaptop, importLaptopCSV } from "../../../services/laptopService";

export default function DataLaptop({
  userRole = "admin",
  laptops = [],
  vendors = [],
  filterStatus: propFilterStatus = "Semua",
  setFilterStatus,
  loadAllData,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatusState, setFilterStatusState] = useState(propFilterStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const filteredData = laptops.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.nama?.toLowerCase().includes(q) ||
      item.nik?.toLowerCase().includes(q) ||
      item.hostname?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.departemen?.toLowerCase().includes(q) ||
      item.vendor?.toLowerCase().includes(q);
    const matchFilter = filterStatusState === "Semua" || item.status === filterStatusState;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateLaptop(editingId, formData);
        setNotif({ show: true, message: "Data laptop berhasil diupdate!", type: "success" });
      } else {
        await addLaptop(formData);
        setNotif({ show: true, message: "Laptop baru berhasil ditambahkan!", type: "success" });
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data laptop:", err);
      setNotif({ show: true, message: "Gagal menyimpan data laptop.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteLaptop(deleteConfirm.id);
      setNotif({ show: true, message: `Laptop ${deleteConfirm.name} berhasil dihapus!`, type: "success" });
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus laptop:", err);
      setNotif({ show: true, message: "Gagal menghapus data laptop.", type: "error" });
    } finally {
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      nik: "",
      nama: "",
      jabatan: "",
      departemen: "Departemen Logistik & Umum",
      hostname: "NB-00108-",
      sn: "",
      os: "Windows",
      vendor: "PT GLOBAL SOLUSINDO KOMPUDATA",
      tanggalMulai: "2024-01-01",
      tanggalSelesai: "2026-01-01",
      status: "Sewa Berjalan",
      kondisi: "BAIK",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {notif.show && (
        <ToastNotif
          message={notif.message}
          type={notif.type}
          onClose={() => setNotif({ show: false, message: "", type: "success" })}
        />
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Manajemen Data Laptop
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola daftar laptop pegawai, penanggung jawab, spesifikasi OS, vendor sewa, dan label QR Code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userRole === "admin" && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Laptop Baru
            </button>
          )}
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NIK, Nama, Hostname, SN, Vendor..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#00753A] transition-colors"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatusState}
            onChange={(e) => {
              const val = e.target.value;
              setFilterStatusState(val);
              if (setFilterStatus) setFilterStatus(val);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#00753A] cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Sewa Berjalan">Sewa Berjalan</option>
            <option value="Sewa Habis">Sewa Habis</option>
            <option value="Inventaris">Inventaris</option>
          </select>
        </div>

        {/* Excel Actions */}
        <ExcelActionButtons
          data={laptops}
          filename="Data_Laptop_Pegadaian"
          onImportComplete={loadAllData}
          importHandler={importLaptopCSV}
        />
      </div>

      {/* LAPTOP TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <LaptopTable
          paginatedData={paginatedData}
          userRole={userRole}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          onEdit={openEditModal}
          onDelete={(id, name) => setDeleteConfirm({ show: true, id, name })}
          onQr={setQrModalData}
        />
      </div>

      {/* LAPTOP MODAL */}
      <LaptopModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        vendorsList={vendors}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      {/* QR LABEL MODAL */}
      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        onClose={() => setDeleteConfirm({ show: false, id: null, name: "" })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
