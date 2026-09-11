import React, { useState, useMemo, useEffect } from "react";
import { History, Search, FileText, ArrowLeftRight, Eye, Edit, Trash2, Package, ArrowUpDown, ArrowUp, ArrowDown, User, Building2, MapPin } from "lucide-react";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import Pagination from "../Common/Pagination";
import { deleteTransaksi } from "../../services/transaksiService";
import { getInventory, updateInventoryStock } from "../../services/inventoryService";
import { addActivityLog } from "../../services/activityLogService";
import { findMatchingInventoryItem } from "../../utils/inventoryMatcher";
import { useNotif } from "../../hooks/useNotif";

export default function RiwayatTransaksi({
  transactions = [],
  inventory = [],
  setInventory = () => {},
  setTransactions = () => {},
  setFormData = () => {},
  setItems = () => {},
  activeTransaction = null,
  setActiveTransaction = () => {},
  setView = () => {},
  loadAllData = () => {},
  editDocument = null,
  viewDocument = null,
  user = null,
  userRole = "officer",
  setActivityLogs = () => {},
}) {
  const canCrudSurat = userRole === "admin" || userRole === "officer";
  const { showNotif } = useNotif();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTabFilter, setActiveTabFilter] = useState("all"); // "all" | "masuk" | "keluar"


  // Sorting: Default to 'tanggal' descending (terbaru paling atas)
  const [sortField, setSortField] = useState("tanggal");
  const [sortDirection, setSortDirection] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Auto focus & bersihkan pencarian ketika surat baru saja disimpan
  useEffect(() => {
    if (activeTransaction && activeTransaction.id) {
      // 1. Reset ke halaman pertama agar surat langsung tampak di baris atas
      setCurrentPage(1);

      // 2. Bersihkan pencarian lama agar tidak menyaring surat yang baru disimpan
      setSearch("");

      // 3. Pastikan tab filter menampilkan jenis surat tersebut
      const isMasuk = activeTransaction.jenisTransaksi === "Barang Masuk" || activeTransaction.jenisTransaksi === "Surat Masuk";
      if (isMasuk && activeTabFilter === "keluar") {
        setActiveTabFilter("masuk");
      } else if (!isMasuk && activeTabFilter === "masuk") {
        setActiveTabFilter("keluar");
      }

      // 4. Pastikan sorting default adalah terbaru paling atas
      setSortField("tanggal");
      setSortDirection("desc");
    }
  }, [activeTransaction?.id]);

  const countAll = transactions.length;
  const countMasuk = transactions.filter((t) => t.jenisTransaksi === "Barang Masuk" || t.jenisTransaksi === "Surat Masuk").length;
  const countKeluar = transactions.filter((t) => t.jenisTransaksi === "Barang Keluar" || t.jenisTransaksi === "Surat Keluar").length;

  const getSortTimestamp = (t) => {
    if (!t) return 0;
    const exact = t.updatedAt || t.updated_at || t.createdAt || t.created_at || t.timestamp;
    if (exact) {
      if (typeof exact.toDate === "function") return exact.toDate().getTime();
      if (exact.seconds) return exact.seconds * 1000;
      const parsed = new Date(exact).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (t.tanggal) {
      const parsed = new Date(t.tanggal).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (typeof t.id === "string") {
      const match = t.id.match(/\d{10,}/);
      if (match) return Number(match[0]);
    }
    return 0;
  };

  const filtered = useMemo(() => {
    let result = transactions.filter((t) => {
      // 1. Tab Filter
      if (activeTabFilter === "masuk") {
        const isMasuk = t.jenisTransaksi === "Barang Masuk" || t.jenisTransaksi === "Surat Masuk";
        if (!isMasuk) return false;
      } else if (activeTabFilter === "keluar") {
        const isKeluar = t.jenisTransaksi === "Barang Keluar" || t.jenisTransaksi === "Surat Keluar";
        if (!isKeluar) return false;
      }

      // 2. Search Query Filter
      const q = search.toLowerCase();
      const itemNames = (t.items || []).map((i) => (i.namaBarang || i.nama || "").toLowerCase()).join(" ");
      const itemOutlets = (t.items || []).map((i) => (i.outlet || "").toLowerCase()).join(" ");
      const penerima = `${t.penerimaNama || ""} ${t.pihak2Nama || ""} ${t.tujuan || ""} ${t.outletTujuan || ""} ${t.penerimaInstansi || ""}`.toLowerCase();
      const pengirim = `${t.pengirimNama || ""} ${t.pihak1Nama || ""} ${t.asalOutlet || ""}`.toLowerCase();

      return t.nomorSurat?.toLowerCase().includes(q) || penerima.includes(q) || pengirim.includes(q) || t.tanggal?.toLowerCase().includes(q) || itemNames.includes(q) || itemOutlets.includes(q);
    });

    // 3. Sorting by Tanggal Descending (Terbaru paling atas)
    result.sort((a, b) => {
      // Prioritas 1: Jika dokumen baru saja disimpan di sesi ini, selalu posisikan di urutan No. 1 teratas
      if (activeTransaction && activeTransaction.id) {
        if (a.id === activeTransaction.id) return -1;
        if (b.id === activeTransaction.id) return 1;
      }

      if (sortField === "tanggal") {
        const timeA = getSortTimestamp(a);
        const timeB = getSortTimestamp(b);

        if (timeA !== timeB) {
          return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
        }

        // Secondary fallback to nomorSurat with natural numeric sorting
        const numA = a.nomorSurat || "";
        const numB = b.nomorSurat || "";
        return sortDirection === "desc" ? numB.localeCompare(numA, undefined, { numeric: true, sensitivity: "base" }) : numA.localeCompare(numB, undefined, { numeric: true, sensitivity: "base" });
      }

      if (sortField === "nomorSurat") {
        const numA = a.nomorSurat || "";
        const numB = b.nomorSurat || "";
        return sortDirection === "desc" ? numB.localeCompare(numA, undefined, { numeric: true, sensitivity: "base" }) : numA.localeCompare(numB, undefined, { numeric: true, sensitivity: "base" });
      }

      return 0;
    });

    return result;
  }, [transactions, activeTabFilter, search, sortField, sortDirection, activeTransaction]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "tanggal" ? "desc" : "asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-[#00753A] dark:text-emerald-400 font-bold" /> : <ArrowDown className="w-3 h-3 text-[#00753A] dark:text-emerald-400 font-bold" />;
  };

  const handleViewLetter = (trx) => {
    if (viewDocument) {
      viewDocument(trx);
      return;
    }
    setActiveTransaction(trx);
    setFormData({
      id: trx.id,
      nomorSurat: trx.nomorSurat,
      jenisTransaksi: trx.jenisTransaksi,
      tanggal: trx.tanggal,
      lokasi: trx.lokasi || "Jakarta",
      tujuan: trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || "",
      pihak1Nama: trx.pengirimNama || trx.pihak1Nama || "",
      pihak1Jabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pihakMengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      pihakMengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      pihak2Nama: trx.penerimaNama || trx.pihak2Nama || "",
      pihak2Jabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
    });
    setItems(
      (trx.items || []).map((item, idx) => ({
        id: item.id || idx + 1,
        namaBarang: item.namaBarang || item.nama || "",
        nama: item.nama || item.namaBarang || "",
        jumlah: Number(item.jumlah || item.kuantitas || 1),
        kuantitas: Number(item.kuantitas || item.jumlah || 1),
        satuan: item.satuan || "Unit",
        sn: item.sn || "",
        outlet: item.outlet || trx.tujuan || "",
        keterangan: item.keterangan || "",
      })),
    );
    setView("preview");
  };

  const handleEditLetter = (trx) => {
    if (editDocument) {
      editDocument(trx);
      return;
    }
    setActiveTransaction(trx);
    setFormData({
      id: trx.id,
      nomorSurat: trx.nomorSurat,
      jenisTransaksi: trx.jenisTransaksi,
      tanggal: trx.tanggal,
      lokasi: trx.lokasi || "Jakarta",
      tujuan: trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || "",
      pihak1Nama: trx.pengirimNama || trx.pihak1Nama || "",
      pihak1Jabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pihakMengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      pihakMengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      pihak2Nama: trx.penerimaNama || trx.pihak2Nama || "",
      pihak2Jabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
    });
    setItems(
      (trx.items || []).map((item, idx) => ({
        id: item.id || idx + 1,
        namaBarang: item.namaBarang || item.nama || "",
        nama: item.nama || item.namaBarang || "",
        jumlah: Number(item.jumlah || item.kuantitas || 1),
        kuantitas: Number(item.kuantitas || item.jumlah || 1),
        satuan: item.satuan || "Unit",
        sn: item.sn || "",
        outlet: item.outlet || trx.tujuan || "",
        keterangan: item.keterangan || "",
      })),
    );
    setView("form");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.id) {
        // Logika Pengembalian Stok:
        // - Surat Keluar (Barang Keluar): Pengiriman dibatalkan -> Stok DIKEMBALIKAN (+) ke inventaris
        // - Surat Masuk (Barang Masuk): Penerimaan dibatalkan -> Stok DIKURANGI (-) dari inventaris
        const isMasuk = deleteTarget.jenisTransaksi === "Barang Masuk" || deleteTarget.jenisTransaksi === "Surat Masuk";

        // Pastikan daftar inventory terisi (gunakan props lokal atau ambil data fresh dari database)
        let currentInvList = Array.isArray(inventory) && inventory.length > 0 ? [...inventory] : [];
        if (currentInvList.length === 0) {
          try {
            const fresh = await getInventory();
            if (Array.isArray(fresh) && fresh.length > 0) {
              currentInvList = fresh;
            }
          } catch (fetchErr) {
            console.warn("Gagal fetch fresh inventory saat hapus transaksi:", fetchErr);
          }
        }

        // Ambil daftar barang dari transaksi yang akan dihapus
        const targetItems =
          Array.isArray(deleteTarget.items) && deleteTarget.items.length > 0
            ? deleteTarget.items
            : deleteTarget.namaBarang || deleteTarget.nama
              ? [{ namaBarang: deleteTarget.namaBarang || deleteTarget.nama, jumlah: deleteTarget.jumlah || deleteTarget.kuantitas || 1 }]
              : [];

        if (targetItems.length > 0 && currentInvList.length > 0) {
          for (const itm of targetItems) {
            const qty = Number(itm.kuantitas || itm.jumlah || 1);
            if (isNaN(qty) || qty <= 0) continue;

            const matched = findMatchingInventoryItem(itm, currentInvList);
            if (matched && matched.id) {
              const cur = Number(matched.stok !== undefined ? matched.stok : matched.kuantitas) || 0;
              // Kembalikan stok: Barang Keluar di-restore (+), Barang Masuk di-revert (-)
              const newStock = isMasuk ? Math.max(0, cur - qty) : cur + qty;
              matched.stok = newStock;
              matched.kuantitas = newStock;
              try {
                await updateInventoryStock(matched.id, newStock);
              } catch (err) {
                console.error("Gagal update stok di Firestore saat hapus transaksi:", err);
              }
            }
          }

          // Sinkronisasi state lokal inventory di React secara instan
          if (setInventory) {
            setInventory([...currentInvList]);
          }
        }

        // Hapus dokumen transaksi dari Firestore
        await deleteTransaksi(deleteTarget.id);
      }

      // Hapus transaksi dari state lokal React
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));

      // Jika transaksi yang dihapus adalah transaksi aktif, reset state-nya
      if (activeTransaction && activeTransaction.id === deleteTarget.id) {
        setActiveTransaction(null);
      }

      showNotif("Surat transaksi berhasil dihapus dan stok barang telah dikembalikan!", "success");

      // Catat aktivitas penghapusan ke Log Aktivitas Sistem
      try {
        const currentUserName = user?.name || (user?.email === "officer@gmail.com" ? "Dio Haris Kurniawan" : user?.email === "admin@logistik.com" ? "Alzi Rahmana Putra" : user?.email?.split("@")[0] || "Petugas Logistik");

        const logEntry = {
          user: currentUserName,
          user_name: currentUserName,
          user_email: user?.email || "",
          modul: "TRANSAKSI",
          aksi: "HAPUS",
          keterangan: `Menghapus Surat ${deleteTarget.jenisTransaksi || ""} No: ${deleteTarget.nomorSurat || deleteTarget.id}`,
          timestamp: new Date().toISOString(),
        };
        addActivityLog(logEntry);
        if (setActivityLogs) {
          setActivityLogs((prev) => [logEntry, ...(prev || [])]);
        }
      } catch (logErr) {
        console.warn("Gagal mencatat log hapus transaksi:", logErr);
      }

      // Sinkronisasi database di background secara silent tanpa reload layar penuh
      if (loadAllData) {
        loadAllData(true);
      }
    } catch (err) {
      console.error("Gagal menghapus surat transaksi:", err);
      showNotif("Gagal menghapus transaksi: " + (err.message || "Terjadi kesalahan"), "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const exportDataFormatted = filtered.map((t) => ({
    ...t,
    penerimaLengkap: `${t.penerimaNama || t.pihak2Nama || "-"} (${t.tujuan || t.outletTujuan || t.penerimaInstansi || "-"})`,
    rincianBarangStr: (t.items || []).map((it) => `${it.namaBarang || it.nama || "Barang"} (${it.jumlah || it.kuantitas || 1} ${it.satuan || "Unit"})`).join(", "),
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Riwayat Transaksi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daftar Berita Acara Serah Terima Barang (diurutkan terbaru paling atas).</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor / penerima / barang / outlet tujuan..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
            />
          </div>
          <ExcelActionButtons
            data={exportDataFormatted}
            fileName="Riwayat_Transaksi_Logistik"
            headersMap={{
              nomorSurat: "Nomor Surat",
              tanggal: "Tanggal",
              jenisTransaksi: "Jenis Transaksi",
              pengirimNama: "Pengirim",
              penerimaLengkap: "Penerima Barang / Tujuan",
              rincianBarangStr: "Rincian Barang",
              lokasi: "Lokasi",
            }}
            showImport={false}
          />
        </div>
      </div>

      {/* Tab Filter (Semua, Surat Masuk, Surat Keluar) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTabFilter("all");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "all" ? "bg-[#00753A] text-white shadow-md shadow-[#00753A]/30" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Semua Surat</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTabFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>{countAll}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTabFilter("masuk");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "masuk" ? "bg-[#00753A] text-white shadow-md shadow-[#00753A]/30" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Surat Masuk (Barang Masuk)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTabFilter === "masuk" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>{countMasuk}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTabFilter("keluar");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTabFilter === "keluar" ? "bg-amber-600 text-white shadow-md shadow-amber-900/30" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Surat Keluar (Barang Keluar)</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTabFilter === "keluar" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>{countKeluar}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No</th>

                {/* Sortable Nomor Surat */}
                <th onClick={() => handleSort("nomorSurat")} className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group">
                  <div className="flex items-center gap-1.5">
                    <span>Nomor Surat</span>
                    {renderSortIcon("nomorSurat")}
                  </div>
                </th>

                {/* Sortable Tanggal (Default: Newest First) */}
                <th onClick={() => handleSort("tanggal")} className="px-5 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors group">
                  <div className="flex items-center gap-1.5">
                    <span>Tanggal</span>
                    {renderSortIcon("tanggal")}
                  </div>
                </th>

                <th className="px-5 py-4">Pengirim</th>
                <th className="px-5 py-4">Penerima Barang</th>
                <th className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>Outlet Tujuan</span>
                  </div>
                </th>
                <th className="px-5 py-4">Rincian Barang</th>
                <th className="px-5 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400 italic">
                    {activeTabFilter === "masuk" ? "Belum ada riwayat surat masuk ditemukan." : activeTabFilter === "keluar" ? "Belum ada riwayat surat keluar ditemukan." : "Belum ada riwayat transaksi ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trx, idx) => {
                  const pengirimNama = trx.pengirimNama || trx.pihak1Nama || "Logistik Kanwil VIII";
                  const pengirimJabatan = trx.pengirimJabatan || trx.pihak1Jabatan || "";

                  const rawPenerima = (trx.penerimaNama || trx.pihak2Nama || "").trim();
                  const rawTujuan = (trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || trx.items?.[0]?.outlet || "").trim();

                  const hasPenerima = rawPenerima && rawPenerima !== "-" && rawPenerima !== "........................";
                  const displayPenerimaNama = hasPenerima ? rawPenerima : rawTujuan || "-";
                  const displayTujuan = hasPenerima && rawTujuan && rawTujuan !== rawPenerima ? rawTujuan : "";

                  const isRecentlySaved = Boolean(activeTransaction && trx.id && trx.id === activeTransaction.id);

                  return (
                    <tr
                      key={trx.id || idx}
                      className={`transition-all duration-300 ${
                        isRecentlySaved ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-l-[#00753A] dark:border-l-emerald-400 shadow-xs" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="px-5 py-4 text-center font-mono font-medium">
                        {isRecentlySaved ? (
                          <span className="w-5 h-5 mx-auto rounded-full bg-[#00753A] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">1</span>
                        ) : (
                          <span className="text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{trx.nomorSurat}</span>
                          {isRecentlySaved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] dark:bg-emerald-900/60 text-[#00753A] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 animate-pulse shrink-0">
                              ✨ Baru Disimpan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{trx.tanggal}</td>

                      {/* Pengirim (Pihak 1) */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 max-w-45">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{pengirimNama}</span>
                          {pengirimJabatan && <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{pengirimJabatan}</span>}
                        </div>
                      </td>

                      {/* Penerima Barang (Pihak 2 & Unit Kerja / Outlet) */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 max-w-55">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                            <User className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{displayPenerimaNama}</span>
                          </div>
                          {displayTujuan && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{displayTujuan}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Outlet Tujuan — diambil dari item.outlet per barang, grouped */}
                      <td className="px-5 py-4">
                        {(() => {
                          // Hitung jumlah item per outlet
                          const outletMap = {};
                          (trx.items || []).forEach((it) => {
                            const ol = (it.outlet || "").trim();
                            if (!ol) return;
                            outletMap[ol] = (outletMap[ol] || 0) + 1;
                          });
                          const outletEntries = Object.entries(outletMap);
                          return outletEntries.length > 0 ? (
                            <div className="flex flex-col gap-1.5 max-w-45">
                              {outletEntries.map(([ol, count], oi) => (
                                <div key={oi} className="flex items-start gap-1.5">
                                  <MapPin className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-snug break-words">{ol}</span>
                                    {count > 1 && (
                                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{count} item</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                          );
                        })()}
                      </td>

                      {/* Rincian Nama Barang & Kuantitas/Satuan — dikelompokkan by nama */}
                      <td className="px-5 py-4">
                        {trx.items && trx.items.length > 0 ? (() => {
                          // Kelompokkan item dengan nama yang sama, jumlahkan qty
                          const grouped = {};
                          (trx.items || []).forEach((it) => {
                            const nama = (it.namaBarang || it.nama || "Barang").trim();
                            const satuan = it.satuan || "Unit";
                            const key = `${nama}||${satuan}`;
                            if (!grouped[key]) {
                              grouped[key] = { nama, satuan, totalQty: 0 };
                            }
                            grouped[key].totalQty += Number(it.jumlah || it.kuantitas || 1);
                          });
                          return (
                            <div className="space-y-1">
                              {Object.values(grouped).map((g, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs">
                                  <Package className="w-3.5 h-3.5 text-[#00753A] dark:text-emerald-400 shrink-0" />
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">{g.nama}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6F4EA] dark:bg-slate-800 text-[#00753A] dark:text-emerald-400 border border-emerald-200 dark:border-slate-700">
                                    {g.totalQty} {g.satuan}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })() : (
                          <span className="text-slate-400 italic text-xs">- Tidak ada rincian -</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Lihat / Preview Surat (Icon Only) */}
                          <button
                            type="button"
                            onClick={() => handleViewLetter(trx)}
                            className="p-2 bg-slate-100 hover:bg-[#E6F4EA] dark:bg-slate-800 dark:hover:bg-emerald-950 text-[#00753A] dark:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Lihat / Cetak Surat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Surat (Icon Only) */}
                          <button
                            type="button"
                            onClick={() => handleEditLetter(trx)}
                            className="p-2 bg-slate-100 hover:bg-[#E6F4EA] dark:bg-slate-800 dark:hover:bg-emerald-950 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Edit Dokumen Surat"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Hapus Surat (Icon Only) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(trx)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Hapus Surat Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
          totalItems={filtered.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Transaksi Surat?"
        message={`Apakah Anda yakin ingin menghapus transaksi surat "${deleteTarget?.nomorSurat || "Surat Transaksi"}"? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
