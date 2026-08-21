// src/services/komputerService.js
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { parseIndoDateToISO } from "../utils/deviceUtils";

const getCompRef = () => collection(db, "logistik", "devices", "computers");
const getCompDocRef = (id) => doc(db, "logistik", "devices", "computers", id);
const getOutletsRef = () => collection(db, "logistik", "master", "outlets");
const getInventoryRef = () => collection(db, "logistik", "master", "inventory");

// ─── READ ──────────────────────────────────────────────────────────────────

/**
 * Ambil semua data komputer dari Firestore.
 * @returns {Promise<Array>}
 */
export const fetchKomputer = async () => {
  const snap = await getDocs(getCompRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Ambil data dropdown outlet & inventory sekaligus.
 * @returns {Promise<{ outlets: Array, inventory: Array }>}
 */
export const fetchDropdowns = async () => {
  const [outSnap, invSnap] = await Promise.all([
    getDocs(getOutletsRef()),
    getDocs(getInventoryRef()),
  ]);
  return {
    outlets:   outSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    inventory: invSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
};

// ─── CREATE ────────────────────────────────────────────────────────────────

/**
 * Tambah satu data komputer.
 * @param {string} appId - deprecated / optional
 * @param {object} formData
 * @returns {Promise<{ id: string } & object>} dokumen baru lengkap dengan id
 */
export const addKomputer = async (appId, formData) => {
  const data = typeof appId === "object" ? appId : formData;
  const ref = await addDoc(
    getCompRef(),
    data
  );
  return { id: ref.id, ...data };
};

// ─── UPDATE ────────────────────────────────────────────────────────────────

/**
 * Perbarui data komputer berdasarkan id.
 */
export const updateKomputer = async (appId, id, formData) => {
  const targetId = typeof appId === "string" && formData ? id : appId;
  const data = typeof appId === "string" && formData ? formData : id;
  await updateDoc(getCompDocRef(targetId), data);
};

// ─── DELETE ────────────────────────────────────────────────────────────────

/**
 * Hapus data komputer berdasarkan id.
 */
export const deleteKomputer = async (appId, id) => {
  const targetId = id || appId;
  await deleteDoc(getCompDocRef(targetId));
};

// ─── IMPORT CSV (BATCH) ────────────────────────────────────────────────────

/**
 * Import massal dari array hasil parsing PapaParse.
 * Tiap batch maksimal 490 dokumen (batas Firestore 500).
 */
export const importKomputerCSV = async (appId, rows) => {
  const dataRows = Array.isArray(appId) ? appId : rows;
  if (!dataRows || dataRows.length === 0) throw new Error("File CSV kosong");

  const compRef  = getCompRef();
  const promises = [];
  let batch      = writeBatch(db);
  let count      = 0;
  let total      = 0;

  for (const row of rows) {
    // Lewati baris kosong
    if (!row["NAMA OUTLET"] && !row["SERIAL NUMBER"]) continue;

    // Pecah kolom "MASA SEWA" → tanggalMulai & tanggalSelesai
    let tglMulai   = "";
    let tglSelesai = "";
    const rawMasaSewa = row["MASA SEWA"]?.trim() || "";
    if (rawMasaSewa.includes("-")) {
      const [start, end] = rawMasaSewa.split("-").map((p) => p.trim());
      tglMulai   = parseIndoDateToISO(start);
      tglSelesai = parseIndoDateToISO(end);
    }

    const pcData = {
      idOutlet:    row["OUTLET ID"]?.trim()         || "",
      outlet:      row["NAMA OUTLET"]?.trim()       || "",
      ipAddress:   row["IP ADDRESS"]?.trim()        || "",
      macAddress:  row["MAC"]?.trim()               || "",
      ram:         row["RAM"]?.trim()               || "",
      storage:     row["PHYSICAL DISK"]?.trim()     || "",
      cpu:         row["CPU"]?.trim()               || "",
      os:          row["OS NAME"]?.trim()           || "",
      produk:      row["PRODUCT HARDWARE"]?.trim()  || "",
      sn:          row["SERIAL NUMBER"]?.trim()     || "",
      tanggalMulai,
      tanggalSelesai,
      penyedia:    row["PENYEDIA"]?.trim()          || "",
      status:      row["STATUS"]?.trim()            || "Inventaris",
      deskripsi:   row["DESKRIPSI"]?.trim()         || "",
      kondisi:     "BAIK",
    };

    batch.set(doc(compRef), pcData);
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

/**
 * Trigger download file CSV template import.
 */
export const downloadTemplate = () => {
  const headers = [
    "OUTLET ID", "NAMA OUTLET", "IP ADDRESS", "PRODUCT HARDWARE",
    "SERIAL NUMBER", "MASA SEWA", "PENYEDIA", "STATUS",
    "DESKRIPSI", "MAC", "RAM", "PHYSICAL DISK", "CPU", "OS NAME",
  ];
  const contoh = [
    "12350,UPC BOJONG RAWALUMBU,10.81.58.23,OptiPlex SFF 7010,8B9BVZ3,April 2024 - April 2026,POJ,Sewa Berjalan,-,cc:96:e5:3f:af:e8,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian",
    "12458,CP CIBINONG,10.81.167.60,OptiPlex SFF 7010,GMYMS44,Januari 2025 - Januari 2028,EPS,Sewa Berjalan,-,4c:d7:17:9e:23:22,7 GB,503GB,13th Gen Intel(R) Core(TM) i5-13600,Ubuntu Pegadaian V.22 Build 2024.11.01",
  ];
  const csv  = headers.join(",") + "\n" + contoh.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.setAttribute("download", "Template_Import_Komputer.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};