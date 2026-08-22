export const createInitialFormData = (jenis = "Barang Keluar") => {
  const isMasuk = jenis === "Barang Masuk";
  return {
    nomorSurat: "",
    tanggal: new Date().toISOString().split("T")[0],
    jenisTransaksi: jenis,
    lokasi: "Jakarta",
    tujuan: isMasuk ? "Logistik Kanwil VIII" : "",
    outletTujuan: isMasuk ? "Logistik Kanwil VIII" : "",
    asalOutlet: "",
    kodeOutlet: "",
    // Pihak 1 (Yang Menyerahkan)
    pihak1Nama: isMasuk ? "" : "Ahmad Dendy Syaputra",
    pihak1Jabatan: isMasuk ? "" : "Staff Pengadaan dan Logistik",
    pihak1Instansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    // Pihak Mengetahui (Hanya untuk Surat Keluar)
    pihakMengetahuiNama: isMasuk ? "" : "Zoni Rahmawan Putra",
    pihakMengetahuiJabatan: isMasuk ? "" : "Kabag Pengadaan dan Logistik",
    pihakMengetahuiInstansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    // Pihak 2 (Yang Menerima)
    pihak2Nama: "",
    pihak2Jabatan: "",
    pihak2Instansi: isMasuk ? "Logistik Kanwil VIII" : "",

    // Aliases for compatibility
    pengirimNama: isMasuk ? "" : "Ahmad Dendy Syaputra",
    pengirimJabatan: isMasuk ? "" : "Staff Pengadaan dan Logistik",
    pengirimInstansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    mengetahuiNama: isMasuk ? "" : "Zoni Rahmawan Putra",
    mengetahuiJabatan: isMasuk ? "" : "Kabag Pengadaan dan Logistik",
    mengetahuiInstansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    penerimaNama: "",
    penerimaJabatan: "",
    penerimaInstansi: isMasuk ? "Logistik Kanwil VIII" : "",
  };
};

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
