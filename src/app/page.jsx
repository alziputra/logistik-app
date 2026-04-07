"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

// ✅ IMPORT CONSTANTS
import { createInitialFormData, createInitialItem } from "../constants";

// ✅ IMPORT FIREBASE (Hapus onSnapshot, Ganti dengan getDocs)
import { auth, db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";

// ✅ IMPORT COMPONENTS
// import Navbar from "../components/Navbar";
// import DashboardView from "../components/DashboardView";
// import Barang from "../components/Barang";
// import FormView from "../components/FormView";
// import PreviewView from "../components/PreviewView";
// import LoginView from "../components/LoginView";
// import DataPrinter from "../components/DataPrinter";
// import DataKomputer from "../components/DataKomputer";
// import KelolaUser from "../components/KelolaUser";
// import RiwayatTransaksi from "../components/RiwayatTransaksi";
// import LogAktivitas from "../components/LogAktivitas";

// IMPORT BAWAAN NEXT.JS UNTUK LAZY LOADING
import dynamic from 'next/dynamic';

// Komponen yang langsung tampil (TIDAK di-lazy load)
import Navbar from "../components/Navbar";
import LoginView from "../components/LoginView";

// KOMPONEN YANG DI-LAZY LOAD (Hanya di-download saat menunya diklik)
const DashboardView = dynamic(() => import("../components/DashboardView"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Dashboard...</div> 
});
const Barang = dynamic(() => import("../components/Barang"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Data Barang...</div> 
});
const FormView = dynamic(() => import("../components/FormView"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Form...</div> 
});
const PreviewView = dynamic(() => import("../components/PreviewView"));
const DataPrinter = dynamic(() => import("../components/DataPrinter"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Modul Printer...</div> 
});
const DataKomputer = dynamic(() => import("../components/DataKomputer"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Modul Komputer... (QR & CSV)</div> 
});
const KelolaUser = dynamic(() => import("../components/KelolaUser"));
const RiwayatTransaksi = dynamic(() => import("../components/RiwayatTransaksi"));
const LogAktivitas = dynamic(() => import("../components/LogAktivitas"));

export default function SuratSerahTerimaApp() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [inventory, setInventory] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [printers, setPrinters] = useState([]);
  const [notifSewa, setNotifSewa] = useState([]);

  const [computers, setComputers] = useState([]);
  const [notifSewaKomputer, setNotifSewaKomputer] = useState([]);

  const [formData, setFormData] = useState(() => createInitialFormData());
  const [items, setItems] = useState(() => [createInitialItem()]);
  const [activeTransaction, setActiveTransaction] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]); 

  const appId = process.env.NEXT_PUBLIC_APP_ID;

  // ==============================
  // HELPERS
  // ==============================
  const showNotif = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  const hitungSisaBulan = (tanggalSelesai) => {
    if (!tanggalSelesai) return null;
    const hariIni = new Date();
    const tglSelesai = new Date(tanggalSelesai);
    if (isNaN(tglSelesai)) return null;
    return (
      (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
      (tglSelesai.getMonth() - hariIni.getMonth())
    );
  };

  // ==============================
  // AUTHENTICATION & ROLE LOGIC
  // ==============================
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || "user");
          } else {
            await setDoc(userRef, {
              email: currentUser.email,
              role: "user",
              created_at: new Date().toISOString(),
            });
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error mengambil role:", error);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView("dashboard");
    } catch (error) {
      showNotif("Gagal logout", "error");
    }
  };

  // ==============================
  // FITUR AUTO LOGOUT (IDLE TIMEOUT)
  // ==============================
  useEffect(() => {
    if (!user) return;
    let timeoutId;
    const IDLE_TIME = 10 * 60 * 1000;

    const handleIdleLogout = async () => {
      try {
        await signOut(auth);
        setView("dashboard");
      } catch (error) {
        showNotif("Gagal logout", "error");
      }
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleIdleLogout();
        showNotif(
          "Sesi telah habis karena tidak ada aktivitas. Silakan login kembali.",
          "error",
        );
      }, IDLE_TIME);
    };

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  // ==============================
  // OPTIMASI FIRESTORE: FETCH SEKALI SAJA (HEMAT KUOTA)
  // ==============================
  useEffect(() => {
    if (!user || !db) return;

    const safeAppId = appId || "logistikku_app_01";

    const fetchAllData = async () => {
      try {
        // 1. Inventory
        const invSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "inventory"));
        setInventory(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 2. Transactions
        const trxSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "transactions"));
        const trxData = trxSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTransactions(trxData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        // 3. Outlets
        const outSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "outlets"));
        const outData = outSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOutlets(outData.sort((a, b) => a.nama.localeCompare(b.nama)));

        // 4. Printers
        const printerSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "printers"));
        const printerData = printerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPrinters(printerData);
        const peringatanPrinter = [];
        printerData.forEach((printer) => {
          if (printer.tanggalSelesai && printer.status === "Sewa Berjalan") {
            const sisa = hitungSisaBulan(printer.tanggalSelesai);
            if (sisa !== null && sisa <= 3 && sisa >= 0) peringatanPrinter.push({ ...printer, sisaBulan: sisa });
          }
        });
        peringatanPrinter.sort((a, b) => a.sisaBulan - b.sisaBulan);
        setNotifSewa(peringatanPrinter);

        // 5. Computers
        const compSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "computers"));
        const compData = compSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComputers(compData);
        const peringatanPC = [];
        compData.forEach((comp) => {
          if (comp.tanggalSelesai && comp.status === "Sewa Berjalan") {
            const sisa = hitungSisaBulan(comp.tanggalSelesai);
            if (sisa !== null && sisa <= 3 && sisa >= 0) peringatanPC.push({ ...comp, sisaBulan: sisa });
          }
        });
        peringatanPC.sort((a, b) => a.sisaBulan - b.sisaBulan);
        setNotifSewaKomputer(peringatanPC);

        // 6. Users
        const usersSnap = await getDocs(collection(db, "users"));
        setUsersList(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 7. Activity Logs
        const logsSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "activity_logs"));
        const logsData = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setActivityLogs(logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

      } catch (error) {
        console.error("Gagal mengambil data dari Firebase:", error);
      }
    };

    fetchAllData();
  }, [user, appId]);

  // ==============================
  // PENCATATAN LOG AKTIVITAS (AUDIT TRAIL)
  // ==============================
  const logActivity = async (aksi, modul, keterangan) => {
    if (!user || !db) return;
    try {
      const safeAppId = appId || "logistikku_app_01";
      const newLogData = {
        user_email: user.email,
        aksi: aksi, 
        modul: modul, 
        keterangan: keterangan,
        timestamp: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "artifacts", safeAppId, "public", "data", "activity_logs"), newLogData);
      
      // Update UI langsung tanpa membebani Firebase
      setActivityLogs(prev => [{ id: docRef.id, ...newLogData }, ...prev]);
    } catch (e) {
      console.error("Gagal mencatat log:", e);
    }
  };

  const generateNomorSurat = () => {
    const total = transactions.length + 1;
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();
    return `${String(total).padStart(3, "0")}/00108.00/${String(bulan).padStart(2, "0")}/${tahun}`;
  };

  const startNewDocument = (jenis = "Barang Keluar") => {
    setFormData({
      ...createInitialFormData(),
      nomorSurat: generateNomorSurat(),
      jenisTransaksi: jenis,
    });
    setItems([createInitialItem()]);
    setActiveTransaction(null);
    setView("form");
  };

  const addItem = () => setItems((prev) => [...prev, createInitialItem()]);
  const removeItem = (id) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id));
  };
  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let updated = { ...item, [field]: value };
          if (field === "nama") {
            const found = inventory.find((i) => i.nama === value);
            if (found) updated.satuan = found.satuan;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  // ==============================
  // SAVE TRANSACTION
  // ==============================
  const handleSaveTransaction = async () => {
    if (!user || !db) return showNotif("Database tidak tersedia", "error");
    try {
      const safeAppId = appId || "logistikku_app_01";
      const trxRef = collection(db, "artifacts", safeAppId, "public", "data", "transactions");
      const newTrx = {
        ...formData,
        items,
        createdAt: new Date().toISOString(),
      };
      
      // 1. Simpan Transaksi
      const docRefTrx = await addDoc(trxRef, newTrx);
      // Update UI langsung
      setTransactions(prev => [{ id: docRefTrx.id, ...newTrx }, ...prev]);
      
      await logActivity("BUAT", "TRANSAKSI", `Surat ${formData.jenisTransaksi} No: ${newTrx.nomorSurat}`);

      // 2. Kalkulasi Perubahan Stok
      const aggregatedItems = {};
      for (const item of items) {
        if (!item.nama) continue;
        const key = item.nama.toLowerCase();
        if (aggregatedItems[key]) {
          aggregatedItems[key].kuantitas += Number(item.kuantitas);
        } else {
          aggregatedItems[key] = { ...item, kuantitas: Number(item.kuantitas) };
        }
      }

      // 3. Update Inventory & UI Langsung
      let updatedInventoryLocal = [...inventory];

      for (const key in aggregatedItems) {
        const item = aggregatedItems[key];
        const invIndex = updatedInventoryLocal.findIndex((i) => i.nama.toLowerCase() === item.nama.toLowerCase());
        const diff = formData.jenisTransaksi === "Barang Keluar" ? -Number(item.kuantitas) : Number(item.kuantitas);

        if (invIndex !== -1) {
          const invItem = updatedInventoryLocal[invIndex];
          const itemRef = doc(db, "artifacts", safeAppId, "public", "data", "inventory", invItem.id);
          await updateDoc(itemRef, { stok: increment(diff) });
          
          // Update State Lokal
          updatedInventoryLocal[invIndex] = { ...invItem, stok: invItem.stok + diff };
        } else {
          const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");
          const newInvItem = { nama: item.nama, stok: diff, satuan: item.satuan };
          const docRefInvan = await addDoc(invRef, newInvItem);
          
          // Update State Lokal
          updatedInventoryLocal.push({ id: docRefInvan.id, ...newInvItem });
        }
      }

      setInventory(updatedInventoryLocal);

      showNotif("Transaksi berhasil disimpan & Stok diperbarui!");
      setActiveTransaction(newTrx);
      setView("preview");
    } catch (error) {
      showNotif("Gagal menyimpan transaksi.", "error");
    }
  };

  // ==============================
  // ADD INVENTORY & OUTLET (MASTER)
  // ==============================
  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!db) return;
    const form = new FormData(e.target);
    const namaBarang = form.get("nama");
    const newInv = {
      nama: namaBarang,
      stok: Number(form.get("stok")) || 0,
      satuan: form.get("satuan") || "Pcs",
      vendor_nama: form.get("vendor_nama") || "",
      no_spk: form.get("no_spk") || "",
      no_pks: form.get("no_pks") || "",
      tanggal_mulai: form.get("tanggal_mulai") || "",
      tanggal_selesai: form.get("tanggal_selesai") || "",
      masa_sewa_bulan: Number(form.get("masa_sewa_bulan")) || 0,
      created_at: new Date().toISOString(),
    };

    if (inventory.some((i) => i.nama.toLowerCase() === namaBarang.toLowerCase())) {
      return showNotif(`Gagal: "${namaBarang}" sudah ada di Master Barang!`, "error");
    }
    try {
      const safeAppId = appId || "logistikku_app_01";
      const docRef = await addDoc(collection(db, "artifacts", safeAppId, "public", "data", "inventory"), newInv);
      
      // Update UI langsung
      setInventory(prev => [...prev, { id: docRef.id, ...newInv }]);
      await logActivity("TAMBAH", "MASTER BARANG", `Menambahkan barang baru: ${namaBarang} (${newInv.stok} ${newInv.satuan})`);
      
      showNotif("Master barang berhasil ditambahkan!");
      e.target.reset();
    } catch (error) {
      showNotif("Gagal menambah barang.", "error");
    }
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    if (!db) return;
    const form = new FormData(e.target);
    const namaOutlet = form.get("nama");
    const newOutlet = {
      kode: form.get("kode") || "-",
      nama: namaOutlet,
      created_at: new Date().toISOString(),
    };

    if (outlets.some((o) => o.nama.toLowerCase() === namaOutlet.toLowerCase())) {
      return showNotif(`Gagal: "${namaOutlet}" sudah ada di Master Outlet!`, "error");
    }
    try {
      const safeAppId = appId || "logistikku_app_01";
      const docRef = await addDoc(collection(db, "artifacts", safeAppId, "public", "data", "outlets"), newOutlet);
      
      // Update UI langsung
      setOutlets(prev => [...prev, { id: docRef.id, ...newOutlet }]);
      await logActivity("TAMBAH", "MASTER INSTANSI", `Menambahkan instansi baru: ${namaOutlet}`);
      
      showNotif("Master outlet berhasil ditambahkan!");
      e.target.reset();
    } catch (error) {
      showNotif("Gagal menambah outlet.", "error");
    }
  };

  // ==============================
  // UPDATE ROLE PENGGUNA (Hanya Admin)
  // ==============================
  const handleUpdateRole = async (userId, newRole) => {
    if (userRole !== "admin") return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update UI langsung
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await logActivity("EDIT", "MANAJEMEN AKSES", `Mengubah role pengguna menjadi ${newRole}`);
    } catch (error) {
      console.error("Gagal update role:", error);
      throw error;
    }
  };

  // ==============================
  // RENDER
  // ==============================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Memuat sistem...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-500"}`}
          >
            <span>{notification.message}</span>
          </div>
        )}
        <LoginView showNotif={showNotif} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900 pt-16 md:pt-0 md:pl-64 print:pl-0 print:pt-0">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-500"}`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      <Navbar
        view={view}
        setView={setView}
        startNewDocument={startNewDocument}
        handleLogout={handleLogout}
        notifCount={notifSewa.length + notifSewaKomputer.length}
        userRole={userRole}
      />

      {view === "dashboard" && (
        <DashboardView
          view={view}
          transactions={transactions}
          inventory={inventory}
          setFormData={setFormData}
          setItems={setItems}
          setActiveTransaction={setActiveTransaction}
          setView={setView}
          user={user}
          userRole={userRole}
          notifSewa={notifSewa}
          notifSewaKomputer={notifSewaKomputer}
          printers={printers}
          computers={computers}
        />
      )}

      {view === "riwayat" && (
        <RiwayatTransaksi
          transactions={transactions}
          setFormData={setFormData}
          setItems={setItems}
          setActiveTransaction={setActiveTransaction}
          setView={setView}
        />
      )}

      {(view === "master_barang" || view === "master_outlet") && (
        <Barang
          activeMenu={view}
          inventory={inventory}
          handleAddInventory={handleAddInventory}
          outlets={outlets}
          handleAddOutlet={handleAddOutlet}
          userRole={userRole}
        />
      )}

      {view === "form" && (
        <FormView
          formData={formData}
          handleInputChange={handleInputChange}
          items={items}
          handleItemChange={handleItemChange}
          addItem={addItem}
          removeItem={removeItem}
          setView={setView}
          inventory={inventory}
          outlets={outlets}
        />
      )}

      {view === "preview" && (
        <PreviewView
          formData={formData}
          items={items}
          activeTransaction={activeTransaction}
          setView={setView}
          handleSaveTransaction={handleSaveTransaction}
        />
      )}

      {view === "perangkat_printer" && <DataPrinter userRole={userRole} />}
      {view === "perangkat_komputer" && <DataKomputer userRole={userRole} />}

      {view === "kelola_user" && userRole === "admin" && (
        <KelolaUser usersList={usersList} handleUpdateRole={handleUpdateRole} />
      )}

      {view === "log_aktivitas" && userRole === "admin" && (
        <LogAktivitas logs={activityLogs} />
      )}

      {/* Update array halaman terlindungi */}
      {["kelola_user", "log_aktivitas"].includes(view) && userRole !== "admin" && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
          <p>Anda tidak memiliki izin (Admin) untuk mengakses halaman ini.</p>
        </div>
      )}
    </div>
  );
}