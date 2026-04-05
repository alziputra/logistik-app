"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Monitor, Filter, Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle, XCircle, Cpu, Network, HardDrive, AlertTriangle, QrCode, Printer as PrinterIcon, ChevronLeft, ChevronRight, FileSpreadsheet, Upload } from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react"; 
import Papa from "papaparse";

import { db } from "../lib/firebase"; 

export default function DataKomputer({ userRole }) {
  const [computerData, setComputerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [koneksiError, setKoneksiError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // === LOGIKA PAGINASI (10 Item Per Halaman) ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notif, setNotif] = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData] = useState(null);

  const fileInputRef = useRef(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  const [outletsList, setOutletsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    idOutlet: "", outlet: "", ipAddress: "", produk: "", sn: "", penyedia: "", 
    tanggalMulai: "", tanggalSelesai: "", status: "Inventaris", kondisi: "BAIK", 
    deskripsi: "", macAddress: "", ram: "", storage: "", cpu: "", os: ""
  });

  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";
  const baseRefPath = `artifacts/${appId}/public/data`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setKoneksiError(false);
      try {
        const querySnapshot = await getDocs(collection(db, baseRefPath, "computers"));
        if (querySnapshot.empty) {
          setComputerData([]);
        } else {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setComputerData(data);
        }
      } catch (error) {
        console.error("Error fetching Firebase:", error);
        setKoneksiError(true);
        setComputerData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const outSnap = await getDocs(collection(db, baseRefPath, "outlets"));
        setOutletsList(outSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const invSnap = await getDocs(collection(db, baseRefPath, "inventory"));
        setInventoryList(invSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
    fetchDropdownData();
  }, [appId, baseRefPath]);

  const formatBulanTahun = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const hitungSisaBulan = (tanggalSelesai) => {
    if (!tanggalSelesai) return null;
    const hariIni = new Date();
    const tglSelesai = new Date(tanggalSelesai);
    if (isNaN(tglSelesai)) return null;
    return (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 + (tglSelesai.getMonth() - hariIni.getMonth());
  };

  const calculateAutoStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const end = new Date(endDate);
    return end >= today ? "Sewa Berjalan" : "Sewa Habis";
  };

  const handleOutletChange = (e) => {
    const selectedNama = e.target.value;
    const selectedOutlet = outletsList.find(o => o.nama === selectedNama);
    setFormData({
      ...formData,
      outlet: selectedNama,
      idOutlet: selectedOutlet ? selectedOutlet.kode : ""
    });
  };

  const handleProdukChange = (e) => {
    const selectedProduk = e.target.value;
    const itemMaster = inventoryList.find(inv => inv.nama === selectedProduk);
    let updatedForm = { ...formData, produk: selectedProduk };

    if (itemMaster) {
      updatedForm.penyedia = itemMaster.vendor_nama || "";
      updatedForm.tanggalMulai = itemMaster.tanggal_mulai || "";
      updatedForm.tanggalSelesai = itemMaster.tanggal_selesai || "";
      updatedForm.status = calculateAutoStatus(itemMaster.tanggal_mulai, itemMaster.tanggal_selesai);
    } else {
      updatedForm.penyedia = "";
      updatedForm.tanggalMulai = "";
      updatedForm.tanggalSelesai = "";
      updatedForm.status = "Inventaris";
    }
    setFormData(updatedForm);
  };

  const handleDateChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    updatedForm.status = calculateAutoStatus(updatedForm.tanggalMulai, updatedForm.tanggalSelesai);
    setFormData(updatedForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, baseRefPath, "computers", editingId), formData);
        setComputerData((prev) => prev.map((item) => item.id === editingId ? { id: editingId, ...formData } : item));
        showNotif("Perubahan data komputer berhasil disimpan!", "success");
      } else {
        const docRef = await addDoc(collection(db, baseRefPath, "computers"), formData);
        const newComputer = { id: docRef.id, ...formData };
        setComputerData((prev) => [newComputer, ...prev]);
        showNotif("Data komputer baru berhasil ditambahkan!", "success");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showNotif("Gagal menyimpan data ke server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data komputer ini?")) {
      try {
        await deleteDoc(doc(db, baseRefPath, "computers", id));
        setComputerData(prev => prev.filter(p => p.id !== id));
        showNotif("Data komputer berhasil dihapus.", "success");
      } catch (error) {
        showNotif("Gagal menghapus data.", "error");
      }
    }
  };

  // ==========================================
  // FITUR: IMPORT MASSAL CSV (CUSTOM TEMPLATE)
  // ==========================================
  
  // Fungsi menterjemahkan "Januari 2025" menjadi format YYYY-MM-DD
  const parseIndoDateToISO = (dateStr) => {
    if (!dateStr) return "";
    const str = dateStr.trim().toLowerCase();
    const monthMap = {
      "januari": "01", "jan": "01", "februari": "02", "feb": "02",
      "maret": "03", "mar": "03", "april": "04", "apr": "04",
      "mei": "05", "may": "05", "juni": "06", "jun": "06",
      "juli": "07", "jul": "07", "agustus": "08", "agu": "08", "aug": "08",
      "september": "09", "sep": "09", "oktober": "10", "okt": "10", "oct": "10",
      "november": "11", "nov": "11", "desember": "12", "des": "12", "dec": "12"
    };
    
    const parts = str.split(" ");
    if (parts.length === 2) {
      const m = monthMap[parts[0]] || "01";
      const y = parts[1];
      if (y.length === 4) return `${y}-${m}-01`;
    }
    return "";
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "OUTLET ID", "NAMA OUTLET", "IP ADDRESS", "PRODUCT HARDWARE", 
      "SERIAL NUMBER", "MASA SEWA", "PENYEDIA", "STATUS", 
      "DESKRIPSI", "MAC", "RAM", "PHYSICAL DISK", "CPU", "OS NAME"
    ];
    
    // Contoh Data
    const contohData = [
      "12350,UPC BOJONG RAWALUMBU,10.81.58.23,OptiPlex SFF 7010,8B9BVZ3,April 2024 - April 2026,POJ,Sewa Berjalan,-,cc:96:e5:3f:af:e8,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian",
      "12458,CP CIBINONG,10.81.167.60,OptiPlex SFF 7010,GMYMS44,Januari 2025 - Januari 2028,EPS,Sewa Berjalan,-,4c:d7:17:9e:23:22,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian V.22 Build 2024.11.01"
    ];
    
    const csvContent = headers.join(",") + "\n" + contohData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Import_Komputer.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    showNotif("Sedang memproses dan mengunggah CSV...", "success");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const dataArray = results.data;
          if (dataArray.length === 0) throw new Error("File CSV kosong");

          let currentBatch = writeBatch(db);
          let count = 0;
          const batchPromises = [];
          const compRef = collection(db, baseRefPath, "computers");

          dataArray.forEach((row) => {
            // Cek jika baris kosong
            if (!row["NAMA OUTLET"] && !row["SERIAL NUMBER"]) return;

            const newDocRef = doc(compRef); // ID Otomatis
            
            // Logika Pemecah Masa Sewa ("April 2024 - April 2026")
            let tglMulai = "";
            let tglSelesai = "";
            const rawMasaSewa = row["MASA SEWA"]?.trim() || "";
            
            if (rawMasaSewa.includes("-")) {
              const parts = rawMasaSewa.split("-").map(p => p.trim());
              tglMulai = parseIndoDateToISO(parts[0]);
              tglSelesai = parseIndoDateToISO(parts[1]);
            }

            const pcData = {
              idOutlet: row["OUTLET ID"]?.trim() || "",
              outlet: row["NAMA OUTLET"]?.trim() || "",
              ipAddress: row["IP ADDRESS"]?.trim() || "",
              produk: row["PRODUCT HARDWARE"]?.trim() || "",
              sn: row["SERIAL NUMBER"]?.trim() || "",
              tanggalMulai: tglMulai,
              tanggalSelesai: tglSelesai,
              penyedia: row["PENYEDIA"]?.trim() || "",
              status: row["STATUS"]?.trim() || "Inventaris",
              deskripsi: row["DESKRIPSI"]?.trim() || "",
              macAddress: row["MAC"]?.trim() || "",
              ram: row["RAM"]?.trim() || "",
              storage: row["PHYSICAL DISK"]?.trim() || "",
              cpu: row["CPU"]?.trim() || "",
              os: row["OS NAME"]?.trim() || "",
              kondisi: "BAIK", // Default jika tidak ada di template
            };

            currentBatch.set(newDocRef, pcData);
            count++;

            // Batch maksimal 500
            if (count === 490) {
               batchPromises.push(currentBatch.commit());
               currentBatch = writeBatch(db);
               count = 0;
            }
          });

          if (count > 0) {
             batchPromises.push(currentBatch.commit());
          }

          await Promise.all(batchPromises); 
          
          showNotif(`Sukses! ${dataArray.length} data komputer berhasil di-import. Memuat ulang...`, "success");
          
          setTimeout(() => window.location.reload(), 2000); 

        } catch(err) {
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
      }
    });
  };

  const openModalForAdd = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (comp) => { setEditingId(comp.id); setFormData({ ...comp }); setIsModalOpen(true); };
  
  const resetForm = () => { 
    setEditingId(null); 
    setFormData({ 
      idOutlet: "", outlet: "", ipAddress: "", produk: "", sn: "", penyedia: "", 
      tanggalMulai: "", tanggalSelesai: "", status: "Inventaris", kondisi: "BAIK", 
      deskripsi: "", macAddress: "", ram: "", storage: "", cpu: "", os: "" 
    }); 
  };

  const handleSearch = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterStatus = (e) => { setFilterStatus(e.target.value); setCurrentPage(1); };

  const filteredData = computerData.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.produk?.toLowerCase().includes(query) || 
      item.sn?.toLowerCase().includes(query) || 
      item.outlet?.toLowerCase().includes(query) ||
      item.ipAddress?.toLowerCase().includes(query);
    const matchesFilter = filterStatus === "Semua" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch(status) {
      case "Inventaris": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
      case "Sewa Habis": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Monitor className="w-6 h-6 text-blue-600" /> Manajemen Data Komputer
            </h2>
            <p className="text-sm text-gray-500 mt-1">Kelola spesifikasi, jaringan, dan masa sewa perangkat komputer outlet.</p>
          </div>
          
          {userRole === "admin" && (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
                <FileSpreadsheet className="w-4 h-4" /> Template CSV
              </button>

              <button onClick={() => fileInputRef.current?.click()} disabled={isSaving} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import CSV
              </button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

              <button onClick={openModalForAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
                <Plus className="w-4 h-4" /> Tambah PC
              </button>
            </div>
          )}
        </div>

        {koneksiError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Koneksi Database Bermasalah</p>
              <p className="text-xs mt-1">Gagal terhubung ke server.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input type="text" placeholder="Cari IP, model, S/N, atau outlet..." value={searchQuery} onChange={handleSearch} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select value={filterStatus} onChange={handleFilterStatus} className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700">
                  <option value="Semua">Semua Status</option>
                  <option value="Inventaris">Inventaris</option>
                  <option value="Sewa Berjalan">Sewa Berjalan</option>
                  <option value="Sewa Habis">Sewa Habis</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1300px]">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
                  <th className="p-4 font-semibold">Lokasi / Outlet</th>
                  <th className="p-4 font-semibold">Hardware & S/N</th>
                  <th className="p-4 font-semibold">Informasi Jaringan</th>
                  <th className="p-4 font-semibold w-64">Spesifikasi Sistem</th>
                  <th className="p-4 font-semibold">Vendor & Sewa</th>
                  <th className="p-4 font-semibold text-center">Status & Kondisi</th>
                  {userRole === "admin" && <th className="p-4 font-semibold text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="7" className="p-12 text-center text-blue-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /><p className="mt-2 text-gray-500">Memuat data...</p></td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">Tidak ada data komputer ditemukan.</td></tr>
                ) : (
                  paginatedData.map((comp) => {
                    const sisaBulan = hitungSisaBulan(comp.tanggalSelesai);
                    const isExpiringSoon = comp.status === "Sewa Berjalan" && sisaBulan !== null && sisaBulan <= 3 && sisaBulan >= 0;
                    const isExpired = comp.status === "Sewa Habis";

                    let rowClass = "hover:bg-gray-50/80 transition-colors animate-in fade-in duration-300";
                    if (isExpired) rowClass = "bg-red-50/40 hover:bg-red-100/50 transition-colors";
                    else if (isExpiringSoon) rowClass = "bg-orange-50/50 hover:bg-orange-100/50 transition-colors";

                    return (
                      <tr key={comp.id} className={rowClass}>
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{comp.outlet}</p>
                          <p className="text-xs text-gray-500">ID: {comp.idOutlet}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{comp.produk}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">SN: {comp.sn}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-1"><Network className="w-3 h-3"/> {comp.ipAddress || "-"}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">MAC: {comp.macAddress || "-"}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-semibold text-gray-800 flex items-center gap-1 mb-1 truncate" title={comp.cpu}><Cpu className="w-3 h-3 text-gray-400 shrink-0"/> {comp.cpu || "-"}</p>
                          <div className="flex gap-2 text-[11px] text-gray-600 mb-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium border border-gray-200/50">RAM: {comp.ram || "-"}</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-gray-200/50"><HardDrive className="w-3 h-3"/> {comp.storage || "-"}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate" title={comp.os}>{comp.os || "OS Tidak Diketahui"}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-700 text-xs mb-1">{comp.penyedia}</p>
                          <div className={`text-[11px] flex items-center gap-1.5 ${isExpiringSoon || isExpired ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                            {comp.tanggalMulai || comp.tanggalSelesai ? `${formatBulanTahun(comp.tanggalMulai)} - ${formatBulanTahun(comp.tanggalSelesai)}` : "-"}
                            {isExpiringSoon && <AlertTriangle className="w-3 h-3 text-orange-500 shrink-0" title="Segera Habis" />}
                          </div>
                          {isExpiringSoon && <p className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-100/50 w-max px-1.5 py-0.5 rounded">Sisa {sisaBulan} bln</p>}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusBadge(comp.status)}`}>{comp.status}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${comp.kondisi === "BAIK" ? "text-green-600 bg-green-50 border-green-100" : "text-orange-600 bg-orange-50 border-orange-100"}`}>{comp.kondisi}</span>
                          </div>
                        </td>
                        {userRole === "admin" && (
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setQrModalData(comp)} title="Cetak Label QR Code" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                                <QrCode className="w-4 h-4" />
                              </button>
                              <div className="w-px h-6 bg-gray-200 my-auto mx-1"></div>
                              <button onClick={() => openModalForEdit(comp)} title="Edit Data" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(comp.id)} title="Hapus Data" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                Menampilkan <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-gray-900">{filteredData.length}</span> PC
              </span>
              <div className="flex gap-2 ml-auto">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                  Hal {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FORM TAMBAH/EDIT */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto pt-20 pb-10">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h3 className="font-bold text-lg text-gray-800">{editingId ? "Edit Data Komputer" : "Tambah PC Baru"}</h3>
                <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="text-gray-400 hover:text-gray-600 disabled:opacity-50"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* KOLOM KIRI */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-blue-600 border-b pb-2 uppercase tracking-wide">Informasi Hardware & Lokasi</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nama Outlet</label>
                        <input required type="text" list="outlets-suggestions" value={formData.outlet} onChange={handleOutletChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Pilih outlet..." />
                        <datalist id="outlets-suggestions">{outletsList.map(o => <option key={o.id} value={o.nama} />)}</datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">ID Outlet</label>
                        <input required type="text" readOnly value={formData.idOutlet} className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 outline-none text-sm" placeholder="Otomatis" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Produk / Model PC</label>
                        <input required type="text" list="produk-suggestions" value={formData.produk} onChange={handleProdukChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Misal: OptiPlex SFF 7020..." />
                        <datalist id="produk-suggestions">{inventoryList.map(inv => <option key={inv.id} value={inv.nama} />)}</datalist>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Serial Number (SN)</label>
                        <input required type="text" value={formData.sn} onChange={(e) => setFormData({...formData, sn: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="Ketik SN..." />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Kondisi</label>
                        <select value={formData.kondisi} onChange={(e) => setFormData({...formData, kondisi: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                          <option value="BAIK">BAIK</option>
                          <option value="KURANG BAIK">KURANG BAIK</option>
                          <option value="RUSAK">RUSAK</option>
                        </select>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-blue-600 border-b pb-2 pt-2 uppercase tracking-wide">Vendor & Masa Sewa</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Penyedia / Vendor</label>
                        <input required type="text" value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Otomatis atau isi manual..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Mulai Sewa</label>
                        <input type="date" value={formData.tanggalMulai} onChange={(e) => handleDateChange("tanggalMulai", e.target.value)} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tgl Selesai Sewa</label>
                        <input type="date" value={formData.tanggalSelesai} onChange={(e) => handleDateChange("tanggalSelesai", e.target.value)} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status (Otomatis)</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg bg-gray-100 outline-none text-sm font-medium">
                          <option value="Inventaris">Inventaris</option>
                          <option value="Sewa Berjalan">Sewa Berjalan</option>
                          <option value="Sewa Habis">Sewa Habis</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* KOLOM KANAN */}
                  <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-sm text-purple-600 border-b border-purple-100 pb-2 uppercase tracking-wide">Jaringan & Spesifikasi</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">IP Address</label>
                        <input type="text" value={formData.ipAddress} onChange={(e) => setFormData({...formData, ipAddress: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono text-blue-700" placeholder="10.81..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">MAC Address</label>
                        <input type="text" value={formData.macAddress} onChange={(e) => setFormData({...formData, macAddress: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono" placeholder="ac:b4:80..." />
                      </div>
                      <div className="col-span-2 mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Processor (CPU)</label>
                        <input type="text" value={formData.cpu} onChange={(e) => setFormData({...formData, cpu: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="Misal: Intel Core i5-14500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Kapasitas RAM</label>
                        <input type="text" value={formData.ram} onChange={(e) => setFormData({...formData, ram: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="Misal: 7 GB / 16 GB" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Storage / Physical Disk</label>
                        <input type="text" value={formData.storage} onChange={(e) => setFormData({...formData, storage: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="Misal: 503GB / 1TB" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Operating System (OS)</label>
                        <input type="text" value={formData.os} onChange={(e) => setFormData({...formData, os: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="Ubuntu Pegadaian V.22..." />
                      </div>
                      <div className="col-span-2 pt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                        <textarea rows="2" value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm custom-scrollbar" placeholder="Isi jika ada kerusakan atau catatan..." />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 mt-4 border-t sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50">Batal</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 disabled:bg-blue-400">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? "Simpan Perubahan PC" : "Tambahkan PC ke Database"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notif.show && (
          <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white animate-in slide-in-from-bottom-8 duration-300 ${notif.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {notif.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {notif.message}
            <button onClick={() => setNotif({ show: false, message: "", type: "" })} className="ml-2 hover:bg-white/20 p-1 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {qrModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:z-auto">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 print:border-none print:shadow-none print:p-0 print:w-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" /> Cetak Label Aset
              </h3>
              <button onClick={() => setQrModalData(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center text-center print:border-solid print:border-black print:p-4 print:rounded-none">
              <h2 className="font-extrabold text-lg text-gray-900 tracking-wide print:text-black mb-1 uppercase">
                ASET IT - KANWIL VIII JAKARTA
              </h2>
              <p className="text-xs font-bold text-gray-500 mb-5 print:text-black">{qrModalData.outlet}</p>
              
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 print:border-none print:shadow-none print:p-0 mb-4">
                <QRCodeCanvas 
                  value={`ASET LOGISTIK KANWIL VIII\n\nLokasi: ${qrModalData.outlet}\nPerangkat: ${qrModalData.produk}\nS/N: ${qrModalData.sn}\nIP: ${qrModalData.ipAddress || "-"}\nStatus: ${qrModalData.status}`} 
                  size={140} 
                  level={"M"}
                  includeMargin={true}
                />
              </div>

              <p className="font-bold text-sm text-gray-800 print:text-black">{qrModalData.produk}</p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs font-mono bg-gray-50 px-3 py-1.5 rounded-md print:bg-transparent print:p-0 print:gap-4 print:text-black">
                <p><span className="text-gray-400 font-sans print:text-gray-800">SN:</span> {qrModalData.sn}</p>
                <div className="w-1 h-1 bg-gray-300 rounded-full print:hidden"></div>
                <p><span className="text-gray-400 font-sans print:text-gray-800">IP:</span> {qrModalData.ipAddress || "-"}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 print:hidden">
              <button onClick={() => setQrModalData(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                Batal
              </button>
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
                <PrinterIcon className="w-4 h-4" /> Cetak Stiker
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}