import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Eye,
  CheckCircle2,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { addSpkPks, updateSpkPks, deleteSpkPks } from "../../services/spkPksService";
import SpkPksFormModal from "./SpkPksFormModal";
import SpkPksPreviewModal from "./SpkPksPreviewModal";
import { useNotification } from "../../context/NotificationContext";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import Pagination from "../Common/Pagination";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import { getCategoryBadgeStyle } from "../../constants/barangCategories";

export default function MasterSpkPks({
  spkList = [],
  vendors = [],
  inventory = [],
  userRole = "admin",
  loadAllData,
}) {
  const { showSuccess, showError } = useNotification();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVendor, setSelectedVendor] = useState("ALL");

  // Sort State
  const [sortField, setSortField] = useState("no_spk");
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canEdit = userRole !== "viewer";

  // Statistics calculation
  const stats = useMemo(() => {
    const totalSpk = spkList.length;
    const totalUnit = spkList.reduce((sum, item) => sum + (Number(item.jumlah || item.kuantitas) || 0), 0);
    const totalSewaPerbulan = spkList.reduce((sum, item) => {
      const sewa = item.sewa_perbulan || (Number(item.jumlah || 1) * Number(item.harga_satuan || 0));
      return sum + Number(sewa || 0);
    }, 0);
    const totalNilaiKontrak = spkList.reduce((sum, item) => {
      const total = item.total_sewa || (Number(item.sewa_perbulan || 0) * (Number(item.masa_sewa_bulan) || 1));
      return sum + Number(total || 0);
    }, 0);

    return { totalSpk, totalUnit, totalSewaPerbulan, totalNilaiKontrak };
  }, [spkList]);

  // Unique vendors for filter
  const vendorOptions = useMemo(() => {
    const vSet = new Set();
    spkList.forEach((item) => {
      const v = (item.vendor_nama || item.vendor?.nama || "").trim();
      if (v && v !== "-") vSet.add(v);
    });
    return Array.from(vSet).sort();
  }, [spkList]);

  // Filtered & Sorted SPK/PKS List
  const filteredList = useMemo(() => {
    let result = [...spkList];

    // Status Filter
    if (selectedStatus !== "ALL") {
      result = result.filter((item) => {
        const s = (item.status || "Sewa Berjalan").toUpperCase();
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

    // Multi-token Search
    if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/);
      result = result.filter((item) => {
        const spk = (item.no_spk || "").toLowerCase();
        const pks = (item.no_pks || "").toLowerCase();
        const barang = (item.nama_barang || item.nama || "").toLowerCase();
        const spek = (item.spesifikasi || "").toLowerCase();
        const vendor = (item.vendor_nama || item.vendor?.nama || "").toLowerCase();
        const ket = (item.keterangan || "").toLowerCase();

        const fullStr = `${spk} ${pks} ${barang} ${spek} ${vendor} ${ket}`;
        return tokens.every((t) => fullStr.includes(t));
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "jumlah") {
        aVal = Number(a.jumlah || a.kuantitas || 0);
        bVal = Number(b.jumlah || b.kuantitas || 0);
      } else if (sortField === "total_sewa") {
        aVal = Number(a.total_sewa || 0);
        bVal = Number(b.total_sewa || 0);
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [spkList, selectedStatus, selectedVendor, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedVendor("ALL");
    setCurrentPage(1);
  };

  const isFilterActive = searchQuery.trim() !== "" || selectedStatus !== "ALL" || selectedVendor !== "ALL";

  // CRUD handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);

    const rawVendor = (form.get("vendor_nama") || "").trim();
    const vendorVal = rawVendor === "" ? "-" : rawVendor;

    const payload = {
      no_spk: (form.get("no_spk") || "").trim(),
      no_pks: (form.get("no_pks") || "").trim(),
      nama_barang: (form.get("nama_barang") || "").trim(),
      kategori: form.get("kategori") || "IT Hardware & Komputer",
      spesifikasi: (form.get("spesifikasi") || "").trim(),
      jumlah: Number(form.get("jumlah") || 1),
      satuan: form.get("satuan") || "Unit",
      harga_satuan: Number(form.get("harga_satuan") || 0),
      sewa_perbulan: Number(form.get("sewa_perbulan") || 0),
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan") || 0),
      total_sewa: Number(form.get("total_sewa") || 0),
      terbilang: form.get("terbilang") || "",
      tanggal_mulai: form.get("tanggal_mulai") || null,
      tanggal_selesai: form.get("tanggal_selesai") || null,
      vendor_nama: vendorVal,
      status: form.get("status") || "Sewa Berjalan",
      keterangan: (form.get("keterangan") || "").trim(),
    };

    try {
      if (editingItem) {
        await updateSpkPks(editingItem.id, payload);
        showSuccess("Berhasil Memperbarui Data!", `Dokumen SPK & PKS "${payload.no_spk}" berhasil diperbarui.`);
      } else {
        await addSpkPks(payload);
        showSuccess("Berhasil Menambahkan Data!", `Dokumen SPK & PKS "${payload.no_spk}" berhasil ditambahkan.`);
      }
      setIsFormModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan SPK & PKS:", err);
      showError("Gagal Menyimpan Data", err.message || "Terjadi kesalahan saat menyimpan dokumen SPK & PKS.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSpkPks(deleteTarget.id);
      showSuccess("Berhasil Menghapus!", `Dokumen SPK "${deleteTarget.no_spk}" telah dihapus.`);
      setDeleteTarget(null);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus SPK & PKS:", err);
      showError("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus data.");
    }
  };

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
      {/* Main Header & Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Master SPK dan PKS</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  {spkList.length} Kontrak
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pencatatan Surat Perintah Kerja (SPK), Perjanjian Kerja Sama (PKS), rincian spesifikasi barang, serta nilai sewa.
              </p>
            </div>
          </div>

          {/* Action Buttons: Export/Import + Tambah */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <ExcelActionButtons
              data={filteredList}
              fileName="Master_SPK_dan_PKS_Pegadaian"
              headersMap={{
                no_spk: "No. SPK",
                no_pks: "No. PKS",
                nama_barang: "Nama Barang",
                kategori: "Kategori",
                spesifikasi: "Spesifikasi Barang",
                jumlah: "Jumlah",
                satuan: "Satuan",
                harga_satuan: "Harga Sewa Satuan",
                sewa_perbulan: "Sewa Perbulan",
                masa_sewa_bulan: "Masa Sewa (Bulan)",
                total_sewa: "Total Biaya Kontrak",
                tanggal_mulai: "Mulai Sewa",
                tanggal_selesai: "Akhir Sewa",
                vendor_nama: "Vendor",
                status: "Status Kontrak",
              }}
              onImport={async (parsedRows) => {
                if (!parsedRows || parsedRows.length === 0) return;
                let successCount = 0;
                for (const row of parsedRows) {
                  const no_spk = row.no_spk || row["No. SPK"] || row["No SPK"];
                  if (!no_spk) continue;
                  try {
                    await addSpkPks({
                      no_spk,
                      no_pks: row.no_pks || row["No. PKS"] || row["No PKS"] || "",
                      nama_barang: row.nama_barang || row["Nama Barang"] || "",
                      kategori: row.kategori || row["Kategori"] || "IT Hardware & Komputer",
                      spesifikasi: row.spesifikasi || row["Spesifikasi Barang"] || "",
                      jumlah: Number(row.jumlah || row["Jumlah"] || 1),
                      satuan: row.satuan || row["Satuan"] || "Unit",
                      harga_satuan: Number(row.harga_satuan || row["Harga Sewa Satuan"] || 0),
                      sewa_perbulan: Number(row.sewa_perbulan || row["Sewa Perbulan"] || 0),
                      masa_sewa_bulan: Number(row.masa_sewa_bulan || row["Masa Sewa (Bulan)"] || 24),
                      total_sewa: Number(row.total_sewa || row["Total Biaya Kontrak"] || 0),
                      tanggal_mulai: row.tanggal_mulai || row["Mulai Sewa"] || null,
                      tanggal_selesai: row.tanggal_selesai || row["Akhir Sewa"] || null,
                      vendor_nama: row.vendor_nama || row["Vendor"] || "-",
                      status: row.status || row["Status Kontrak"] || "Sewa Berjalan",
                    });
                    successCount++;
                  } catch (err) {
                    console.error("Error import SPK row:", err);
                  }
                }
                showSuccess("Import Excel Berhasil!", `${successCount} data SPK & PKS berhasil diimpor.`);
                if (loadAllData) loadAllData();
              }}
            />

            {canEdit && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-[#00753A] hover:bg-[#005c2e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-[#00753A]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah SPK & PKS
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari No SPK, No PKS, Nama Barang, Spesifikasi, Vendor..."
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

          <div className="flex flex-wrap items-center gap-2">
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

            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
            { id: "ALL", label: "Semua", count: spkList.length },
            {
              id: "Sewa Berjalan",
              label: "Sewa Berjalan",
              count: spkList.filter((i) => (i.status || "").toLowerCase() === "sewa berjalan").length,
            },
            {
              id: "Sewa Selesai",
              label: "Sewa Selesai",
              count: spkList.filter((i) => (i.status || "").toLowerCase() === "sewa selesai").length,
            },
            {
              id: "Segera Berakhir",
              label: "Segera Berakhir",
              count: spkList.filter((i) => (i.status || "").toLowerCase() === "segera berakhir").length,
            },
            {
              id: "Sewa Dibatalkan",
              label: "Sewa Dibatalkan",
              count: spkList.filter((i) => (i.status || "").toLowerCase() === "sewa dibatalkan").length,
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
                
                {/* No. SPK */}
                <th
                  onClick={() => handleSort("no_spk")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>No. SPK</span>
                    {renderSortIcon("no_spk")}
                  </div>
                </th>

                {/* No. PKS */}
                <th
                  onClick={() => handleSort("no_pks")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>No. PKS</span>
                    {renderSortIcon("no_pks")}
                  </div>
                </th>

                {/* Nama Barang */}
                <th
                  onClick={() => handleSort("nama_barang")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Barang</span>
                    {renderSortIcon("nama_barang")}
                  </div>
                </th>

                {/* Spesifikasi Barang */}
                <th className="px-5 py-4 min-w-[280px]">Spesifikasi / Uraian Barang</th>

                {/* Jumlah Barang */}
                <th
                  onClick={() => handleSort("jumlah")}
                  className="px-5 py-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Jumlah Barang</span>
                    {renderSortIcon("jumlah")}
                  </div>
                </th>

                {/* Nilai Sewa */}
                <th className="px-5 py-4 text-right">Harga Sewa / Bulan</th>

                {/* Mulai Sewa */}
                <th
                  onClick={() => handleSort("tanggal_mulai")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mulai Sewa</span>
                    {renderSortIcon("tanggal_mulai")}
                  </div>
                </th>

                {/* Akhir Sewa */}
                <th
                  onClick={() => handleSort("tanggal_selesai")}
                  className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Akhir Sewa</span>
                    {renderSortIcon("tanggal_selesai")}
                  </div>
                </th>

                {/* Vendor */}
                <th className="px-5 py-4">Vendor Pelaksana</th>

                {/* Status */}
                <th className="px-5 py-4 text-center">Status</th>

                {/* Aksi */}
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Data SPK & PKS tidak ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {isFilterActive
                          ? "Coba sesuaikan kata kunci pencarian atau reset filter."
                          : "Belum ada dokumen SPK dan PKS terdaftar. Klik 'Tambah SPK & PKS' untuk membuat baru."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item, idx) => {
                    const jumlah = item.jumlah || item.kuantitas || 1;
                    const hargaSatuan = item.harga_satuan || 0;
                    const sewaPerbulan = item.sewa_perbulan || jumlah * hargaSatuan;

                    return (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* No */}
                        <td className="px-5 py-3.5 text-center text-slate-400 font-mono font-medium">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>

                        {/* No SPK */}
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                            {item.no_spk || "-"}
                          </span>
                        </td>

                        {/* No PKS */}
                        <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300 text-xs">
                          {item.no_pks || "-"}
                        </td>

                        {/* Nama Barang */}
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {item.nama_barang || item.nama || "-"}
                            </span>
                            {item.kategori && (
                              <span
                                className={`w-fit inline-flex items-center px-2 py-0.2 rounded text-[10px] font-semibold border ${getCategoryBadgeStyle(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Spesifikasi Barang (Multiline/Trimmed) */}
                        <td className="px-5 py-3.5 whitespace-normal max-w-sm">
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-mono">
                            {item.spesifikasi || "-"}
                          </p>
                        </td>

                        {/* Jumlah Barang */}
                        <td className="px-5 py-3.5 text-center font-bold">
                          <span className="font-mono px-2 py-0.5 bg-emerald-50 text-[#00753A] dark:bg-emerald-950/60 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                            {jumlah} {item.satuan || "Unit"}
                          </span>
                        </td>

                        {/* Harga Sewa / Bulan */}
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          Rp {sewaPerbulan.toLocaleString("id-ID")},-
                        </td>

                        {/* Mulai Sewa */}
                        <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {item.tanggal_mulai || "-"}
                        </td>

                        {/* Akhir Sewa */}
                        <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {item.tanggal_selesai || "-"}
                        </td>

                        {/* Vendor */}
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px] font-medium">{item.vendor_nama || "-"}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.status === "Sewa Selesai"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800/50"
                                : item.status === "Sewa Dibatalkan"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800/50"
                                : item.status === "Segera Berakhir"
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800/50"
                                : "bg-[#E6F4EA] text-[#00753A] dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {item.status || "Sewa Berjalan"}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => setPreviewItem(item)}
                              title="Preview Dokumen SPK"
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {canEdit && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  title="Edit SPK & PKS"
                                  className="p-1.5 bg-slate-100 hover:bg-[#E6F4EA] dark:bg-slate-800 dark:hover:bg-emerald-950 text-[#00753A] dark:text-emerald-400 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(item)}
                                  title="Hapus SPK & PKS"
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-rose-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredList.length / itemsPerPage) || 1}
          totalItems={filteredList.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal */}
      <SpkPksFormModal
        isOpen={isFormModalOpen}
        editingItem={editingItem}
        isSaving={isSaving}
        inventory={inventory}
        vendors={vendors}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitForm}
      />

      {/* Preview Modal */}
      <SpkPksPreviewModal
        isOpen={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={Boolean(deleteTarget)}
        name={`No. SPK ${deleteTarget?.no_spk || ""}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
