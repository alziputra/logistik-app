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
    pihak1Nama: isMasuk ? "" : "Evi Noviawati",
    pihak1Jabatan: isMasuk ? "" : "Officer",
    pihak1Instansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    // Pihak Mengetahui (3 Pihak untuk Masuk & Keluar)
    pihakMengetahuiNama: "Zoni Rahmawan Putra",
    pihakMengetahuiJabatan: "Kabag Pengadaan dan Logistik",
    pihakMengetahuiInstansi: "PT Pegadaian (Persero)",
    // Pihak 2 (Yang Menerima)
    pihak2Nama: isMasuk ? "Evi Noviawati" : "",
    pihak2Jabatan: isMasuk ? "Officer" : "",
    pihak2Instansi: isMasuk ? "Logistik Kanwil VIII" : "",

    // Aliases for compatibility
    pengirimNama: isMasuk ? "" : "Evi Noviawati",
    pengirimJabatan: isMasuk ? "" : "Officer",
    pengirimInstansi: isMasuk ? "" : "PT Pegadaian (Persero)",
    mengetahuiNama: "Zoni Rahmawan Putra",
    mengetahuiJabatan: "Kabag Pengadaan dan Logistik",
    mengetahuiInstansi: "PT Pegadaian (Persero)",
    penerimaNama: isMasuk ? "Evi Noviawati" : "",
    penerimaJabatan: isMasuk ? "Officer" : "",
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
