export const BARANG_CATEGORIES = [
  {
    id: "IT Hardware & Komputer",
    name: "IT Hardware & Komputer",
    icon: "Monitor",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/50",
    description: "PC Desktop, Laptop, Monitor, Server, UPS",
  },
  {
    id: "Perangkat Cetak & Scan",
    name: "Perangkat Cetak & Scan",
    icon: "Printer",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/50",
    description: "Printer Dot Matrix, Inkjet, Passbook, Scanner",
  },
  {
    id: "Jaringan & Telekomunikasi",
    name: "Jaringan & Telekomunikasi",
    icon: "Network",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-800/50",
    description: "Router, Switch, WiFi AP, Modem, Rak Server",
  },
  {
    id: "Alat Tulis Kantor (ATK)",
    name: "Alat Tulis Kantor (ATK)",
    icon: "FileText",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50",
    description: "Kertas HVS, Pulpen, Buku Register, Ribbon/Tinta",
  },
  {
    id: "Peralatan Operasional Khusus",
    name: "Peralatan Operasional Khusus",
    icon: "Scale",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/50",
    description: "Timbangan Emas, Karatimeter, Loupe, Mesin Hitung Uang, Brankas",
  },
  {
    id: "Mebel & Furniture Kantor",
    name: "Mebel & Furniture Kantor",
    icon: "Armchair",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-800/50",
    description: "Meja Kerja, Kursi Kerja/Mesh, Kursi Nasabah, Filing Cabinet",
  },
  {
    id: "Elektronik & Fasilitas Gedung",
    name: "Elektronik & Fasilitas Gedung",
    icon: "Zap",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/50",
    description: "AC, TV Antrian/Display, Mesin Antrian, Genset, Dispenser",
  },
  {
    id: "Keamanan & Keselamatan",
    name: "Keamanan & Keselamatan",
    icon: "ShieldAlert",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/50",
    description: "CCTV, Mesin Fingerprint, APAR, Alarm / Panic Button",
  },
  {
    id: "Kendaraan Operasional",
    name: "Kendaraan Operasional",
    icon: "Car",
    color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-400 dark:border-teal-800/50",
    description: "Sepeda Motor Dinas, Mobil Operasional",
  },
  {
    id: "Lainnya",
    name: "Lainnya",
    icon: "Box",
    color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    description: "Kategori barang atau perlengkapan umum lainnya",
  },
];

export const getCategoryBadgeStyle = (categoryName) => {
  const cat = BARANG_CATEGORIES.find(
    (c) => (c.name || "").toLowerCase() === (categoryName || "").toLowerCase() || (c.id || "").toLowerCase() === (categoryName || "").toLowerCase()
  );
  return cat ? cat.color : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
};
