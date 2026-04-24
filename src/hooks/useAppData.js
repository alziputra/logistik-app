// src/hooks/useAppData.js
// Fetch semua koleksi Firestore sekaligus
"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni    = new Date();
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth() - hariIni.getMonth())
  );
};

/**
 * Fetch semua koleksi Firestore yang dibutuhkan aplikasi dalam satu efek.
 * Hanya berjalan saat `user` tersedia (hemat kuota).
 */
export function useAppData(user, appId) {
  const [inventory, setInventory]               = useState([]);
  const [outlets, setOutlets]                   = useState([]);
  const [transactions, setTransactions]         = useState([]);
  const [printers, setPrinters]                 = useState([]);
  const [computers, setComputers]               = useState([]);
  const [notifSewa, setNotifSewa]               = useState([]);
  const [notifSewaKomputer, setNotifSewaKomputer] = useState([]);
  const [usersList, setUsersList]               = useState([]);
  const [activityLogs, setActivityLogs]         = useState([]);

  useEffect(() => {
    if (!user || !db) return;

    const safeAppId = appId || "logistikku_app_01";
    const base      = ["artifacts", safeAppId, "public", "data"];
    const col       = (name) => collection(db, ...base, name);

    const fetchAll = async () => {
      try {
        // Inventory
        const invSnap = await getDocs(col("inventory"));
        setInventory(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Transactions
        const trxSnap = await getDocs(col("transactions"));
        setTransactions(
          trxSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );

        // Outlets
        const outSnap = await getDocs(col("outlets"));
        setOutlets(
          outSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => a.nama.localeCompare(b.nama))
        );

        // Printers + notif sewa
        const printerSnap = await getDocs(col("printers"));
        const printerData = printerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPrinters(printerData);
        setNotifSewa(
          printerData
            .filter((p) => p.tanggalSelesai && p.status === "Sewa Berjalan")
            .map((p) => ({ ...p, sisaBulan: hitungSisaBulan(p.tanggalSelesai) }))
            .filter((p) => p.sisaBulan !== null && p.sisaBulan <= 3 && p.sisaBulan >= 0)
            .sort((a, b) => a.sisaBulan - b.sisaBulan)
        );

        // Computers + notif sewa
        const compSnap = await getDocs(col("computers"));
        const compData = compSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComputers(compData);
        setNotifSewaKomputer(
          compData
            .filter((c) => c.tanggalSelesai && c.status === "Sewa Berjalan")
            .map((c) => ({ ...c, sisaBulan: hitungSisaBulan(c.tanggalSelesai) }))
            .filter((c) => c.sisaBulan !== null && c.sisaBulan <= 3 && c.sisaBulan >= 0)
            .sort((a, b) => a.sisaBulan - b.sisaBulan)
        );

        // Users
        const usersSnap = await getDocs(collection(db, "users"));
        setUsersList(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Activity logs
        const logsSnap = await getDocs(col("activity_logs"));
        setActivityLogs(
          logsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
      } catch (error) {
        console.error("Gagal mengambil data dari Firebase:", error);
      }
    };

    fetchAll();
  }, [user, appId]);

  return {
    inventory, setInventory,
    outlets,
    transactions, setTransactions,
    printers,
    computers,
    notifSewa,
    notifSewaKomputer,
    usersList,
    activityLogs, setActivityLogs,
  };
}