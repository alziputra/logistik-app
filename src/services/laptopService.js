import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData, importCollectionCSV } from './firestoreHelper';

const PATHS = [
  'logistik/devices/laptop',
  'logistik/devices/laptops',
  { parentCol: 'logistik', parentDoc: 'devices', subCol: 'laptop' },
  { parentCol: 'logistik', parentDoc: 'devices', subCol: 'laptops' }
];

export const INITIAL_LAPTOPS = [
  { id: "lp-001", nik: "P80524", nama: "MAMAN SURATMAN", jabatan: "Kepala Departemen", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P80524", sn: "5CG4222JJW", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-002", nik: "P79485", nama: "NILA SOPHIA", jabatan: "Kepala Bagian", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P79485", sn: "5CG4222JJW", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-003", nik: "P93756", nama: "DIO HARIS KURNIAWAN", jabatan: "Staff", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P93756", sn: "5CG5100G2F", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-004", nik: "P93887", nama: "AHMAD DENDY SYAPUTRA", jabatan: "Administrator", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P93887", sn: "5CG5100G2W", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-005", nik: "Q09142", nama: "LEONARDO YONGKI ARI WIBOWO", jabatan: "Administrator", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-Q09142", sn: "5CG4370HMP", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-006", nik: "P85018", nama: "ASRI ATMASARI", jabatan: "Kepala Bagian", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P85018", sn: "5CG4222JRP", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-007", nik: "P81332", nama: "SATOTO", jabatan: "Officer", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P81332", sn: "5CG4370HTM", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-008", nik: "P93122", nama: "GERI PRASETYA ALIBASYAH", jabatan: "Staff", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P93122", sn: "5CG4370HTM", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-009", nik: "P95021", nama: "DARA MARIESTA", jabatan: "Administrator", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P95021", sn: "5CG5100G3V", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-010", nik: "P79423", nama: "SUHADI", jabatan: "Kepala Bagian", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P79423", sn: "5CG4222JQJ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-011", nik: "P93323", nama: "DHIAURRAHMAN", jabatan: "Staff", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P93323", sn: "5CG4222JQJ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-012", nik: "P89881", nama: "NURFADILA", jabatan: "Sekretaris", departemen: "Departemen Logistik & Umum", hostname: "NB-00108-P89881", sn: "5CG4222JQP", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-013", nik: "P81083", nama: "JOHNSON", jabatan: "Kepala Departemen", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P81083", sn: "5CG4222JL3", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-014", nik: "P79516", nama: "ZONI RAHMAWAN PUTRA", jabatan: "Kepala Bagian", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P79516", sn: "5CG4222JL3", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-015", nik: "P84349", nama: "GEMURUH SUKMA NURALAM", jabatan: "Kepala Bagian", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P84349", sn: "CND4330SBF | 7B3DCL3", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-016", nik: "P93639", nama: "RANDY BAGUS PRATAMA", jabatan: "Staff", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P93639", sn: "5CG5100G1J", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-017", nik: "P87234", nama: "DIMAS HANDIYANTO", jabatan: "Staff", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P87234", sn: "5CG5100G1J", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-018", nik: "P94688", nama: "ZIYAD RIZKY", jabatan: "Administrator", departemen: "Departemen Manajemen Risiko", hostname: "NB-00108-P94688", sn: "5CG4222JL0", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-019", nik: "P83321", nama: "INDRA ARIFIANTO", jabatan: "Kepala Departemen", departemen: "Departemen Business Support", hostname: "NB-00108-P83321", sn: "5CG4222JKQ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-020", nik: "P83028", nama: "KELLY MINAHTA", jabatan: "Kepala Bagian", departemen: "Departemen Business Support", hostname: "NB-00108-P83028", sn: "5CG4222JKQ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-021", nik: "P89274", nama: "FIRDIANSYAH", jabatan: "Staff", departemen: "Departemen Business Support", hostname: "NB-00108-P89274", sn: "5CG4222JL0", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-022", nik: "P94669", nama: "MAHARTI AMBAR UTAMI", jabatan: "Administrator", departemen: "Departemen Business Support", hostname: "NB-00108-P94669", sn: "5CG4222JKQ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-023", nik: "P83060", nama: "ENI WULANDARI", jabatan: "Kepala Bagian", departemen: "Departemen Business Support", hostname: "NB-00108-P83060", sn: "5CG4222JKZ", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-024", nik: "P91472", nama: "OMEN SEFTYAN", jabatan: "Staff", departemen: "Departemen Business Support", hostname: "NB-00108-P91472", sn: "5CD230CJPD", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-025", nik: "P81324", nama: "SUMARNO", jabatan: "Kepala Bagian", departemen: "Departemen Business Support", hostname: "NB-00108-P81324", sn: "5CG4370HNX", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-026", nik: "P89227", nama: "DARA MUSISI SANTRI", jabatan: "Staff", departemen: "Departemen Business Support", hostname: "NB-00108-P89227", sn: "4CG3496NQ9", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-027", nik: "P93426", nama: "ADITYA NUGRAHA", jabatan: "Staff", departemen: "Departemen Business Support", hostname: "NB-00108-P93426", sn: "5CG4222JKD", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-028", nik: "P83379", nama: "ANGGA ADYA VIRANO", jabatan: "Kepala Departemen", departemen: "Departemen Business Support", hostname: "NB-00108-P83379", sn: "5CG4222J41", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-029", nik: "P80068", nama: "MOH. TUGIMAN", jabatan: "Kepala Bagian", departemen: "Departemen Keuangan", hostname: "NB-00108-P80068", sn: "5CG4222JQT", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-030", nik: "P89111", nama: "EKO ASRIYONO", jabatan: "Staff", departemen: "Departemen Keuangan", hostname: "NB-00108-P89111", sn: "5CG4222JL4", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-031", nik: "P94677", nama: "NIDA APRILIA SARI", jabatan: "Administrator", departemen: "Departemen Keuangan", hostname: "NB-00108-P94677", sn: "5CG4222J4J", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-032", nik: "P79487", nama: "ASIH DWIYANTHI", jabatan: "Kepala Bagian", departemen: "Departemen Keuangan", hostname: "NB-00108-P79487", sn: "5CG4370HP4", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-033", nik: "P89220", nama: "INDRA RACHMAWAN", jabatan: "Staff", departemen: "Departemen Keuangan", hostname: "NB-00108-P89220", sn: "5CG4222J3Z", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-034", nik: "P93896", nama: "DOMINICA SHERLY NOVITA WIDAYANTI", jabatan: "Administrator", departemen: "Departemen Keuangan", hostname: "NB-00108-P93896", sn: "50ZMS44", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-035", nik: "P94407", nama: "MARDELIA ANGGRAINI", jabatan: "Administrator", departemen: "Departemen Keuangan", hostname: "NB-00108-P94407", sn: "To Be Filled By O.E.M", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-036", nik: "P94687", nama: "WAHYUTAMA APTRIA KURNIANTO", jabatan: "Administrator", departemen: "Departemen Keuangan", hostname: "NB-00108-P94687", sn: "5CG4222J3Z", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-037", nik: "P78945", nama: "AGUS PRAMONO", jabatan: "Kepala Departemen", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P78945", sn: "5CG40455HB", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-038", nik: "P79755", nama: "AJAR SUKANI", jabatan: "Staf Penugasan", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P79755", sn: "5CG4370HSW", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-039", nik: "P83383", nama: "WULAN PUJI LESTARI", jabatan: "Kepala Bagian", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P83383", sn: "5CG4370HSW", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-040", nik: "P93743", nama: "ANDRE BARRY PRAWIRA", jabatan: "Staff", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P93743", sn: "5CG4370HNS", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-041", nik: "Q09156", nama: "TRIESHA RETNO ASTARI", jabatan: "Administrator", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-Q09156", sn: "5CG4370HMS", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-042", nik: "P83044", nama: "KHRISNA MEGASARI", jabatan: "Kepala Bagian", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P83044", sn: "5CG4370HN3", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-043", nik: "P89178", nama: "MUHAMMAD MULYAWANTO", jabatan: "Staff", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P89178", sn: "5CG4370HT2", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-044", nik: "P93344", nama: "NI LUH INTAN AYU MEGAWATI", jabatan: "Staff", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P93344", sn: "493DCL3", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-045", nik: "P92859", nama: "DERRY JANUARSYAH", jabatan: "Administrator", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P92859", sn: "5CG4370HN8", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-046", nik: "P83308", nama: "GADING NURLITASARI", jabatan: "Kepala Bagian", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P83308", sn: "5CG4222JKR", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" },
  { id: "lp-047", nik: "P93659", nama: "YASMIN AMBAR PRATIWI", jabatan: "Officer", departemen: "Departemen Sumber Daya Manusia", hostname: "NB-00108-P93659", sn: "5CG4370J4V", os: "Windows", vendor: "PT GLOBAL SOLUSINDO KOMPUDATA", tanggalMulai: "2024-01-01", tanggalSelesai: "2026-01-01", status: "Sewa Berjalan", kondisi: "BAIK" }
];

export const getLaptop = async () => {
  const rawItems = await fetchCollectionData(PATHS, INITIAL_LAPTOPS);

  return rawItems.map((item) => ({
    ...item,
    nik: item.nik || "-",
    nama: item.nama || item.namaPengguna || "Pengguna Pegadaian",
    jabatan: item.jabatan || item.namaJabatan || "-",
    departemen: item.departemen || "Departemen Logistik & Umum",
    hostname: item.hostname || item.deviceName || item.namaUnit || "-",
    sn: item.sn || item.serialNumber || item.no_sn || "-",
    os: item.os || "Windows",
    vendor: item.vendor || item.penyedia || "PT GLOBAL SOLUSINDO KOMPUDATA",
    status: item.status || "Sewa Berjalan",
  }));
};

export const addLaptop = async (formData) => {
  const payload = {
    ...formData,
    nik: formData.nik || "",
    nama: formData.nama || formData.namaPengguna || "",
    jabatan: formData.jabatan || formData.namaJabatan || "",
    departemen: formData.departemen || "",
    hostname: formData.hostname || formData.deviceName || "",
    sn: formData.sn || formData.serialNumber || "",
    os: formData.os || "Windows",
    vendor: formData.vendor || formData.penyedia || "PT GLOBAL SOLUSINDO KOMPUDATA",
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateLaptop = async (id, formData) => {
  const payload = {
    ...formData,
    nik: formData.nik || "",
    nama: formData.nama || formData.namaPengguna || "",
    jabatan: formData.jabatan || formData.namaJabatan || "",
    departemen: formData.departemen || "",
    hostname: formData.hostname || formData.deviceName || "",
    sn: formData.sn || formData.serialNumber || "",
    os: formData.os || "Windows",
    vendor: formData.vendor || formData.penyedia || "PT GLOBAL SOLUSINDO KOMPUDATA",
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteLaptop = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

export const importLaptopCSV = async (rows) => {
  return importCollectionCSV(addLaptop, rows);
};
