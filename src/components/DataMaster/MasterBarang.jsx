import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Box,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Boxes,
  FileSpreadsheet,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { addInventory, updateInventory, deleteInventory } from "../../services/inventoryService";
import BarangFormModal from "./BarangFormModal";
import { useNotification } from "../../context/NotificationContext";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import Pagination from "../Common/Pagination";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";

export default function MasterBarang({
  inventory = [],
  vendors = [],
  userRole = "admin",
  loadAllData,
}) {
  const { showSuccess, showError } = useNotification();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVendor, setSelectedVendor] = useState("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState("ALL"); // ALL, AVAILABLE, EMPTY

  // Sort State
  const [sortField, setSortField] = useState("nama");
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Allow CRUD for admin and officer (or anyone except viewer)
  const canEdit = userRole !== "viewer";

  // Quick Stats Calculations
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalStock = inventory.reduce((sum, item) => sum + (Number(item.kuantitas !== undefined ? item.kuantitas : item.stok) || 0), 0);
    const totalSewaBerjalan = inventory.filter((item) => (item.status || "").toLowerCase() === "sewa berjalan").length;
    const totalInventaris = inventory.filter((item) => (item.status || "inventaris").toLowerCase() === "inventaris").length;

    return { totalItems, totalStock, totalSewaBerjalan, totalInventaris };
  }, [inventory]);

  // Unique list of vendors from inventory for filter dropdown
  const vendorOptions = useMemo(() => {
    const vSet = new Set();
    inventory.forEach((item) => {
      const v = (item.vendor_nama || item.vendor?.nama || "").trim();
      if (v && v !== "-") vSet.add(v);
    });
    return Array.from(vSet).sort();
  }, [inventory]);

  // Multi-field intelligent filtered inventory
  const filteredInventory = useMemo(() => {
    let result = [...inventory];

    // Status Filter
    if (selectedStatus !== "ALL") {
      result = result.filter((item) => {
        const s = (item.status || "Inventaris").toUpperCase();
        return s === selectedStatus.toUpperCase();
      });
    }

    // Vendor Filter
    if (selectedVendor !== "ALL") {
      result = result.filter((item) => {
        const v = (item.vendor_nama || item.vendor?.nama || "-").toLowerCase();
        return v === selectedVendor.toLowerCase();
      });
    }

    // Stock Status Filter
    if (selectedStockStatus === "AVAILABLE") {
      result = result.filter((item) => {
        const qty = Number(item.kuantitas !== undefined ? item.kuantitas : item.stok || 0);
        return qty > 0;
      });
    } else if (selectedStockStatus === "EMPTY") {
      result = result.filter((item) => {
        const qty = Number(item.kuantitas !== undefined ? item.kuantitas : item.stok || 0);
        return qty <= 0;
      });
    }

    // Multi-word Search Query Filter
    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter((item) => {
        const itemNama = (item.nama || "").toLowerCase();
        const itemVendor = (item.vendor_nama || item.vendor?.nama || "").toLowerCase();
        const itemSpk = (item.no_spk || "").toLowerCase();
        const itemPks = (item.no_pks || "").toLowerCase();
        const itemStatus = (item.status || "").toLowerCase();
        const itemSatuan = (item.satuan || "").toLowerCase();
        const itemMasa = item.masa_sewa_bulan ? `${item.masa_sewa_bulan} bulan` : "";

        const fullSearchString = `${itemNama} ${itemVendor} ${itemSpk} ${itemPks} ${itemStatus} ${itemSatuan} ${itemMasa}`;

        // Every token must exist in the item string
        return tokens.every((token) => fullSearchString.includes(token));
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "stok" || sortField === "kuantitas") {
        aVal = Number(a.kuantitas !== undefined ? a.kuantitas : a.stok || 0);
        bVal = Number(b.kuantitas !== undefined ? b.kuantitas : b.stok || 0);
      } else if (sortField === "vendor") {
        aVal = (a.vendor_nama || a.vendor?.nama || "").toLowerCase();
        bVal = (b.vendor_nama || b.vendor?.nama || "").toLowerCase();
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [inventory, selectedStatus, selectedVendor, selectedStockStatus, searchQuery, sortField, sortDirection]);

  // Handle Sort Click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedVendor("ALL");
    setSelectedStockStatus("ALL");
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedVendor !== "ALL" ||
    selectedStockStatus !== "ALL";

  // CRUD: Open Add Modal
  const handleOpenAdd = () => {
    setEditingInv(null);
    setIsModalOpen(true);
  };

  // CRUD: Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingInv(item);
    setIsModalOpen(true);
  };

  // CRUD: Submit Add/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);
    const rawVendorNama = (form.get("vendor_nama") || "").trim();
    const vendorNamaVal = rawVendorNama === "" ? "-" : rawVendorNama;
    const matchingVendor = vendors.find(
      (v) => (v.nama_perusahaan || v.nama || "").toLowerCase() === vendorNamaVal.toLowerCase()
    );

    const payload = {
      nama: (form.get("nama") || "").trim(),
      kuantitas: Number(form.get("kuantitas") || 0),
      stok: Number(form.get("kuantitas") || 0),
      satuan: form.get("satuan") || "Unit",
      vendorId: matchingVendor ? matchingVendor.id : null,
      vendor_nama: vendorNamaVal,
      no_spk: (form.get("no_spk") || "").trim() || null,
      no_pks: (form.get("no_pks") || "").trim() || null,
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
      showError("Gagal Menyimpan Data", err.response?.data?.message || err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  // CRUD: Trigger Delete
  const handleOpenDelete = (item) => {
    setDeleteTarget(item);
  };

  // CRUD: Confirm Delete Execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInventory(deleteTarget.id);
      showSuccess("Berhasil Menghapus Data!", `Data barang "${deleteTarget.nama}" telah berhasil dihapus.`);
      setDeleteTarget(null);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus data barang:", err);
      showError("Gagal Menghapus Data", err.message || "Terjadi kesalahan saat menghapus data barang.");
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
    const s = status || "Inventaris";
    if (s === "Inventaris") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
          <Box className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          Inventaris
        </span>
      );
    }
    if (s === "Sewa Berjalan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#00753A] dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-[#00753A] dark:text-emerald-400" />
          Sewa Berjalan
        </span>
      );
    }
    if (s === "Sewa Selesai") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 shadow-xs">
          <Clock className="w-3 h-3" />
          Sewa Selesai
        </span>
      );
    }
    if (s === "Sewa Dibatalkan") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 shadow-xs">
          <XCircle className="w-3 h-3" />
          Sewa Dibatalkan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {s}
      </span>
    );
  };

  // Helper: Render Sort Icon on Header
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#00753A] dark:text-emerald-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#00753A] dark:text-emerald-400 font-bold" />
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Barang */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Katalog Barang</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.totalItems} <span className="text-xs font-normal text-slate-400">item</span></h4>
          </div>
          <div className="p-3 bg-[#E6F4EA] dark:bg-emerald-950/60 rounded-xl text-[#00753A] dark:text-emerald-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stok Fisik */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Stok Fisik</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.totalStock.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-400">unit</span></h4>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Sewa Berjalan */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sewa Berjalan</p>
            <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.totalSewaBerjalan} <span className="text-xs font-normal text-slate-400">item</span></h4>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-[#00753A] dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Inventaris */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventaris Tetap</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.totalInventaris} <span className="text-xs font-normal text-slate-400">item</span></h4>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
            <Box className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Header & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Master Data Barang / Asset</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {inventory.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manajemen katalog barang logistik, aset sewa vendor, dan inventaris gudang terpadu.
              </p>
            </div>
          </div>

          {/* Action Buttons: Export/Import + Tambah */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <ExcelActionButtons
              data={filteredInventory}
              fileName="Master_Barang_Pegadaian"
              headersMap={{
                nama: "Nama Barang",
                kuantitas: "Kuantitas / Stok",
                satuan: "Satuan",
                status: "Status",
                vendor_nama: "Vendor",
                no_spk: "No SPK",
                no_pks: "No PKS",
                tanggal_mulai: "Tgl Mulai Sewa",
                tanggal_selesai: "Tgl Selesai Sewa",
                masa_sewa_bulan: "Masa Sewa (Bulan)",
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
                      kuantitas: Number(row.kuantitas || row["Kuantitas"] || row["Kuantitas / Stok"] || row["stok"] || 1),
                      stok: Number(row.kuantitas || row["Kuantitas"] || row["Kuantitas / Stok"] || row["stok"] || 1),
                      satuan: row.satuan || row["Satuan"] || "Unit",
                      vendor_nama: row.vendor_nama || row["Vendor"] || "-",
                      status: row.status || row["Status"] || "Inventaris",
                      no_spk: row.no_spk || row["No SPK"] || null,
                      no_pks: row.no_pks || row["No PKS"] || null,
                      tanggal_mulai: row.tanggal_mulai || row["Tgl Mulai Sewa"] || null,
                      tanggal_selesai: row.tanggal_selesai || row["Tgl Selesai Sewa"] || null,
                      masa_sewa_bulan: Number(row.masa_sewa_bulan || row["Masa Sewa (Bulan)"] || 0),
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

            {canEdit && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-[#00753A] hover:bg-[#005c2e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-[#00753A]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Barang
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Search and Filter Toolbar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama barang, vendor, no SPK/PKS, status, satuan..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vendor Filter */}
            <div className="relative">
              <select
                value={selectedVendor}
                onChange={(e) => {
                  setSelectedVendor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#00753A] cursor-pointer"
              >
                <option value="ALL">Semua Vendor ({vendorOptions.length})</option>
                {vendorOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Stok Filter */}
            <div className="relative">
              <select
                value={selectedStockStatus}
                onChange={(e) => {
                  setSelectedStockStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#00753A] cursor-pointer"
              >
                <option value="ALL">Semua Stok</option>
                <option value="AVAILABLE">Stok Tersedia (&gt; 0)</option>
                <option value="EMPTY">Stok Kosong (= 0)</option>
              </select>
            </div>

            {/* Reset Button */}
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: "ALL", label: "Semua", count: inventory.length },
            {
              id: "Sewa Berjalan",
              label: "Sewa Berjalan",
              count: inventory.filter((i) => (i.status || "").toLowerCase() === "sewa berjalan").length,
            },
            {
              id: "Inventaris",
              label: "Inventaris",
              count: inventory.filter((i) => (i.status || "inventaris").toLowerCase() === "inventaris").length,
            },
            {
              id: "Sewa Selesai",
              label: "Sewa Selesai",
              count: inventory.filter((i) => (i.status || "").toLowerCase() === "sewa selesai").length,
            },
            {
              id: "Sewa Dibatalkan",
              label: "Sewa Dibatalkan",
              count: inventory.filter((i) => (i.status || "").toLowerCase() === "sewa dibatalkan").length,
            },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00753A] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No</th>

                {/* Nama Barang */}
                <th
                  onClick={() => handleSort("nama")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Barang</span>
                    {renderSortIcon("nama")}
                  </div>
                </th>

                {/* Stok */}
                <th
                  onClick={() => handleSort("stok")}
                  className="px-5 py-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Stok</span>
                    {renderSortIcon("stok")}
                  </div>
                </th>

                {/* Satuan */}
                <th
                  onClick={() => handleSort("satuan")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Satuan</span>
                    {renderSortIcon("satuan")}
                  </div>
                </th>

                {/* Vendor */}
                <th
                  onClick={() => handleSort("vendor")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vendor</span>
                    {renderSortIcon("vendor")}
                  </div>
                </th>

                {/* No SPK / PKS */}
                <th className="px-5 py-4">No. SPK / PKS</th>

                {/* Status */}
                <th
                  onClick={() => handleSort("status")}
                  className="px-5 py-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>

                {/* Aksi Column for all with edit access */}
                {canEdit && <th className="px-5 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? "8" : "7"} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Data barang tidak ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {isFilterActive
                          ? "Coba ubah kata kunci pencarian atau reset filter yang dipilih."
                          : "Belum ada master barang terdaftar. Klik 'Tambah Barang' untuk membuat baru."}
                      </p>
                      {isFilterActive && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 text-xs font-semibold text-[#00753A] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Reset Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item, idx) => {
                    const qty = item.kuantitas !== undefined ? item.kuantitas : item.stok || 0;
                    const vendorName = item.vendor_nama || item.vendor?.nama || "-";
                    const isVendorValid = vendorName && vendorName !== "-";

                    return (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* No */}
                        <td className="px-5 py-3.5 text-center text-slate-400 font-mono font-medium">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>

                        {/* Nama Barang */}
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[260px] font-semibold">{item.nama || "-"}</span>
                          </div>
                        </td>

                        {/* Stok */}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                              qty > 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                            }`}
                          >
                            {qty}
                          </span>
                        </td>

                        {/* Satuan */}
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                          {item.satuan || "Unit"}
                        </td>

                        {/* Vendor */}
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            {isVendorValid && <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            <span className={`truncate max-w-[220px] ${isVendorValid ? "font-medium" : "text-slate-400"}`}>
                              {vendorName}
                            </span>
                          </div>
                        </td>

                        {/* No SPK / PKS */}
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {item.no_spk || item.no_pks ? (
                            <div className="flex flex-col">
                              {item.no_spk && <span title="No SPK">{item.no_spk}</span>}
                              {item.no_pks && <span title="No PKS" className="text-slate-400 text-[10px]">{item.no_pks}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center">{renderStatusBadge(item.status)}</td>

                        {/* Aksi */}
                        {canEdit && (
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Barang"
                                className="p-1.5 bg-slate-100 hover:bg-[#E6F4EA] dark:bg-slate-800 dark:hover:bg-emerald-950 text-[#00753A] dark:text-emerald-400 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(item)}
                                title="Hapus Barang"
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredInventory.length / itemsPerPage) || 1}
          totalItems={filteredInventory.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Form Tambah / Edit */}
      <BarangFormModal
        isOpen={isModalOpen}
        editingInv={editingInv}
        isSaving={isSaving}
        inventory={inventory}
        vendors={vendors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Modal Konfirmasi Hapus Data */}
      <ConfirmDeleteModal
        show={Boolean(deleteTarget)}
        name={deleteTarget?.nama || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
