import { useState } from "react";
import { addTransaksi, updateTransaksi } from "../services/transaksiService";
import { addActivityLog } from "../services/activityLogService";
import { updateInventoryStock } from "../services/inventoryService";
import { findMatchingInventoryItem } from "../utils/inventoryMatcher";
import { createInitialFormData, createInitialItem } from "../constants";

export function useTransaksi({ user, transactions = [], inventory = [], setTransactions = () => {}, setInventory = () => {}, setActivityLogs = () => {}, showNotif = () => {}, navigateTo = () => {}, loadAllData = () => {} }) {
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [items, setItems] = useState(() => [createInitialItem()]);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const startNewDocument = (jenis = "Barang Keluar") => {
    const isMasuk = jenis === "Barang Masuk";
    setFormData({
      ...createInitialFormData(),
      nomorSurat: "",
      jenisTransaksi: jenis,
      tujuan: isMasuk ? "Logistik Kanwil VIII" : "",
      outletTujuan: isMasuk ? "Logistik Kanwil VIII" : "",
      pihak2Instansi: isMasuk ? "Logistik Kanwil VIII" : "",
      penerimaInstansi: isMasuk ? "Logistik Kanwil VIII" : "",
      asalOutlet: "",
      kodeOutlet: "",
    });
    setItems([createInitialItem()]);
    setActiveTransaction(null);
    navigateTo("form");
  };

  const editDocument = (trx) => {
    if (!trx) return;
    const isMasuk = trx.jenisTransaksi === "Barang Masuk";
    setActiveTransaction(trx);
    setFormData({
      id: trx.id,
      nomorSurat: trx.nomorSurat || "",
      jenisTransaksi: trx.jenisTransaksi || "Barang Keluar",
      tanggal: trx.tanggal || new Date().toISOString().split("T")[0],
      lokasi: trx.lokasi || "Jakarta",
      tujuan: isMasuk ? trx.tujuan || "Logistik Kanwil VIII" : trx.tujuan || trx.outletTujuan || trx.penerimaInstansi || "",
      outletTujuan: isMasuk ? trx.outletTujuan || "Logistik Kanwil VIII" : trx.outletTujuan || trx.tujuan || trx.penerimaInstansi || "",
      asalOutlet: trx.asalOutlet || trx.outletAsal || "",
      kodeOutlet: trx.kodeOutlet || "",
      pihak1Nama: trx.pengirimNama || trx.pihak1Nama || "",
      pengirimNama: trx.pengirimNama || trx.pihak1Nama || "",
      pihak1Jabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pengirimJabatan: trx.pengirimJabatan || trx.pihak1Jabatan || "",
      pihak1Instansi: trx.pengirimInstansi || trx.pihak1Instansi || "",
      pengirimInstansi: trx.pengirimInstansi || trx.pihak1Instansi || "",
      pihakMengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      mengetahuiNama: trx.mengetahuiNama || trx.pihakMengetahuiNama || "",
      pihakMengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      mengetahuiJabatan: trx.mengetahuiJabatan || trx.pihakMengetahuiJabatan || "",
      pihak2Nama: trx.penerimaNama || trx.pihak2Nama || "",
      penerimaNama: trx.penerimaNama || trx.pihak2Nama || "",
      pihak2Jabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
      penerimaJabatan: trx.penerimaJabatan || trx.pihak2Jabatan || "",
      pihak2Instansi: isMasuk ? "Logistik Kanwil VIII" : trx.penerimaInstansi || trx.pihak2Instansi || trx.tujuan || "",
      penerimaInstansi: isMasuk ? "Logistik Kanwil VIII" : trx.penerimaInstansi || trx.pihak2Instansi || trx.tujuan || "",
    });

    const rawItems = trx.items && trx.items.length > 0 ? trx.items : [createInitialItem()];
    const mappedItems = rawItems.map((item, idx) => ({
      id: item.id || idx + 1,
      inventoryId: item.inventoryId || null,
      namaBarang: item.namaBarang || item.nama || "",
      nama: item.nama || item.namaBarang || "",
      jumlah: Number(item.jumlah || item.kuantitas || 1),
      kuantitas: Number(item.kuantitas || item.jumlah || 1),
      satuan: item.satuan || "Unit",
      sn: item.sn || "",
      outlet: item.outlet || trx.tujuan || "",
      keterangan: item.keterangan || "",
    }));

    setItems(mappedItems);
    navigateTo("form");
  };

  const viewDocument = (trx) => {
    editDocument(trx);
    navigateTo("preview");
  };

  const addItem = () => setItems((prev) => [...prev, createInitialItem()]);

  const removeItem = (target) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item, idx) => item.id !== target && idx !== target));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Sync aliases for backward compatibility
      if (name === "tujuan" || name === "outletTujuan") {
        updated.tujuan = value;
        updated.outletTujuan = value;
        updated.pihak2Instansi = value;
        updated.penerimaInstansi = value;
      }

      if (name === "pihak1Nama") updated.pengirimNama = value;
      if (name === "pengirimNama") updated.pihak1Nama = value;
      if (name === "pihak1Jabatan") updated.pengirimJabatan = value;
      if (name === "pengirimJabatan") updated.pihak1Jabatan = value;
      if (name === "pihak1Instansi") updated.pengirimInstansi = value;
      if (name === "pengirimInstansi") updated.pihak1Instansi = value;

      if (name === "pihakMengetahuiNama") updated.mengetahuiNama = value;
      if (name === "mengetahuiNama") updated.pihakMengetahuiNama = value;
      if (name === "pihakMengetahuiJabatan") updated.mengetahuiJabatan = value;
      if (name === "mengetahuiJabatan") updated.pihakMengetahuiJabatan = value;

      if (name === "pihak2Nama") updated.penerimaNama = value;
      if (name === "penerimaNama") updated.pihak2Nama = value;
      if (name === "pihak2Jabatan") updated.penerimaJabatan = value;
      if (name === "penerimaJabatan") updated.pihak2Jabatan = value;
      if (name === "pihak2Instansi" || name === "penerimaInstansi") {
        updated.pihak2Instansi = value;
        updated.penerimaInstansi = value;
        updated.tujuan = value;
        updated.outletTujuan = value;
      }
      return updated;
    });
  };

  const handleItemChange = (target, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (item.id !== target && idx !== target) return item;
        let updated = { ...item, [field]: value };

        if (field === "namaBarang") updated.nama = value;
        if (field === "nama") updated.namaBarang = value;
        if (field === "jumlah") updated.kuantitas = Number(value);
        if (field === "kuantitas") updated.jumlah = Number(value);

        if (field === "namaBarang" || field === "nama") {
          const found = inventory.find((i) => i.nama === value || i.namaBarang === value);
          if (found) updated.satuan = found.satuan;
        }
        return updated;
      }),
    );
  };

  const handleSaveTransaction = async () => {
    if (isSaving) return;

    // 1. Cek duplikasi nomor surat di state lokal transaksi sebelum mengirim ke server
    if (formData.nomorSurat) {
      const isDuplicate = transactions.some((t) => t.nomorSurat?.trim() === formData.nomorSurat.trim() && t.id !== formData.id);

      if (isDuplicate) {
        showNotif(`Nomor Surat "${formData.nomorSurat}" sudah terdaftar pada sistem!`, "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const isMasuk = formData.jenisTransaksi === "Barang Masuk";
      const payload = {
        nomorSurat: formData.nomorSurat,
        tanggal: formData.tanggal,
        jenisTransaksi: formData.jenisTransaksi,
        tujuan: isMasuk ? "Logistik Kanwil VIII" : formData.tujuan || formData.outletTujuan || "",
        outletTujuan: isMasuk ? "Logistik Kanwil VIII" : formData.outletTujuan || formData.tujuan || "",
        asalOutlet: formData.asalOutlet || "",
        kodeOutlet: formData.kodeOutlet || "",
        penerimaNama: formData.pihak2Nama || formData.penerimaNama || "",
        penerimaJabatan: formData.pihak2Jabatan || formData.penerimaJabatan || "",
        penerimaInstansi: isMasuk ? "Logistik Kanwil VIII" : formData.tujuan || formData.outletTujuan || formData.pihak2Instansi || formData.penerimaInstansi || "",
        pengirimNama: formData.pihak1Nama || formData.pengirimNama || "",
        pengirimJabatan: formData.pihak1Jabatan || formData.pengirimJabatan || "",
        pengirimInstansi: formData.pihak1Instansi || formData.pengirimInstansi || "",
        mengetahuiNama: formData.pihakMengetahuiNama || formData.mengetahuiNama || "",
        mengetahuiJabatan: formData.pihakMengetahuiJabatan || formData.mengetahuiJabatan || "",
        lokasi: formData.lokasi || "Jakarta",
        created_at: formData.created_at || formData.createdAt || now,
        createdAt: formData.createdAt || formData.created_at || now,
        updated_at: now,
        updatedAt: now,
        items: items.map((item) => ({
          inventoryId: item.inventoryId || null,
          nama: item.namaBarang || item.nama || "",
          namaBarang: item.namaBarang || item.nama || "",
          kuantitas: Number(item.jumlah || item.kuantitas || 1),
          satuan: item.satuan || "Pcs",
          sn: item.sn || null,
          keterangan: item.keterangan || null,
          outlet: item.outlet || (isMasuk ? formData.asalOutlet || "Logistik Kanwil VIII" : formData.tujuan) || null,
        })),
      };

      let savedTrx;
      if (formData.id) {
        const res = await updateTransaksi(formData.id, payload);
        savedTrx = res?.data?.transaksi || res?.transaction || res?.data || res || { ...payload, id: formData.id };
        showNotif("Transaksi berhasil diperbarui!", "success");
      } else {
        const res = await addTransaksi(payload);
        savedTrx = res?.data?.transaksi || res?.transaction || res?.data || res || { ...payload, id: `trx_${Date.now()}` };
        showNotif("Transaksi berhasil disimpan!", "success");
      }

      // Pastikan atribut ID & timestamp terisi sempurna pada objek transaksi
      savedTrx = {
        ...payload,
        ...savedTrx,
        id: savedTrx?.id || formData.id || `trx_${Date.now()}`,
        createdAt: savedTrx?.createdAt || payload.createdAt,
        created_at: savedTrx?.created_at || payload.created_at,
        updatedAt: now,
        updated_at: now,
      };

      // Real-time Inventory Stock Synchronization
      try {
        let currentInvList = Array.isArray(inventory) ? [...inventory] : [];
        const isCurrentMasuk = payload.jenisTransaksi === "Barang Masuk" || payload.jenisTransaksi === "Surat Masuk";

        // If updating an existing transaction, first revert old transaction stock effects
        if (formData.id) {
          const oldTrx = transactions.find((t) => t.id === formData.id);
          if (oldTrx && Array.isArray(oldTrx.items)) {
            const oldIsMasuk = oldTrx.jenisTransaksi === "Barang Masuk" || oldTrx.jenisTransaksi === "Surat Masuk";
            for (const oldItm of oldTrx.items) {
              const oldQty = Number(oldItm.kuantitas || oldItm.jumlah || 1);
              if (isNaN(oldQty) || oldQty <= 0) continue;
              const matchedOldInv = findMatchingInventoryItem(oldItm, currentInvList);
              if (matchedOldInv && matchedOldInv.id) {
                const cur = Number(matchedOldInv.stok !== undefined ? matchedOldInv.stok : matchedOldInv.kuantitas) || 0;
                // Revert: if it was Keluar, restore (+); if Masuk, remove (-)
                const revertedStock = oldIsMasuk ? Math.max(0, cur - oldQty) : cur + oldQty;
                matchedOldInv.stok = revertedStock;
                matchedOldInv.kuantitas = revertedStock;
                await updateInventoryStock(matchedOldInv.id, revertedStock);
              }
            }
          }
        }

        // Apply new transaction stock changes
        for (const itm of payload.items) {
          const qty = Number(itm.kuantitas || itm.jumlah || 1);
          if (isNaN(qty) || qty <= 0) continue;
          const matchedInv = findMatchingInventoryItem(itm, currentInvList);
          if (matchedInv && matchedInv.id) {
            const cur = Number(matchedInv.stok !== undefined ? matchedInv.stok : matchedInv.kuantitas) || 0;
            // Barang Keluar reduces stock (-), Barang Masuk increases stock (+)
            const newStock = isCurrentMasuk ? cur + qty : Math.max(0, cur - qty);
            matchedInv.stok = newStock;
            matchedInv.kuantitas = newStock;
            await updateInventoryStock(matchedInv.id, newStock);
          }
        }

        if (setInventory) {
          setInventory([...currentInvList]);
        }
      } catch (stockErr) {
        console.error("Gagal sinkronisasi stok inventaris:", stockErr);
      }

      // 1. Optimistic state update: Tempatkan transaksi baru langsung di baris pertama
      setTransactions((prev) => {
        const others = (prev || []).filter((t) => t.id !== savedTrx.id && t.nomorSurat !== savedTrx.nomorSurat);
        return [savedTrx, ...others];
      });

      // 2. Set active transaction & sinkronkan formData (tetap berada di halaman preview agar user bisa langsung cetak)
      setFormData((prev) => ({
        ...prev,
        ...savedTrx,
        id: savedTrx.id,
      }));
      setActiveTransaction(savedTrx);

      // Catatan: Tidak redirect ke riwayat transaksi agar user bisa langsung klik tombol Cetak.

      // 3. Catat aktivitas transaksi ke Audit Log
      try {
        const actionType = formData.id ? "EDIT" : "BUAT";
        const currentUserName = user?.name || (user?.email === "officer@gmail.com" ? "Dio Haris Kurniawan" : user?.email === "admin@logistik.com" ? "Alzi Rahmana Putra" : user?.email?.split("@")[0] || "Petugas Logistik");

        const logEntry = {
          user: currentUserName,
          user_name: currentUserName,
          user_email: user?.email || "",
          modul: "TRANSAKSI",
          aksi: actionType,
          keterangan: `Surat ${payload.jenisTransaksi} No: ${payload.nomorSurat}`,
          timestamp: now,
        };
        addActivityLog(logEntry);
        if (setActivityLogs) {
          setActivityLogs((prev) => [logEntry, ...(prev || [])]);
        }
      } catch (logErr) {
        console.warn("Gagal mencatat log transaksi:", logErr);
      }

      // 4. Sinkronisasi database di latar belakang secara silent (tanpa loading spinner layar penuh)
      if (loadAllData) {
        loadAllData(true);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Gagal menyimpan transaksi.";
      showNotif(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    items,
    setItems,
    activeTransaction,
    setActiveTransaction,
    startNewDocument,
    editDocument,
    viewDocument,
    addItem,
    removeItem,
    handleInputChange,
    handleItemChange,
    handleSaveTransaction,
    isSaving,
  };
}
