// src/components/DataPerangkat/DataPrinter/index.jsx
"use client";

import React, { useState } from "react";
import {
  Printer, Search, Filter, Plus,
  AlertCircle, FileSpreadsheet, Upload, Download, Loader2,
} from "lucide-react";

import { usePrinterData }  from "../../../hooks/printer/usePrinterData";
import PrinterTable        from "./PrinterTable";
import PrinterModal        from "./PrinterModal";
import QrLabelModal        from "./QrLabelModal";
import ConfirmDeleteModal  from "../../Modal/ConfirmDeleteModal";
import ToastNotif          from "../../Modal/ToastNotif";

export default function DataPrinter({ userRole }) {
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });

  const {
    downloadTemplate, fileInputRef, isSaving, handleFileUpload, exportToExcel,
    openModalForAdd, koneksiError,
    searchQuery, handleSearch, filterStatus, handleFilterStatus,
    isLoading, paginatedData, filteredData,
    currentPage, totalPages, startIndex, itemsPerPage, setCurrentPage,
    openModalForEdit, handleDelete,
    setQrModalData, notif, setNotif,
    isModalOpen, setIsModalOpen,
    editingId, formData, setFormData,
    outletsList, inventoryList, snList,
    handleSave, handleOutletChange, handleProdukChange, handleDateChange,
    qrModalData,
  } = usePrinterData();

  const askDelete = (id, nama) => setDeleteConfirm({ show: true, id, name: nama });

  const confirmDelete = async () => {
    await handleDelete(deleteConfirm.id);
    setDeleteConfirm({ show: false, id: null, name: "" });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Printer className="w-6 h-6 text-blue-600" /> Manajemen Data Printer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pantau status inventaris dan masa sewa perangkat printer
            </p>
          </div>

          {userRole === "admin" && (
            <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/80 shadow-xs">
              <button
                type="button"
                onClick={downloadTemplate}
                title="Download Template CSV"
                aria-label="Download Template CSV"
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                title="Import Data (CSV / Excel)"
                aria-label="Import Data (CSV / Excel)"
                className="p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </button>

              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload file CSV atau Excel data printer"
              />

              <button
                type="button"
                onClick={exportToExcel}
                disabled={filteredData.length === 0}
                title="Export Data ke Excel"
                aria-label="Export Data ke Excel"
                className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5" />
              </button>

              <div className="h-6 w-px bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={openModalForAdd}
                title="Tambah Printer Baru"
                aria-label="Tambah Printer Baru"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center justify-center hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Error koneksi ── */}
        {koneksiError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Koneksi Database Bermasalah</p>
              <p className="text-xs mt-1">Gagal terhubung ke server.</p>
            </div>
          </div>
        )}

        {/* ── Card tabel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search & Filter */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input type="text" placeholder="Cari model, S/N, atau outlet..."
                value={searchQuery} onChange={handleSearch} aria-label="Cari data printer"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select value={filterStatus} onChange={handleFilterStatus} aria-label="Filter status"
                  className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700">
                  <option value="Semua">Semua Status</option>
                  <option value="Inventaris">Inventaris</option>
                  <option value="Sewa Berjalan">Sewa Berjalan</option>
                  <option value="Sewa Habis">Sewa Habis</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Tabel */}
          <PrinterTable
            isLoading={isLoading}
            paginatedData={paginatedData}
            filteredData={filteredData}
            userRole={userRole}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            onEdit={openModalForEdit}
            onDelete={(id, nama) => askDelete(id, nama)}
            onQr={setQrModalData}
          />
        </div>
      </div>

      {/* ── Modal Tambah / Edit ── */}
      <PrinterModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outletsList}
        inventoryList={inventoryList}
        snList={snList}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onOutletChange={handleOutletChange}
        onProdukChange={handleProdukChange}
        onDateChange={handleDateChange}
      />

      {/* ── Modal QR Code ── */}
      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        isSaving={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      {/* ── Toast Notifikasi ── */}
      <ToastNotif
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "" })}
      />
    </>
  );
}