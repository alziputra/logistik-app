// src/services/printerService.js
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { parseIndoDateToISO, calculateAutoStatus } from "../utils/deviceUtils";

const getPrinterRef = () => collection(db, "logistik", "devices", "printers");
const getPrinterDocRef = (id) => doc(db, "logistik", "devices", "printers", id);
const getOutletsRef = () => collection(db, "logistik", "master", "outlets");
const getInventoryRef = () => collection(db, "logistik", "master", "inventory");
const getTrxRef = () => collection(db, "logistik", "operations", "transactions");

// ─── READ ──────────────────────────────────────────────────────────────────

/**
 * Ambil semua data printer dari Firestore.
 */
export const fetchPrinter = async () => {
  const snap = await getDocs(getPrinterRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Ambil dropdown outlet, inventory, dan SN dari transaksi sekaligus.
 */
export const fetchDropdowns = async () => {
  const [outSnap, invSnap, trxSnap] = await Promise.all([
    getDocs(getOutletsRef()),
    getDocs(getInventoryRef()),
    getDocs(getTrxRef()),
  ]);

  // Kumpulkan SN unik dari koleksi transactions
  const snSet = new Set();
  trxSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item) => { if (item.sn) snSet.add(item.sn); });
    }
    if (data.sn) snSet.add(data.sn);
  });

  return {
    outlets:   outSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    inventory: invSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    snList:    [...snSet],
  };
};

// ─── CREATE ────────────────────────────────────────────────────────────────

/**
 * Tambah satu data printer.
 */
export const addPrinter = async (appId, formData) => {
  const data = typeof appId === "object" ? appId : formData;
  const ref = await addDoc(
    getPrinterRef(),
    data
  );
  return { id: ref.id, ...data };
};

// ─── UPDATE ────────────────────────────────────────────────────────────────

export const updatePrinter = async (appId, id, formData) => {
  const targetId = typeof appId === "string" && formData ? id : appId;
  const data = typeof appId === "string" && formData ? formData : id;
  await updateDoc(getPrinterDocRef(targetId), data);
};

// ─── DELETE ────────────────────────────────────────────────────────────────

export const deletePrinter = async (appId, id) => {
  const targetId = id || appId;
  await deleteDoc(getPrinterDocRef(targetId));
};

// ─── IMPORT CSV / EXCEL (BATCH) ────────────────────────────────────────────

/**
 * Import massal dari array data (hasil parsing PapaParse atau XLSX).
 * @returns {Promise<number>} jumlah baris yang berhasil di-import
 */
export const importPrinterCSV = async (appId, rows) => {
  const dataRows = Array.isArray(appId) ? appId : rows;
  if (!dataRows || dataRows.length === 0) throw new Error("File CSV/Excel kosong");

  const printerRef = getPrinterRef();
  const promises   = [];
  let batch        = writeBatch(db);
  let count        = 0;
  let total        = 0;

  for (const row of rows) {
    const outlet = (row.outlet || row["Outlet"] || row["NAMA OUTLET"] || row["Nama Outlet"] || "").toString().trim();
    const idOutlet = (row.idOutlet || row["ID Outlet"] || row["Outlet Id"] || row["OUTLET ID"] || "").toString().trim();
    const produk = (row.produk || row["Produk / Model"] || row["Product Hardware"] || row["PRODUK"] || row["Model"] || "").toString().trim();
    const sn = (row.sn || row["Serial Number"] || row["SERIAL NUMBER"] || row["SN"] || "").toString().trim();
    const penyedia = (row.penyedia || row["PENYEDIA"] || row["Vendor"] || row["Penyedia"] || "").toString().trim();
    const kondisi = (row.kondisi || row["KONDISI"] || row["Kondisi"] || "BAIK").toString().trim();
    let statusRaw = (row.status || row["STATUS"] || row["Status"] || "").toString().trim();
    let deskripsi = (row.deskripsi || row["DESKRIPSI"] || row["Catatan"] || "").toString().trim();
    const tglCek = (row.tglCek || row["TGL CEK"] || row["Tgl Cek"] || "").toString().trim();

    // Skip baris jika outlet dan SN dua-duanya kosong
    if (!outlet && !sn) continue;

    // Tanggal sewa
    let tglMulai = (row.tanggalMulai || row["Tgl Mulai Sewa"] || row["Tanggal Mulai"] || "").toString().trim();
    let tglSelesai = (row.tanggalSelesai || row["Tgl Selesai Sewa"] || row["Tanggal Selesai"] || "").toString().trim();

    const rawMasaSewa = (row.masaSewa || row["MASA SEWA"] || "").toString().trim();
    if (rawMasaSewa.includes("-")) {
      const [start, end] = rawMasaSewa.split("-").map((p) => p.trim());
      if (!tglMulai) tglMulai = parseIndoDateToISO(start) || start;
      if (!tglSelesai) tglSelesai = parseIndoDateToISO(end) || end;
    } else {
      if (tglMulai && tglMulai.includes(" ")) tglMulai = parseIndoDateToISO(tglMulai) || tglMulai;
      if (tglSelesai && tglSelesai.includes(" ")) tglSelesai = parseIndoDateToISO(tglSelesai) || tglSelesai;
    }

    if (tglCek && tglCek !== "-") {
      deskripsi += deskripsi ? ` | Tgl Cek: ${tglCek}` : `Tgl Cek: ${tglCek}`;
    }

    const finalStatus = statusRaw || calculateAutoStatus(tglMulai, tglSelesai) || "Inventaris";

    const data = {
      idOutlet,
      outlet,
      produk,
      sn,
      tanggalMulai: tglMulai,
      tanggalSelesai: tglSelesai,
      penyedia,
      status: finalStatus,
      kondisi: kondisi || "BAIK",
      deskripsi,
    };

    batch.set(doc(printerRef), data);
    count++;
    total++;

    if (count === 490) {
      promises.push(batch.commit());
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) promises.push(batch.commit());
  await Promise.all(promises);
  return total;
};

// ─── DOWNLOAD TEMPLATE ─────────────────────────────────────────────────────

export const downloadTemplate = () => {
  const headers = [
    "ID Outlet", "Outlet", "Produk / Model", "Serial Number",
    "Kondisi", "Vendor", "Tgl Mulai Sewa", "Tgl Selesai Sewa", "Status", "Catatan",
  ];
  const contoh = [
    '12458,"CP CIBINONG","EPSON L4260 ECO TANK",X8SS028432,KURANG BAIK,POJ,2024-04-01,2026-04-01,Sewa Berjalan,Mikro',
    '60830,"UPS GALUH MAS","LQ-310 DOT MATRIX",R9JYJ33221,BAIK,POJ,2024-04-01,2026-04-01,Sewa Berjalan,-',
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Printer.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};