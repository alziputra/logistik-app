// src/components/DataPerangkat/DataKomputer/useKomputerData.js
"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import {
  fetchKomputer, fetchDropdowns,
  addKomputer, updateKomputer, deleteKomputer,
  importKomputerCSV, downloadTemplate,
} from "./komputerService";
import {
  calculateAutoStatus, emptyForm,
} from "./komputerUtils";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function useKomputerData() {
  // ── Data utama ────────────────────────────────────────────────────────────
  const [computerData, setComputerData]   = useState([]);
  const [outletsList, setOutletsList]     = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });

  // ── Modal & form state ────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [formData, setFormData]           = useState(emptyForm);
  const [qrModalData, setQrModalData]     = useState(null);

  // ── Pencarian & filter ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterStatus, setFilterStatus]   = useState("Semua");
  const [currentPage, setCurrentPage]     = useState(1);
  const itemsPerPage = 10;

  const fileInputRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Initial fetch
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setKoneksiError(false);
      try {
        const [data, dropdowns] = await Promise.all([
          fetchKomputer(APP_ID),
          fetchDropdowns(APP_ID),
        ]);
        setComputerData(data);
        setOutletsList(dropdowns.outlets);
        setInventoryList(dropdowns.inventory);
      } catch (err) {
        console.error("Error fetching data:", err);
        setKoneksiError(true);
        setComputerData([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Form handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleOutletChange = (e) => {
    const selectedNama   = e.target.value;
    const selectedOutlet = outletsList.find((o) => o.nama === selectedNama);
    setFormData((prev) => ({
      ...prev,
      outlet:   selectedNama,
      idOutlet: selectedOutlet ? selectedOutlet.kode : "",
    }));
  };

  const handleProdukChange = (e) => {
    const selectedProduk = e.target.value;
    const itemMaster     = inventoryList.find((inv) => inv.nama === selectedProduk);
    setFormData((prev) => {
      const updated = { ...prev, produk: selectedProduk };
      if (itemMaster) {
        updated.penyedia       = itemMaster.vendor_nama   || "";
        updated.tanggalMulai   = itemMaster.tanggal_mulai || "";
        updated.tanggalSelesai = itemMaster.tanggal_selesai || "";
        updated.status         = calculateAutoStatus(itemMaster.tanggal_mulai, itemMaster.tanggal_selesai);
      } else {
        updated.penyedia = updated.tanggalMulai = updated.tanggalSelesai = "";
        updated.status   = "Inventaris";
      }
      return updated;
    });
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai);
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateKomputer(APP_ID, editingId, formData);
        setComputerData((prev) =>
          prev.map((item) => (item.id === editingId ? { id: editingId, ...formData } : item))
        );
        showNotif("Perubahan data komputer berhasil disimpan!");
      } else {
        const newItem = await addKomputer(APP_ID, formData);
        setComputerData((prev) => [newItem, ...prev]);
        showNotif("Data komputer baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showNotif("Gagal menyimpan data ke server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data komputer ini?")) return;
    try {
      await deleteKomputer(APP_ID, id);
      setComputerData((prev) => prev.filter((p) => p.id !== id));
      showNotif("Data komputer berhasil dihapus.");
    } catch (err) {
      console.error(err);
      showNotif("Gagal menghapus data.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Import CSV
  // ─────────────────────────────────────────────────────────────────────────

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    showNotif("Sedang memproses dan mengunggah CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const total = await importKomputerCSV(APP_ID, data);
          showNotif(`Sukses! ${total} data komputer berhasil di-import. Memuat ulang...`);
          setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
          console.error(err);
          showNotif("Gagal import! Pastikan kolom header persis seperti template.", "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        showNotif("Gagal membaca file CSV.", "error");
        setIsSaving(false);
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Modal helpers
  // ─────────────────────────────────────────────────────────────────────────

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (comp) => {
    setEditingId(comp.id);
    setFormData({ ...comp });
    setIsModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Filtering & pagination
  // ─────────────────────────────────────────────────────────────────────────

  const handleSearch       = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterStatus = (e) => { setFilterStatus(e.target.value); setCurrentPage(1); };

  const filteredData = computerData.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.produk?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.outlet?.toLowerCase().includes(q) ||
      item.ipAddress?.toLowerCase().includes(q);
    const matchFilter = filterStatus === "Semua" || item.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return {
    // data
    paginatedData, filteredData, computerData,
    outletsList, inventoryList,
    // ui
    isLoading, isSaving, koneksiError, notif, setNotif,
    // modal
    isModalOpen, setIsModalOpen,
    editingId,
    formData, setFormData,
    qrModalData, setQrModalData,
    // search & filter
    searchQuery, filterStatus, currentPage, setCurrentPage,
    totalPages, startIndex, itemsPerPage,
    // handlers
    handleSearch, handleFilterStatus,
    handleOutletChange, handleProdukChange, handleDateChange,
    handleSave, handleDelete,
    openModalForAdd, openModalForEdit,
    handleFileUpload, fileInputRef,
    downloadTemplate,
  };
}