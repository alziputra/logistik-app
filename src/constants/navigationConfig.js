import {
  Home,
  LayoutDashboard,
  Building2,
  Shield,
  FileText,
  FileCheck,
  History,
  Database,
  Package,
  Users,
  Building,
  Monitor,
  Laptop,
  Printer,
  Map,
  Settings,
  Activity,
} from "lucide-react";

export const getCategoryFromView = (v) => {
  if (!v) return "home";
  if (v === "dashboard" || v.startsWith("dashboard_")) return "home";
  if (v === "form" || v === "riwayat" || v.startsWith("surat_") || v.startsWith("spk_") || v.startsWith("sopp_")) return "surat";
  if (v.startsWith("master_")) return "master";
  if (v.startsWith("perangkat_") || v === "inventory") return "inventaris";
  if (v.startsWith("bangunan_")) return "bangunan";
  if (v === "kelola_user" || v === "log_aktivitas") return "settings";
  return "home";
};

export const NAV_CATEGORIES = [
  {
    id: "home",
    label: "Home",
    categoryTitle: "Pusat Informasi & Statistik",
    icon: Home,
    items: [
      {
        id: "dashboard",
        label: "Dashboard Inventaris",
        desc: "Katalog & Stok Logistik",
        icon: LayoutDashboard,
        isActive: (v) => v === "dashboard" || v === "dashboard_inventaris",
      },
      {
        id: "dashboard_bangunan",
        label: "Dashboard Bangunan",
        desc: "Sewa & Renovasi Gedung",
        icon: Building2,
      },
      {
        id: "dashboard_pengamanan",
        label: "Dashboard Pengamanan",
        desc: "Fasilitas Keamanan Korporasi",
        icon: Shield,
      },
    ],
  },
  {
    id: "surat",
    label: "Surat",
    categoryTitle: "Kelola Surat & Transaksi",
    icon: FileText,
    items: [
      {
        id: "form",
        label: "Surat Serah Terima (BAST)",
        desc: "Dokumen Masuk & Keluar",
        icon: FileText,
        isStartNew: true,
        officerOrAdminOnly: true,
      },
      {
        id: "spk",
        label: "SPK (Perintah Kerja)",
        icon: FileCheck,
        isGroup: true,
        officerOrAdminOnly: true,
        subItems: [
          { id: "spk_renovasi", label: "Renovasi", desc: "Pekerjaan Gedung" },
          { id: "spk_elektronik", label: "Elektronik", desc: "Perangkat IT" },
          { id: "spk_kendaraan", label: "Kendaraan", desc: "Sewa Operasional" },
        ],
      },
      {
        id: "sopp",
        label: "SOPP",
        icon: FileCheck,
        isGroup: true,
        officerOrAdminOnly: true,
        subItems: [
          { id: "sopp_pengadaan", label: "Pengadaan", desc: "Belanja Barang" },
          { id: "sopp_sewa", label: "Sewa", desc: "Perjanjian Sewa" },
          { id: "sopp_renovasi", label: "Renovasi", desc: "Pemeliharaan" },
        ],
      },
      {
        id: "riwayat",
        label: "Riwayat Transaksi Surat",
        desc: "Arsip & Log Surat",
        icon: History,
      },
    ],
  },
  {
    id: "master",
    label: "Data Master",
    categoryTitle: "Master Data Referensi",
    icon: Database,
    items: [
      {
        id: "master_barang",
        label: "Master Barang",
        desc: "Katalog & Stok Logistik",
        icon: Package,
      },
      {
        id: "master_spk_pks",
        label: "SPK dan PKS",
        desc: "Dokumen Kontrak Kerja",
        icon: FileText,
      },
      {
        id: "master_vendor",
        label: "Supplier / Vendor",
        desc: "Mitra Kerja & Kontak",
        icon: Users,
      },
      {
        id: "master_outlet",
        label: "Outlet & Instansi",
        desc: "Data Cabang & Unit",
        icon: Building,
      },
    ],
  },
  {
    id: "inventaris",
    label: "Inventaris",
    categoryTitle: "Manajemen Aset IT & Sewa",
    icon: Package,
    items: [
      {
        id: "perangkat_komputer",
        label: "Perangkat Komputer (PC)",
        desc: "Inventaris & Sewa PC",
        icon: Monitor,
      },
      {
        id: "perangkat_laptop",
        label: "Perangkat Laptop",
        desc: "Inventaris & Sewa Laptop",
        icon: Laptop,
      },
      {
        id: "perangkat_printer",
        label: "Perangkat Printer",
        desc: "Inventaris & Sewa Printer",
        icon: Printer,
      },
    ],
  },
  {
    id: "bangunan",
    label: "Bangunan",
    categoryTitle: "Aset Properti & Fasilitas",
    icon: Building2,
    items: [
      {
        id: "bangunan_tanah",
        label: "Aset Tanah",
        desc: "Sertifikat & Lokasi Lahan",
        icon: Map,
      },
      {
        id: "bangunan_sewa",
        label: "Aset Bangunan & Sewa",
        desc: "Gedung & Kontrak Sewa",
        icon: Building,
      },
      {
        id: "bangunan_renovasi",
        label: "Renovasi Gedung",
        desc: "Monitoring Proyek & Biaya",
        icon: Building2,
      },
      {
        id: "bangunan_sarana",
        label: "Sarana Pengamanan",
        desc: "CCTV, Alarm & APAR",
        icon: Shield,
      },
    ],
  },
  {
    id: "settings",
    label: "Pengaturan",
    categoryTitle: "Pengaturan & Hak Akses",
    icon: Settings,
    items: [
      {
        id: "kelola_user",
        label: "Manajemen User",
        desc: "Hak Akses & Akun Staff",
        icon: Users,
        adminOnly: true,
      },
      {
        id: "log_aktivitas",
        label: "Log Aktivitas Sistem",
        desc: "Audit Trail Riwayat Kerja",
        icon: Activity,
      },
    ],
  },
];

