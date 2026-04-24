// src/components/LazyComponents.js
// Komponen yang di-load secara dinamis (lazy loading) untuk optimasi performa
import dynamic from "next/dynamic";

const loadMsg = (label) => (
  <div className="p-10 text-center text-gray-500 animate-pulse">
    Memuat {label}...
  </div>
);

export const DashboardView = dynamic(
  () => import("../Dashboard"),
  { loading: () => loadMsg("Dashboard") }
);

export const DataMaster = dynamic(
  () => import("../DataMaster"),
  { loading: () => loadMsg("Data Barang") }
);

export const FormView = dynamic(
  () => import("../FormView"),
  { loading: () => loadMsg("Form") }
);

export const PreviewView = dynamic(
  () => import("../PreviewView")
);

export const DataPrinter = dynamic(
  () => import("../DataPerangkat/DataPrinter"),
  { loading: () => loadMsg("Modul Printer") }
);

export const DataKomputer = dynamic(
  () => import("../DataPerangkat/DataKomputer"),
  { loading: () => loadMsg("Modul Komputer... (QR & CSV)") }
);

export const KelolaUser = dynamic(
  () => import("../KelolaUser")
);

export const RiwayatTransaksi = dynamic(
  () => import("../RiwayatTransaksi")
);

export const LogAktivitas = dynamic(
  () => import("../LogAktivitas")
);