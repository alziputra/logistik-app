"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, X } from "lucide-react"; // ✅ Tambah import X untuk tombol close tab

// ✅ IMPORT CONSTANTS
import { createInitialFormData, createInitialItem } from "../constants";

// ✅ IMPORT FIREBASE
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

// IMPORT BAWAAN NEXT.JS UNTUK LAZY LOADING
import dynamic from 'next/dynamic';

// Komponen yang langsung tampil (TIDAK di-lazy load)
import Navbar from "../components/Navbar";
import LoginView from "../components/LoginView";

// KOMPONEN YANG DI-LAZY LOAD
const DashboardView = dynamic(() => import("../components/Dashboard"), { 
  loading: () => <div className="p-10 text-center text-gray-500 animate-pulse">Memuat Dashboard...</div> 
});
const Barang = dynamic(() => import("../components/DataMaster"), { 
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
  
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ==============================
  // ✅ LOGIKA SISTEM TAB BROWSER
  // ==============================
  const viewTitles = {
    dashboard: "Dashboard",
    riwayat: "Riwayat Transaksi",
    master_barang: "Master Barang",
    master_outlet: "Master Instansi",
    form: "Buat Surat",
    preview: "Preview Surat",
    perangkat_printer: "Data Printer",
    perangkat_komputer: "Data PC",
    kelola_user: "Kelola Akses",
    log_aktivitas: "Log Aktivitas"
  };

  const [tabs, setTabs] = useState([{ id: "dashboard", title: "Dashboard" }]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSetView = (viewId) => {
    const isTabOpen = tabs.some((tab) => tab.id === viewId);
    if (!isTabOpen) {
      setTabs(prev => [...prev, { id: viewId, title: viewTitles[viewId] || viewId }]);
    }
    setActiveTab(viewId);
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    if (newTabs.length === 0) {
      setTabs([{ id: "dashboard", title: "Dashboard" }]);
      setActiveTab("dashboard");
    } else {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
      setTabs(newTabs);
    }
  };
  // ==============================

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
      handleSetView("dashboard"); // ✅ Update ke handleSetView
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
        handleSetView("dashboard"); // ✅ Update ke handleSetView
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ==============================
  // OPTIMASI FIRESTORE: FETCH SEKALI SAJA (HEMAT KUOTA)
  // ==============================
  useEffect(() => {
    if (!user || !db) return;

    const safeAppId = appId || "logistikku_app_01";

    const fetchAllData = async () => {
      try {
        const invSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "inventory"));
        setInventory(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const trxSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "transactions"));
        const trxData = trxSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTransactions(trxData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

        const outSnap = await getDocs(collection(db, "artifacts", safeAppId, "public", "data", "outlets"));
        const outData = outSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOutlets(outData.sort((a, b) => a.nama.localeCompare(b.nama)));

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

        const usersSnap = await getDocs(collection(db, "users"));
        setUsersList(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

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
    handleSetView("form"); // ✅ Update ke handleSetView
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
      
      const docRefTrx = await addDoc(trxRef, newTrx);
      setTransactions(prev => [{ id: docRefTrx.id, ...newTrx }, ...prev]);
      
      await logActivity("BUAT", "TRANSAKSI", `Surat ${formData.jenisTransaksi} No: ${newTrx.nomorSurat}`);

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

      let updatedInventoryLocal = [...inventory];
      for (const key in aggregatedItems) {
        const item = aggregatedItems[key];
        const invIndex = updatedInventoryLocal.findIndex((i) => i.nama.toLowerCase() === item.nama.toLowerCase());
        const diff = formData.jenisTransaksi === "Barang Keluar" ? -Number(item.kuantitas) : Number(item.kuantitas);

        if (invIndex !== -1) {
          const invItem = updatedInventoryLocal[invIndex];
          const itemRef = doc(db, "artifacts", safeAppId, "public", "data", "inventory", invItem.id);
          await updateDoc(itemRef, { stok: increment(diff) });
          updatedInventoryLocal[invIndex] = { ...invItem, stok: invItem.stok + diff };
        } else {
          const invRef = collection(db, "artifacts", safeAppId, "public", "data", "inventory");
          const newInvItem = { nama: item.nama, stok: diff, satuan: item.satuan };
          const docRefInvan = await addDoc(invRef, newInvItem);
          updatedInventoryLocal.push({ id: docRefInvan.id, ...newInvItem });
        }
      }

      setInventory(updatedInventoryLocal);

      showNotif("Transaksi berhasil disimpan & Stok diperbarui!");
      setActiveTransaction(newTrx);
      handleSetView("preview"); // ✅ Update ke handleSetView
    } catch (error) {
      showNotif("Gagal menyimpan transaksi.", "error");
    }
  };

  // ==============================
  // RENDER PADA BAGIAN TAB
  // ==============================
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat sistem...</div>;
  }

  if (!user) {
    return (
      <>
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
            <span>{notification.message}</span>
          </div>
        )}
        <LoginView showNotif={showNotif} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900 pt-16 md:pt-0 md:pl-64 print:pl-0 print:pt-0 flex flex-col">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ✅ Lempar activeTab dan handleSetView ke Navbar */}
      <Navbar
        view={activeTab}
        setView={handleSetView}
        startNewDocument={startNewDocument}
        handleLogout={handleLogout}
        notifCount={notifSewa.length + notifSewaKomputer.length}
        userRole={userRole}
      />

      {/* ==================== TAB BAR UI ==================== */}
      <div className="sticky top-16 md:top-0 z-40 bg-gray-100 border-b border-gray-200 px-4 pt-3 flex gap-1 overflow-x-auto custom-scrollbar print:hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-2 px-4 py-2 min-w-max border-t border-x rounded-t-xl cursor-pointer transition-all select-none ${
              activeTab === tab.id
                ? "bg-white border-gray-200 text-blue-700 font-bold shadow-[0_2px_0_0_white]" 
                : "bg-gray-200/50 border-transparent text-gray-500 hover:bg-gray-200"
            }`}
          >
            <span className="text-sm">{tab.title}</span>
            {tab.id !== "dashboard" && ( 
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className={`p-0.5 rounded-md transition-colors ${
                  activeTab === tab.id ? "hover:bg-blue-100 text-gray-400 hover:text-red-500" : "hover:bg-gray-300 text-gray-400"
                }`}
              >
                <X className="w-3.5 h-3.5" /> 
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ==================== CONTENT AREA ==================== */}
      <div className="flex-1 w-full bg-white relative">
        
        {tabs.some(t => t.id === "dashboard") && (
          <div className={activeTab === "dashboard" ? "block animate-in fade-in duration-300" : "hidden"}>
            <DashboardView
              transactions={transactions}
              inventory={inventory}
              setView={handleSetView} 
              user={user}
              userRole={userRole}
              notifSewa={notifSewa}
              notifSewaKomputer={notifSewaKomputer}
              printers={printers}
              computers={computers}
            />
          </div>
        )}

        {tabs.some(t => t.id === "form") && (
          <div className={activeTab === "form" ? "block animate-in fade-in duration-300" : "hidden"}>
            <FormView
              formData={formData}
              handleInputChange={handleInputChange}
              items={items}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              setView={handleSetView}
              inventory={inventory}
              outlets={outlets}
            />
          </div>
        )}

        {tabs.some(t => t.id === "master_barang") && (
          <div className={activeTab === "master_barang" ? "block animate-in fade-in duration-300" : "hidden"}>
             <Barang activeMenu="master_barang" inventory={inventory} outlets={outlets} userRole={userRole} />
          </div>
        )}

        {tabs.some(t => t.id === "master_outlet") && (
          <div className={activeTab === "master_outlet" ? "block animate-in fade-in duration-300" : "hidden"}>
             <Barang activeMenu="master_outlet" inventory={inventory} outlets={outlets} userRole={userRole} />
          </div>
        )}

        {tabs.some(t => t.id === "perangkat_printer") && (
          <div className={activeTab === "perangkat_printer" ? "block animate-in fade-in duration-300" : "hidden"}>
             <DataPrinter userRole={userRole} />
          </div>
        )}

        {tabs.some(t => t.id === "perangkat_komputer") && (
          <div className={activeTab === "perangkat_komputer" ? "block animate-in fade-in duration-300" : "hidden"}>
             <DataKomputer userRole={userRole} />
          </div>
        )}

        {tabs.some(t => t.id === "riwayat") && (
          <div className={activeTab === "riwayat" ? "block animate-in fade-in duration-300" : "hidden"}>
            <RiwayatTransaksi
              transactions={transactions}
              setFormData={setFormData}
              setItems={setItems}
              setActiveTransaction={setActiveTransaction}
              setView={handleSetView}
            />
          </div>
        )}

        {tabs.some(t => t.id === "preview") && (
          <div className={activeTab === "preview" ? "block animate-in fade-in duration-300" : "hidden"}>
            <PreviewView
              formData={formData}
              items={items}
              activeTransaction={activeTransaction}
              setView={handleSetView}
              handleSaveTransaction={handleSaveTransaction}
            />
          </div>
        )}

        {tabs.some(t => t.id === "kelola_user") && (
          <div className={activeTab === "kelola_user" ? "block animate-in fade-in duration-300" : "hidden"}>
            {userRole === "admin" ? (
              <KelolaUser usersList={usersList} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
                <p>Anda tidak memiliki izin (Admin) untuk mengakses halaman ini.</p>
              </div>
            )}
          </div>
        )}

        {tabs.some(t => t.id === "log_aktivitas") && (
          <div className={activeTab === "log_aktivitas" ? "block animate-in fade-in duration-300" : "hidden"}>
            {userRole === "admin" ? (
              <LogAktivitas logs={activityLogs} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
                <p>Anda tidak memiliki izin (Admin) untuk mengakses halaman ini.</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}