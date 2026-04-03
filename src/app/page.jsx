"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

// ✅ IMPORT CONSTANTS (RELATIVE PATH)
import {
  createInitialFormData,
  createInitialItem,
} from "../constants";

// ✅ IMPORT FIREBASE
import { auth, db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// ✅ IMPORT COMPONENTS
import Navbar from "../components/Navbar";
import DashboardView from "../components/DashboardView";
import AdminView from "../components/AdminView";
import FormView from "../components/FormView";
import PreviewView from "../components/PreviewView";
import LoginView from "../components/LoginView";

export default function SuratSerahTerimaApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [inventory, setInventory] = useState([]); // State untuk menyimpan data inventory (Master Data)
  const [outlets, setOutlets] = useState([]); // State untuk menyimpan data outlet
  const [transactions, setTransactions] = useState([]); // State untuk menyimpan data transaksi (riwayat)

  // Form Data untuk surat serah terima
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [items, setItems] = useState(() => [createInitialItem()]);

  const [activeTransaction, setActiveTransaction] = useState(null);

  const appId = process.env.NEXT_PUBLIC_APP_ID;

  // ==============================
  // AUTHENTICATION LOGIC
  // ==============================
  useEffect(() => {
    if (!auth) return;
    
    // Pasang listener untuk memantau status login user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Pastikan loading selesai setelah status login diketahui
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView("dashboard"); // Kembali ke dashboard (atau bisa juga ke login) setelah logout
    } catch (error) {
      showNotif("Gagal logout", "error");
    }
  };

  // ==============================
  // FITUR AUTO LOGOUT (IDLE TIMEOUT 15 MENIT)
  // ==============================
  useEffect(() => {
    // Jika belum ada user yang login, tidak perlu pasang timer
    if (!user) return;

    let timeoutId;
    // 15 menit = 15 * 60 detik * 1000 milidetik = 900.000 ms
    // const IDLE_TIME = 5* 1000; // Untuk testing, set ke 5 detik saja 
    const IDLE_TIME = 10 * 60 * 1000; // 10 menit

    const resetTimer = () => {
      // Bersihkan timer yang sudah ada
      if (timeoutId) clearTimeout(timeoutId);
      
      // Pasang timer baru
      timeoutId = setTimeout(() => {
        handleLogout(); // Logout otomatis setelah idle
        showNotif("Sesi telah habis karena tidak ada aktivitas. Silakan login kembali.", "error");
      }, IDLE_TIME);
    };

    //
    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    
    // Pasang event listener untuk berbagai aktivitas user
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Jalankan timer untuk pertama kalinya saat login
    resetTimer();

    // Bersihkan event listener dan timer saat komponen unmount atau saat user logout
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]); // Pasang efek ini setiap kali status user berubah (login/logout)

  // ==============================
  // FIRESTORE (Data Fetching)
  // ==============================
  useEffect(() => {
    if (!user || !db) return;

    const safeAppId = appId || "logistikku_app_01";

    // 1. Fetch Inventory
    const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");
    const unsubInv = onSnapshot(invRef, (snap) => {
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, console.error);

    // 2. Fetch Transactions
    const trxRef = collection(db, "artifacts", safeAppId, "public", "data", "transactions");
    const unsubTrx = onSnapshot(trxRef, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, console.error);

    // 3. Fetch Outlets / Instansi (TAMBAHKAN BLOK INI)
    const outRef = collection(db, "artifacts", safeAppId, "public", "data", "outlets");
    const unsubOut = onSnapshot(outRef, (snap) => {
      // Urutkan berdasarkan nama outlet abjad A-Z
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOutlets(data.sort((a, b) => a.nama.localeCompare(b.nama)));
    }, console.error);

    return () => {
      unsubInv();
      unsubTrx();
      unsubOut(); // <--- JANGAN LUPA DIBERSIHKAN
    };
  }, [user, appId]);

  // ==============================
  // HELPERS
  // ==============================
  const showNotif = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3500
    );
  };

  const generateNomorSurat = () => {
    const total = transactions.length + 1;
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();

    return `${String(total).padStart(3, "0")}/00108.00/${String(bulan).padStart(2, "0")}/${tahun}`;
  };

  const startNewDocument = (jenis = "Barang Keluar") => { // <--- Terima parameter jenis transaksi
    setFormData({
      ...createInitialFormData(),
      nomorSurat: generateNomorSurat(),
      jenisTransaksi: jenis, // <--- Set jenis transaksi sesuai parameter yang diterima
    });

    setItems([createInitialItem()]);
    setActiveTransaction(null);
    setView("form");
  };

  const addItem = () => {
    // ✅ FIX
    setItems((prev) => [...prev, createInitialItem()]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      })
    );
  };

  // ==============================
  // SAVE TRANSACTION
  // ==============================
  const handleSaveTransaction = async () => {
    if (!user || !db) return showNotif("Database tidak tersedia", "error");

    try {
      const safeAppId = appId || "logistikku_app_01";
      
      // 1. Simpan riwayat transaksi
      const trxRef = collection(db, "artifacts", safeAppId, "public", "data", "transactions");
      const newTrx = {
        ...formData,
        items, // Tetap simpan array 'items' asli agar S/N tercatat satu per satu
        createdAt: new Date().toISOString(),
      };
      await addDoc(trxRef, newTrx);

      // 2. AGREGASI (Gabungkan kuantitas untuk barang dengan nama yang sama)
      const aggregatedItems = {};
      for (const item of items) {
        if (!item.nama) continue;
        const key = item.nama.toLowerCase();
        
        if (aggregatedItems[key]) {
          aggregatedItems[key].kuantitas += Number(item.kuantitas);
        } else {
          // Buat salinan (copy) agar tidak merusak data asli
          aggregatedItems[key] = { ...item, kuantitas: Number(item.kuantitas) };
        }
      }

      // 3. Update stok di database Firebase
      for (const key in aggregatedItems) {
        const item = aggregatedItems[key];
        
        // Cari apakah barang ada di Master Data
        const invItem = inventory.find(
          (i) => i.nama.toLowerCase() === item.nama.toLowerCase()
        );

        // Tentukan nilai plus/minus
        const diff =
          formData.jenisTransaksi === "Barang Keluar"
            ? -Number(item.kuantitas)
            : Number(item.kuantitas);

        if (invItem) {
          // JIKA BARANG SUDAH ADA: Gunakan increment() agar aman dari bentrok
          const itemRef = doc(db, "artifacts", safeAppId, "public", "data", "inventory", invItem.id);
          await updateDoc(itemRef, {
            stok: increment(diff),
          });
        } else {
          // JIKA BARANG BARU DITULIS MANUAL: Buatkan master barunya
          const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");
          await addDoc(invRef, {
            nama: item.nama,
            stok: diff, 
            satuan: item.satuan,
          });
        }
      }

      showNotif("Transaksi berhasil disimpan & Stok diperbarui!");
      setActiveTransaction(newTrx);
      setView("preview");
    } catch (error) {
      console.error(error);
      showNotif("Gagal menyimpan transaksi.", "error");
    }
  };

  // ==============================
  // ADD INVENTORY (MASTER)
  // ==============================
  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!db) return;
    
    // 1. Tangkap semua isian form
    const form = new FormData(e.target);
    const namaBarang = form.get("nama");
    
    // 2. Susun data baru (termasuk data vendor dan kontrak)
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

    // 3. CEK DUPLIKAT: Jangan biarkan admin membuat 2 barang dengan nama sama
    const isDuplicate = inventory.some(
      (i) => i.nama.toLowerCase() === namaBarang.toLowerCase()
    );

    if (isDuplicate) {
      return showNotif(`Gagal: "${namaBarang}" sudah ada di Master Barang!`, "error");
    }

    try {
      // 4. Gunakan fallback appId
      const safeAppId = appId || "logistikku_app_01";
      
      const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");
      
      // 5. Simpan ke Firebase
      await addDoc(invRef, newInv);
      
      showNotif("Master barang berhasil ditambahkan!");
      e.target.reset(); // Kosongkan form setelah berhasil
      
    } catch (error) {
      console.error("Firebase Error:", error);
      showNotif("Gagal menambah barang. Cek koneksi atau aturan Firebase.", "error");
    }
  };

  // ==============================
  // ADD OUTLET (MASTER)
  // ==============================
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

    const isDuplicate = outlets.some((o) => o.nama.toLowerCase() === namaOutlet.toLowerCase());
    if (isDuplicate) return showNotif(`Gagal: "${namaOutlet}" sudah ada di Master Outlet!`, "error");

    try {
      const safeAppId = appId || "logistikku_app_01";
      const outRef = collection(db, "artifacts", safeAppId, "public", "data", "outlets");
      await addDoc(outRef, newOutlet);
      showNotif("Master outlet berhasil ditambahkan!");
      e.target.reset();
    } catch (error) {
      console.error(error);
      showNotif("Gagal menambah outlet.", "error");
    }
  };

  // FUNGSI RAHASIA UNTUK BULK IMPORT 1 KLIK
  const handleBulkImportOutlets = async (dataArray) => {
    if (!db) return;
    try {
      showNotif("Sedang mengimpor data massal... Mohon tunggu.", "success");
      const safeAppId = appId || "logistikku_app_01";
      const outRef = collection(db, "artifacts", safeAppId, "public", "data", "outlets");
      
      let count = 0;
      for (const item of dataArray) {
        // Cek duplikat agar tidak dobel jika diklik 2 kali
        if (!outlets.some(o => o.nama === item.nama)) {
          await addDoc(outRef, {
            kode: item.kode,
            nama: item.nama,
            created_at: new Date().toISOString()
          });
          count++;
        }
      }
      showNotif(`Berhasil mengimpor ${count} data outlet baru!`, "success");
    } catch (error) {
      console.error(error);
      showNotif("Gagal mengimpor data massal.", "error");
    }
  };

  // ==============================
  // RENDER
  // ==============================
  // Mencegah layar berkedip saat mengecek status login
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat sistem...</div>;
  }

  // Jika belum login, tampilkan layar Login
  if (!user) {
    return (
      <>
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-500"
          }`}>
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
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${
          notification.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/*  Menambahkan handleLogout ke Navbar */}
      <Navbar 
        view={view} 
        setView={setView} 
        startNewDocument={startNewDocument} 
        handleLogout={handleLogout} 
      />

      {(view === "dashboard" || view === "riwayat") && (
        <DashboardView
          view={view}
          transactions={transactions}
          inventory={inventory}
          setFormData={setFormData}
          setItems={setItems}
          setActiveTransaction={setActiveTransaction}
          setView={setView}
          user={user}
        />
      )}

      {(view === "master_barang" || view === "master_outlet") && (
        <AdminView 
          activeMenu={view} // Kirimkan view yang sedang aktif agar AdminView tahu tab mana yang harus dirender
          inventory={inventory} 
          handleAddInventory={handleAddInventory}
          outlets={outlets}
          handleAddOutlet={handleAddOutlet}
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
    </div>
  );
}