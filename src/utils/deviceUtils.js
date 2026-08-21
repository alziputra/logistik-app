export const formatBulanTahun = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      year:  "numeric",
    });
  } catch {
    return dateString;
  }
};

export const hitungSisaBulan = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const tglSelesai = new Date(tanggalSelesai);
  if (isNaN(tglSelesai)) return null;
  const hariIni = new Date();
  return (
    (tglSelesai.getFullYear() - hariIni.getFullYear()) * 12 +
    (tglSelesai.getMonth()   - hariIni.getMonth())
  );
};

export const hitungSisaHari = (tanggalSelesai) => {
  if (!tanggalSelesai) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const tglSelesai = new Date(tanggalSelesai);
  tglSelesai.setHours(0, 0, 0, 0);
  if (isNaN(tglSelesai)) return null;
  const diffTime = tglSelesai.getTime() - hariIni.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateAutoStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "Inventaris";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endDate) >= today ? "Sewa Berjalan" : "Sewa Habis";
};

export const parseIndoDateToISO = (dateStr) => {
  if (!dateStr) return "";
  const monthMap = {
    januari: "01", jan: "01",
    februari: "02", feb: "02",
    maret: "03",   mar: "03",
    april: "04",   apr: "04",
    mei: "05",     may: "05",
    juni: "06",    jun: "06",
    juli: "07",    jul: "07",
    agustus: "08", agu: "08", aug: "08",
    september: "09", sep: "09",
    oktober: "10", okt: "10", oct: "10",
    november: "11", nov: "11",
    desember: "12", des: "12", dec: "12",
  };
  const parts = dateStr.trim().toLowerCase().split(" ");
  if (parts.length === 2) {
    const m = monthMap[parts[0]] || "01";
    const y = parts[1];
    if (y.length === 4) return `${y}-${m}-01`;
  }
  return "";
};

export const parseRobustDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [y, m, d] = cleanStr.split("-").map(Number);
    if (m > 12) {
      return `${y}-${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}`;
    }
    return cleanStr;
  }
  
  const match = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) {
    const part1 = Number(match[1]);
    const part2 = Number(match[2]);
    const y = match[3];
    
    let d = part1;
    let m = part2;
    if (part1 > 12) {
      d = part1;
      m = part2;
    } else if (part2 > 12) {
      d = part2;
      m = part1;
    } else {
      d = part1;
      m = part2;
    }
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const parsedIndo = parseIndoDateToISO(cleanStr);
  if (parsedIndo) return parsedIndo;

  return null;
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "Inventaris":    return "bg-blue-950/80 text-blue-300 border-blue-800/50";
    case "Sewa Berjalan": return "bg-emerald-950/80 text-emerald-300 border-emerald-800/50";
    case "Sewa Habis":    return "bg-rose-950/80 text-rose-300 border-rose-800/50";
    default:              return "bg-slate-800/80 text-slate-300 border-slate-700/50";
  }
};

export const emptyFormKomputer = {
  idOutlet: "", outlet: "", ipAddress: "", produk: "", sn: "",
  penyedia: "", tanggalMulai: "", tanggalSelesai: "",
  status: "Inventaris", kondisi: "BAIK",
  keterangan: "", macAddress: "", ram: "", storage: "", cpu: "", os: "",
};

export const emptyFormPrinter = {
  idOutlet: "", outlet: "", produk: "", sn: "",
  penyedia: "", tanggalMulai: "", tanggalSelesai: "",
  status: "Inventaris", kondisi: "BAIK", deskripsi: "",
};
