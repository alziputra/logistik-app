"use client";

import { useState, useEffect } from "react";
import { Search, Printer, Filter, Download, Plus, Edit, Trash2, X, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

import { db } from "../lib/firebase"; 

// --- DATA CONTOH ---
const dummyData = [
  { id: "dummy-1", idOutlet: "12458", outlet: "CP CIBINONG", produk: "EPSON L3250 ECO TANK", sn: "X8JX104470", penyedia: "PEGADAIAN", tanggalMulai: "", tanggalSelesai: "", status: "Inventaris", kondisi: "BAIK", deskripsi: "Data Contoh Firebase Kosong" },
];

export default function DataPrinter() {
  const [printerData, setPrinterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [koneksiError, setKoneksiError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [notif, setNotif] = useState({ show: false, message: "", type: "" });

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => {
      setNotif({ show: false, message: "", type: "" });
    }, 3000);
  };

  const [outletsList, setOutletsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [snList, setSnList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    idOutlet: "", outlet: "", produk: "", sn: "", penyedia: "", tanggalMulai: "", tanggalSelesai: "", status: "Inventaris", kondisi: "BAIK", deskripsi: ""
  });

  const appId = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";
  const baseRefPath = `artifacts/${appId}/public/data`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setKoneksiError(false);
      try {
        const querySnapshot = await getDocs(collection(db, baseRefPath, "printers"));
        if (querySnapshot.empty) {
          setPrinterData(dummyData);
        } else {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPrinterData(data);
        }
      } catch (error) {
        console.error("Error fetching Firebase:", error);
        setKoneksiError(true);
        setPrinterData(dummyData);
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

        const trxSnap = await getDocs(collection(db, baseRefPath, "transactions"));
        let extractedSNs = [];
        trxSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => { if (item.sn) extractedSNs.push(item.sn); });
          }
          if (data.sn) extractedSNs.push(data.sn);
        });
        setSnList([...new Set(extractedSNs)]);
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

  // ==========================================
  // [BARU] FUNGSI KALKULASI STATUS OTOMATIS
  // ==========================================
  const calculateAutoStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return "Inventaris";
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam agar akurat
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

  // ==========================================
  // [UPDATE] HANDLER PRODUK & TANGGAL
  // ==========================================
  const handleProdukChange = (e) => {
    const selectedProduk = e.target.value;
    const itemMaster = inventoryList.find(inv => inv.nama === selectedProduk);
    
    let updatedForm = { ...formData, produk: selectedProduk };

    if (itemMaster) {
      updatedForm.penyedia = itemMaster.vendor_nama || "";
      updatedForm.tanggalMulai = itemMaster.tanggal_mulai || "";
      updatedForm.tanggalSelesai = itemMaster.tanggal_selesai || "";
      // Kalkulasi status berdasarkan data dari inventory
      updatedForm.status = calculateAutoStatus(itemMaster.tanggal_mulai, itemMaster.tanggal_selesai);
    } else {
      updatedForm.penyedia = "";
      updatedForm.tanggalMulai = "";
      updatedForm.tanggalSelesai = "";
      updatedForm.status = "Inventaris";
    }

    setFormData(updatedForm);
  };

  // Jika user mengubah tanggal secara manual di form, status juga di-update
  const handleDateChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    updatedForm.status = calculateAutoStatus(updatedForm.tanggalMulai, updatedForm.tanggalSelesai);
    setFormData(updatedForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId && editingId.startsWith("dummy-")) return showNotif("Ini data contoh.", "error");

    const isOutletValid = outletsList.some(o => o.nama === formData.outlet);
    const isProdukValid = inventoryList.some(i => i.nama === formData.produk);

    if (!isOutletValid) return showNotif("Nama Outlet tidak ditemukan di Master Data.", "error");
    if (!isProdukValid) return showNotif("Produk Hardware tidak ditemukan di Master Data.", "error");

    setIsSaving(true);
    
    try {
      if (editingId) {
        await updateDoc(doc(db, baseRefPath, "printers", editingId), formData);
        setPrinterData((prevData) => 
          prevData.map((item) => 
            item.id === editingId ? { id: editingId, ...formData } : item
          )
        );
        showNotif("Perubahan data printer berhasil disimpan!", "success");
      } else {
        const docRef = await addDoc(collection(db, baseRefPath, "printers"), formData);
        const newPrinter = { id: docRef.id, ...formData };
        setPrinterData((prevData) => [newPrinter, ...prevData]);
        showNotif("Data Printer baru berhasil ditambahkan!", "success");
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Ini error aslinya:", error);
      showNotif("Gagal menyimpan data ke server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id.startsWith("dummy-")) return showNotif("Data contoh tidak dapat dihapus.", "error");
    if (window.confirm("Apakah Anda yakin ingin menghapus data printer ini?")) {
      try {
        await deleteDoc(doc(db, baseRefPath, "printers", id));
        setPrinterData(prev => prev.filter(p => p.id !== id));
        showNotif("Data printer berhasil dihapus.", "success");
      } catch (error) {
        console.error("Ini error aslinya:", error);
        showNotif("Gagal menghapus data.", "error");
      }
    }
  };

  const openModalForAdd = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (printer) => { setEditingId(printer.id); setFormData({ ...printer }); setIsModalOpen(true); };
  
  const resetForm = () => { 
    setEditingId(null); 
    setFormData({ idOutlet: "", outlet: "", produk: "", sn: "", penyedia: "", tanggalMulai: "", tanggalSelesai: "", status: "Inventaris", kondisi: "BAIK", deskripsi: "" }); 
  };

  const filteredData = printerData.filter((item) => {
    const matchesSearch = item.produk?.toLowerCase().includes(searchQuery.toLowerCase()) || item.sn?.toLowerCase().includes(searchQuery.toLowerCase()) || item.outlet?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Semua" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case "Inventaris": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
      case "Sewa Habis": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Printer className="w-6 h-6 text-blue-600" /> Manajemen Data Printer
          </h2>
          <p className="text-sm text-gray-500 mt-1">Pantau status inventaris dan masa sewa perangkat printer</p>
        </div>
        <button onClick={openModalForAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
          <Plus className="w-4 h-4" /> Tambah Printer
        </button>
      </div>

      {koneksiError && (
        <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Koneksi Database Bermasalah</p>
            <p className="text-xs mt-1">Saat ini Anda melihat <strong>data contoh statis</strong>.</p>
          </div>
        </div>
      )}

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input type="text" placeholder="Cari model, S/N, atau outlet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700">
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
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-white tracking-wider">
                <th className="p-4 font-semibold">Outlet</th>
                <th className="p-4 font-semibold">Hardware & S/N</th>
                <th className="p-4 font-semibold">Penyedia</th>
                <th className="p-4 font-semibold">Masa Sewa</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Kondisi</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="7" className="p-12 text-center text-blue-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /><p className="mt-2 text-gray-500">Memuat data...</p></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Tidak ada data printer.</td></tr>
              ) : (
                filteredData.map((printer) => (
                  <tr key={printer.id} className="hover:bg-gray-50/80 transition-colors animate-in fade-in duration-300">
                    <td className="p-4"><p className="font-semibold text-gray-800">{printer.outlet}</p><p className="text-xs text-gray-500">ID: {printer.idOutlet}</p></td>
                    <td className="p-4"><p className="font-medium text-gray-800">{printer.produk}</p><p className="text-xs text-gray-500 font-mono mt-0.5">SN: {printer.sn}</p></td>
                    <td className="p-4 font-medium text-gray-700">{printer.penyedia}</td>
                    <td className="p-4 text-gray-600 text-xs">
                      {printer.tanggalMulai || printer.tanggalSelesai 
                        ? `${formatBulanTahun(printer.tanggalMulai)} - ${formatBulanTahun(printer.tanggalSelesai)}`
                        : <span className="italic text-gray-400">Tidak ada data</span>}
                    </td>
                    <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(printer.status)}`}>{printer.status}</span></td>
                    <td className="p-4 text-center"><span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${printer.kondisi === "BAIK" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>{printer.kondisi}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModalForEdit(printer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(printer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? "Edit Data Printer" : "Tambah Printer Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="text-gray-400 hover:text-gray-600 disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Outlet</label>
                  <input required type="text" list="outlets-suggestions" value={formData.outlet} onChange={handleOutletChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" placeholder="Ketik untuk mencari outlet..." />
                  <datalist id="outlets-suggestions">
                    {outletsList.map(o => <option key={o.id} value={o.nama} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Outlet (Kode)</label>
                  <input required type="text" readOnly value={formData.idOutlet} className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed" placeholder="Otomatis terisi..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produk Hardware</label>
                  <input required type="text" list="produk-suggestions" value={formData.produk} onChange={handleProdukChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" placeholder="Ketik untuk mencari produk..." />
                  <datalist id="produk-suggestions">
                    {inventoryList.map(inv => <option key={inv.id} value={inv.nama} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number (SN)</label>
                  <input required type="text" list="sn-suggestions" value={formData.sn} onChange={(e) => setFormData({...formData, sn: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" placeholder="Ketik atau pilih SN..." />
                  <datalist id="sn-suggestions">
                    {snList.map((sn, idx) => <option key={idx} value={sn} />)}
                  </datalist>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penyedia</label>
                  <input required type="text" value={formData.penyedia} onChange={(e) => setFormData({...formData, penyedia: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" placeholder="Otomatis terisi jika ada..." />
                </div>
                
                {/* [UPDATE] onChange memanggil handleDateChange agar status ikut berubah */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai Sewa</label>
                  <input type="date" value={formData.tanggalMulai} onChange={(e) => handleDateChange("tanggalMulai", e.target.value)} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai Sewa</label>
                  <input type="date" value={formData.tanggalSelesai} onChange={(e) => handleDateChange("tanggalSelesai", e.target.value)} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" />
                </div>
                
                {/* [UPDATE] Select tetap ada, tetapi otomatis ter-update oleh state */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status (Otomatis)</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 font-medium">
                    <option value="Inventaris">Inventaris</option>
                    <option value="Sewa Berjalan">Sewa Berjalan</option>
                    <option value="Sewa Habis">Sewa Habis</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                  <select value={formData.kondisi} onChange={(e) => setFormData({...formData, kondisi: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100">
                    <option value="BAIK">BAIK</option>
                    <option value="KURANG BAIK">KURANG BAIK</option>
                    <option value="RUSAK">RUSAK</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tambahan</label>
                  <input type="text" value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} disabled={isSaving} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:bg-blue-400">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan Printer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UI CUSTOM NOTIFIKASI (TOAST) */}
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
  );
}