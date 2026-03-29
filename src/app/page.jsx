"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
} from "lucide-react";

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
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";

// ✅ IMPORT COMPONENTS
import Navbar from "../components/Navbar";
import DashboardView from "../components/DashboardView";
import AdminView from "../components/AdminView";
import FormView from "../components/FormView";
import PreviewView from "../components/PreviewView";

export default function SuratSerahTerimaApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ✅ FIX: pakai factory function
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [items, setItems] = useState(() => [createInitialItem()]);

  const [activeTransaction, setActiveTransaction] = useState(null);

  const appId = process.env.NEXT_PUBLIC_APP_ID;

  // ==============================
  // AUTH
  // ==============================
  useEffect(() => {
    const initAuth = async () => {
      if (!auth) return;
      try {
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth error", e);
      }
    };

    initAuth();

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  // ==============================
  // FIRESTORE
  // ==============================
  useEffect(() => {
    if (!user || !db) return;

    const invRef = collection(db, "artifacts", appId, "public", "data", "inventory");
    const unsubInv = onSnapshot(
      invRef,
      (snap) => {
        setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      console.error
    );

    const trxRef = collection(db, "artifacts", appId, "public", "data", "transactions");
    const unsubTrx = onSnapshot(
      trxRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTransactions(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      },
      console.error
    );

    return () => {
      unsubInv();
      unsubTrx();
    };
  }, [user]);

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

  const startNewDocument = () => {
    // ✅ FIX
    setFormData({
      ...createInitialFormData(),
      nomorSurat: generateNomorSurat(),
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
      // 1. Simpan riwayat transaksi
      const trxRef = collection(db, "artifacts", appId, "public", "data", "transactions");
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
          const itemRef = doc(db, "artifacts", appId, "public", "data", "inventory", invItem.id);
          await updateDoc(itemRef, {
            stok: increment(diff),
          });
        } else {
          // JIKA BARANG BARU DITULIS MANUAL: Buatkan master barunya
          const invRef = collection(db, "artifacts", appId, "public", "data", "inventory");
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
      // 4. PERBAIKAN PATH FIREBASE
      // Gunakan fallback "logistikku_app_01" jika process.env.NEXT_PUBLIC_APP_ID kosong/undefined
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
  // RENDER
  // ==============================
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

      <Navbar view={view} setView={setView} startNewDocument={startNewDocument} />

      {view === "dashboard" && (
        <DashboardView
          transactions={transactions}
          setFormData={setFormData}
          setItems={setItems}
          setActiveTransaction={setActiveTransaction}
          setView={setView}
        />
      )}

      {view === "admin" && (
        <AdminView inventory={inventory} handleAddInventory={handleAddInventory} />
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