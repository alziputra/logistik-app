export const createInitialFormData = () => ({
  nomorSurat: "",
  tanggal: new Date().toISOString().split("T")[0],
  jenisTransaksi: "Barang Keluar",
  lokasi: "Jakarta",
  tujuan: "",
  outletTujuan: "",
  // Standard Pihak 1 (Yang Menyerahkan)
  pihak1Nama: "Ahmad Dendy Syaputra",
  pihak1Jabatan: "Staff Pengadaan dan Logistik",
  pihak1Instansi: "PT Pegadaian (Persero)",
  // Standard Pihak Mengetahui
  pihakMengetahuiNama: "Zoni Rahmawan Putra",
  pihakMengetahuiJabatan: "Kabag Pengadaan dan Logistik",
  pihakMengetahuiInstansi: "PT Pegadaian (Persero)",
  // Standard Pihak 2 (Yang Menerima)
  pihak2Nama: "",
  pihak2Jabatan: "",
  pihak2Instansi: "",

  // Aliases for compatibility
  pengirimNama: "Ahmad Dendy Syaputra",
  pengirimJabatan: "Staff Pengadaan dan Logistik",
  pengirimInstansi: "PT Pegadaian (Persero)",
  mengetahuiNama: "Zoni Rahmawan Putra",
  mengetahuiJabatan: "Kabag Pengadaan dan Logistik",
  mengetahuiInstansi: "PT Pegadaian (Persero)",
  penerimaNama: "",
  penerimaJabatan: "",
  penerimaInstansi: "",
});

export const createInitialItem = () => ({
  id: Date.now().toString(),
  namaBarang: "",
  nama: "",
  jumlah: 1,
  kuantitas: 1,
  satuan: "Pcs",
  sn: "",
  keterangan: "",
  outlet: "",
});
