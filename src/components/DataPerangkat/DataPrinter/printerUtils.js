// src/components/DataPerangkat/DataPrinter/printerUtils.js

/**
 * Format tanggal ISO ke "Jan 2025", dst.
 */
export const formatBulanTahun = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  } catch {
    return dateString;
  }
};

/**
 * Hitung sisa bulan dari hari ini ke tanggal selesai.
 * @returns {number|null}
 */
export const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni  = new Date();
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth() - hariIni.getMonth())
  );
};

/**
 * Hitung status otomatis berdasarkan rentang tanggal sewa.
 * @returns {"Inventaris"|"Sewa Berjalan"|"Sewa Habis"}
 */
export const calculateAutoStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "Inventaris";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  return end >= today ? "Sewa Berjalan" : "Sewa Habis";
};

/**
 * Parse string bulan-tahun bahasa Indonesia (misal: "April 2024") ke "YYYY-MM-01".
 */
export const parseIndoDateToISO = (dateStr) => {
  if (!dateStr) return "";
  const str = dateStr.trim().toLowerCase();
  const monthMap = {
    januari: "01", jan: "01",
    februari: "02", feb: "02",
    maret: "03", mar: "03",
    april: "04", apr: "04",
    mei: "05", may: "05",
    juni: "06", jun: "06",
    juli: "07", jul: "07",
    agustus: "08", agu: "08", aug: "08",
    september: "09", sep: "09",
    oktober: "10", okt: "10", oct: "10",
    november: "11", nov: "11",
    desember: "12", des: "12", dec: "12",
  };
  const parts = str.split(" ");
  if (parts.length === 2) {
    const m = monthMap[parts[0]] || "01";
    const y = parts[1];
    if (y.length === 4) return `${y}-${m}-01`;
  }
  return "";
};

/**
 * Kembalikan class Tailwind untuk badge status.
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case "Inventaris":    return "bg-blue-100 text-blue-700 border-blue-200";
    case "Sewa Berjalan": return "bg-green-100 text-green-700 border-green-200";
    case "Sewa Habis":    return "bg-red-100 text-red-700 border-red-200";
    default:              return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

/** Nilai awal formData yang kosong. */
export const emptyForm = {
  idOutlet: "", outlet: "", produk: "", sn: "",
  penyedia: "", tanggalMulai: "", tanggalSelesai: "",
  status: "Inventaris", kondisi: "BAIK", deskripsi: "",
};