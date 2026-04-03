"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

// ✅ IMPORT CONSTANTS
import { createInitialFormData, createInitialItem } from "../constants";

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

import { onAuthStateChanged, signOut } from "firebase/auth";

// ✅ IMPORT COMPONENTS
import Navbar from "../components/Navbar";
import DashboardView from "../components/DashboardView";
import AdminView from "../components/AdminView";
import FormView from "../components/FormView";
import PreviewView from "../components/PreviewView";
import LoginView from "../components/LoginView";
// --- IMPORT KOMPONEN BARU ---
import DataPrinter from "../components/DataPrinter"; 

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

  // [BARU] State khusus untuk data Printer dan Notifikasinya
  const [printers, setPrinters] = useState([]);
  const [notifSewa, setNotifSewa] = useState([]);

  // Form Data untuk surat serah terima
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [items, setItems] = useState(() => [createInitialItem()]);

  const [activeTransaction, setActiveTransaction] = useState(null);

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

  // [BARU] Fungsi menghitung sisa bulan untuk Notifikasi Sewa
  const hitungSisaBulan = (tanggalSelesai) => {
    if (!tanggalSelesai) return null;
    
    const hariIni = new Date();
    const tglSelesai = new Date(tanggalSelesai);
    
    if (isNaN(tglSelesai)) return null;

    const selisihBulan = (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 
                       + (tglSelesai.getMonth() - hariIni.getMonth());
                       
    return selisihBulan;
  };

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
    if (!user) return;

    let timeoutId;
    const IDLE_TIME = 10 * 60 * 1000; // 10 menit

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

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

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

    // 3. Fetch Outlets / Instansi
    const outRef = collection(db, "artifacts", safeAppId, "public", "data", "outlets");
    const unsubOut = onSnapshot(outRef, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOutlets(data.sort((a, b) => a.nama.localeCompare(b.nama)));
    }, console.error);

    // 4. [BARU] Fetch Data Printer & Hitung Notifikasi Realtime
    const printerRef = collection(db, "artifacts", safeAppId, "public", "data", "printers");
    const unsubPrinter = onSnapshot(printerRef, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPrinters(data);

      const peringatan = [];
      data.forEach(printer => {
        // Hanya cek yang statusnya Sewa Berjalan dan punya tanggal selesai
        if (printer.tanggalSelesai && printer.status === "Sewa Berjalan") {
          const sisa = hitungSisaBulan(printer.tanggalSelesai);
          // Jika sisa waktu <= 3 bulan dan belum minus (masih masa sewa)
          if (sisa !== null && sisa <= 3 && sisa >= 0) {
            peringatan.push({
              ...printer,
              sisaBulan: sisa
            });
          }
        }
      });
      // Urutkan peringatan dari yang paling mendesak (sisa bulan terkecil)
      peringatan.sort((a, b) => a.sisaBulan - b.sisaBulan);
      setNotifSewa(peringatan);
    }, console.error);

    return () => {
      unsubInv();
      unsubTrx();
      unsubOut();
      unsubPrinter(); // [BARU] Bersihkan listener printer
    };
  }, [user, appId]);

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

  const addItem = () => {
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
      await addDoc(trxRef, newTrx);

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

      for (const key in aggregatedItems) {
        const item = aggregatedItems[key];

        const invItem = inventory.find(
          (i) => i.nama.toLowerCase() === item.nama.toLowerCase(),
        );

        const diff =
          formData.jenisTransaksi === "Barang Keluar"
            ? -Number(item.kuantitas)
            : Number(item.kuantitas);

        if (invItem) {
          const itemRef = doc(db, "artifacts", safeAppId, "public", "data", "inventory", invItem.id);
          await updateDoc(itemRef, {
            stok: increment(diff),
          });
        } else {
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

    const isDuplicate = inventory.some(
      (i) => i.nama.toLowerCase() === namaBarang.toLowerCase(),
    );

    if (isDuplicate) {
      return showNotif(`Gagal: "${namaBarang}" sudah ada di Master Barang!`, "error");
    }

    try {
      const safeAppId = appId || "logistikku_app_01";
      const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");

      await addDoc(invRef, newInv);
      showNotif("Master barang berhasil ditambahkan!");
      e.target.reset(); 
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

    const isDuplicate = outlets.some(
      (o) => o.nama.toLowerCase() === namaOutlet.toLowerCase(),
    );
    if (isDuplicate)
      return showNotif(`Gagal: "${namaOutlet}" sudah ada di Master Outlet!`, "error");

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

  const handleBulkImportOutlets = async (dataArray) => {
    if (!db) return;
    try {
      showNotif("Sedang mengimpor data massal... Mohon tunggu.", "success");
      const safeAppId = appId || "logistikku_app_01";
      const outRef = collection(db, "artifacts", safeAppId, "public", "data", "outlets");

      let count = 0;
      for (const item of dataArray) {
        if (!outlets.some((o) => o.nama === item.nama)) {
          await addDoc(outRef, {
            kode: item.kode,
            nama: item.nama,
            created_at: new Date().toISOString(),
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
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${
              notification.type === "success" ? "bg-green-600" : "bg-red-500"
            }`}
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
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${
            notification.type === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* [BARU] Mengirim notifSewa.length ke Navbar untuk Lonceng */}
      <Navbar
        view={view}
        setView={setView}
        startNewDocument={startNewDocument}
        handleLogout={handleLogout}
        notifCount={notifSewa.length} 
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
          notifSewa={notifSewa}
          printers={printers} // [PERBAIKAN] Menggunakan nama state yang benar, yaitu `printers`
        />
      )}

      {(view === "master_barang" || view === "master_outlet") && (
        <AdminView
          activeMenu={view}
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

      {view === "perangkat_printer" && <DataPrinter />}
    </div>
  );
}