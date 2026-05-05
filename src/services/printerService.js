// src/services/printerService.js
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { parseIndoDateToISO } from "../utils/deviceUtils";

const getBaseRef = (appId) => {
  const id = appId || process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";
  return `artifacts/${id}/public/data`;
};

// ─── READ ──────────────────────────────────────────────────────────────────

/**
 * Ambil semua data printer dari Firestore.
 */
export const fetchPrinter = async (appId) => {
  const snap = await getDocs(collection(db, getBaseRef(appId), "printers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Ambil dropdown outlet, inventory, dan SN dari transaksi sekaligus.
 */
export const fetchDropdowns = async (appId) => {
  const base = getBaseRef(appId);
  const [outSnap, invSnap, trxSnap] = await Promise.all([
    getDocs(collection(db, base, "outlets")),
    getDocs(collection(db, base, "inventory")),
    getDocs(collection(db, base, "transactions")),
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
 * @returns dokumen baru lengkap dengan id
 */
export const addPrinter = async (appId, formData) => {
  const ref = await addDoc(
    collection(db, getBaseRef(appId), "printers"),
    formData
  );
  return { id: ref.id, ...formData };
};

// ─── UPDATE ────────────────────────────────────────────────────────────────

export const updatePrinter = async (appId, id, formData) => {
  await updateDoc(doc(db, getBaseRef(appId), "printers", id), formData);
};

// ─── DELETE ────────────────────────────────────────────────────────────────

export const deletePrinter = async (appId, id) => {
  await deleteDoc(doc(db, getBaseRef(appId), "printers", id));
};

// ─── IMPORT CSV (BATCH) ────────────────────────────────────────────────────

/**
 * Import massal dari array hasil parsing PapaParse.
 * @returns {Promise<number>} jumlah baris yang berhasil di-import
 */
export const importPrinterCSV = async (appId, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");

  const printerRef = collection(db, getBaseRef(appId), "printers");
  const promises   = [];
  let batch        = writeBatch(db);
  let count        = 0;
  let total        = 0;

  for (const row of rows) {
    if (!row["Outlet"] && !row["Serial Number"]) continue;

    // Pecah kolom "MASA SEWA" → tanggalMulai & tanggalSelesai
    let tglMulai   = "";
    let tglSelesai = "";
    const rawMasaSewa = row["MASA SEWA"]?.trim() || "";
    if (rawMasaSewa.includes("-")) {
      const [start, end] = rawMasaSewa.split("-").map((p) => p.trim());
      tglMulai   = parseIndoDateToISO(start);
      tglSelesai = parseIndoDateToISO(end);
    }

    // Gabungkan TGL CEK ke deskripsi jika ada isinya
    let deskripsiFinal = row["DESKRIPSI"]?.trim() || "";
    const tglCek = row["TGL CEK"]?.trim();
    if (tglCek && tglCek !== "-") {
      deskripsiFinal += deskripsiFinal
        ? ` | Tgl Cek: ${tglCek}`
        : `Tgl Cek: ${tglCek}`;
    }

    const data = {
      idOutlet:      row["Outlet Id"]?.trim()         || "",
      outlet:        row["Outlet"]?.trim()             || "",
      produk:        row["Product Hardware"]?.trim()   || "",
      sn:            row["Serial Number"]?.trim()      || "",
      tanggalMulai,
      tanggalSelesai,
      penyedia:      row["PENYEDIA"]?.trim()           || "",
      status:        row["STATUS"]?.trim()             || "Inventaris",
      kondisi:       row["KONDISI"]?.trim()            || "BAIK",
      deskripsi:     deskripsiFinal,
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
    "Outlet Id", "Outlet", "Product Hardware", "Serial Number",
    "PENYEDIA", "MASA SEWA", "STATUS", "KONDISI", "DESKRIPSI", "TGL CEK",
  ];
  const contoh = [
    "12458,CP CIBINONG,EPSON L4260 ECO TANK,X8SS028432,POJ,April 2024 - April 2026,Sewa Berjalan,KURANG BAIK,Mikro,-",
    "60830,UPS GALUH MAS,LQ-310 DOT MATRIX,R9JYJ33221,POJ,April 2024 - April 2026,Sewa Berjalan,BAIK,-,-",
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