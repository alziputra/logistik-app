// src/constants/tabConfig.js
// Konfigurasi tab: judul, tab awal, dan tab permanen

/** Mapping viewId → judul tab yang tampil di UI */
export const VIEW_TITLES = {
  dashboard:          "Dashboard",
  riwayat:            "Riwayat Transaksi",
  master_barang:      "Master Barang",
  master_outlet:      "Master Instansi",
  form:               "Buat Surat",
  preview:            "Preview Surat",
  perangkat_printer:  "Data Printer",
  perangkat_komputer: "Data PC",
  kelola_user:        "Kelola Akses",
  log_aktivitas:      "Log Aktivitas",
};

/** Tab awal saat aplikasi pertama kali dibuka */
export const INITIAL_TABS = [{ id: "dashboard", title: VIEW_TITLES.dashboard }];

/** Tab yang tidak bisa ditutup */
export const PERMANENT_TABS = ["dashboard"];