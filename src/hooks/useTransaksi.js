// src/hooks/useTransaksi.js
// Form surat, generate nomor, log aktivitas, save + update stok
"use client";

import { useState } from "react";
import { db } from "../lib/firebase";
import {
  collection, addDoc, doc, updateDoc, increment,
} from "firebase/firestore";
import { createInitialFormData, createInitialItem } from "../constants";

/**
 * Menangani:
 * - State formData & items untuk form surat
 * - Generate nomor surat
 * - Pencatatan log aktivitas
 * - Simpan transaksi + update stok inventory
 */
export function useTransaksi({
  user,
  appId,
  transactions,
  inventory,
  setTransactions,
  setInventory,
  setActivityLogs,
  showNotif,
  navigateTo,   // fungsi (viewId) => void, untuk navigasi setelah aksi
}) {
  const safeAppId = appId || "logistikku_app_01";
  const base      = ["artifacts", safeAppId, "public", "data"];
  const col       = (name) => collection(db, ...base, name);

  const [formData, setFormData]               = useState(() => createInitialFormData());
  const [items, setItems]                     = useState(() => [createInitialItem()]);
  const [activeTransaction, setActiveTransaction] = useState(null);

  // ── Log aktivitas ──────────────────────────────────────────────────────
  const logActivity = async (aksi, modul, keterangan) => {
    if (!user || !db) return;
    try {
      const newLogData = {
        user_email: user.email,
        aksi,
        modul,
        keterangan,
        timestamp: new Date().toISOString(),
      };
      const docRef = await addDoc(col("activity_logs"), newLogData);
      setActivityLogs((prev) => [{ id: docRef.id, ...newLogData }, ...prev]);
    } catch (e) {
      console.error("Gagal mencatat log:", e);
    }
  };

  // ── Generate nomor surat ───────────────────────────────────────────────
  const generateNomorSurat = () => {
    const total = transactions.length + 1;
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();
    return `${String(total).padStart(3, "0")}/00108.00/${String(bulan).padStart(2, "0")}/${tahun}`;
  };

  // ── Mulai dokumen baru ─────────────────────────────────────────────────
  const startNewDocument = (jenis = "Barang Keluar") => {
    setFormData({
      ...createInitialFormData(),
      nomorSurat: generateNomorSurat(),
      jenisTransaksi: jenis,
    });
    setItems([createInitialItem()]);
    setActiveTransaction(null);
    navigateTo("form");
  };

  // ── Handler input ──────────────────────────────────────────────────────
  const addItem = () =>
    setItems((prev) => [...prev, createInitialItem()]);

  const removeItem = (id) => {
    if (items.length > 1)
      setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, [field]: value };
        if (field === "nama") {
          const found = inventory.find((i) => i.nama === value);
          if (found) updated.satuan = found.satuan;
        }
        return updated;
      })
    );
  };

  // ── Simpan transaksi ───────────────────────────────────────────────────
  const handleSaveTransaction = async () => {
    if (!user || !db) return showNotif("Database tidak tersedia", "error");

    try {
      const newTrx = {
        ...formData,
        items,
        createdAt: new Date().toISOString(),
      };

      const docRefTrx = await addDoc(col("transactions"), newTrx);
      setTransactions((prev) => [{ id: docRefTrx.id, ...newTrx }, ...prev]);

      await logActivity(
        "BUAT",
        "TRANSAKSI",
        `Surat ${formData.jenisTransaksi} No: ${newTrx.nomorSurat}`
      );

      // Agregasi item sebelum update stok
      const aggregated = {};
      for (const item of items) {
        if (!item.nama) continue;
        const key = item.nama.toLowerCase();
        if (aggregated[key]) aggregated[key].kuantitas += Number(item.kuantitas);
        else aggregated[key] = { ...item, kuantitas: Number(item.kuantitas) };
      }

      let updatedInv = [...inventory];
      for (const key in aggregated) {
        const item = aggregated[key];
        const diff =
          formData.jenisTransaksi === "Barang Keluar"
            ? -Number(item.kuantitas)
            :  Number(item.kuantitas);

        const invIdx = updatedInv.findIndex(
          (i) => i.nama.toLowerCase() === item.nama.toLowerCase()
        );

        if (invIdx !== -1) {
          const invItem = updatedInv[invIdx];
          const itemRef = doc(db, ...base, "inventory", invItem.id);
          await updateDoc(itemRef, { stok: increment(diff) });
          updatedInv[invIdx] = { ...invItem, stok: invItem.stok + diff };
        } else {
          const newInvItem = { nama: item.nama, stok: diff, satuan: item.satuan };
          const docRefInv  = await addDoc(col("inventory"), newInvItem);
          updatedInv.push({ id: docRefInv.id, ...newInvItem });
        }
      }

      setInventory(updatedInv);
      setActiveTransaction(newTrx);
      showNotif("Transaksi berhasil disimpan & Stok diperbarui!");
      navigateTo("preview");
    } catch (error) {
      console.error(error);
      showNotif("Gagal menyimpan transaksi.", "error");
    }
  };

  return {
    formData, setFormData,
    items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument,
    addItem, removeItem,
    handleInputChange, handleItemChange,
    handleSaveTransaction,
    logActivity,
  };
}