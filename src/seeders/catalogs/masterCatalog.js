export const masterCatalog = [
  {
    name: 'AsetTanah',
    paths: ['logistik/master/aset_tanah'],
    items: [
      { id: 'at-001', namaAset: 'Gedung Kantor Cabang Medan', unit_kerja: 'CP Medan Utama', alamat: 'Jl. Gatot Subroto No. 100, Medan', luasTanah: '500 m2', luas_tanah_m2: 500, statusKepemilikan: 'SHM Milik Pegadaian' }
    ]
  },
  {
    name: 'MenuSewa',
    paths: ['logistik/master/menu_sewa'],
    items: [
      { id: 'sw-001', namaGedung: 'Gedung Ruko Outlet UPC Helvetia', pemilik: 'H. Ahmad', biayaSewa: 45000000, tanggalMulai: '2024-01-01', tanggalSelesai: '2026-12-31', status: 'Sewa Berjalan' }
    ]
  },
  {
    name: 'Renovasi',
    paths: ['logistik/master/renovasi'],
    items: [
      { id: 'rn-001', namaProyek: 'Renovasi Interior CP Medan Utama', kontraktor: 'PT Karya Cipta Bangun', biaya: 120000000, status: 'Selesai' }
    ]
  },
  {
    name: 'PengamananKorporasi',
    paths: ['logistik/master/pengamanan'],
    items: [
      { id: 'sec-001', fasilitas: 'CCTV Online 16 Channel', lokasi: 'CP Medan Utama', status: 'Berfungsi Baik' }
    ]
  },
  {
    name: 'SpkHistories',
    paths: ['logistik/master/spk'],
    items: [
      { id: 'spk-001', noSpk: 'SPK/LOG/2024/001', perihal: 'Pengadaan Komputer & Printer', tanggal: '2024-01-10' }
    ]
  },
  {
    name: 'SoppHistories',
    paths: ['logistik/master/sopp'],
    items: [
      { id: 'sopp-001', noSopp: 'SOPP/LOG/2024/001', perihal: 'SOP Pengelolaan Inventaris Outlet', tanggal: '2024-01-05' }
    ]
  },
  {
    name: 'Transactions',
    paths: ['logistik/operations/transactions'],
    items: [
      { id: 'trx-001', nomorSurat: '453/00108.00/04/2026', tanggal: '2026-07-20', jenisTransaksi: 'Barang Masuk', pengirimNama: 'Ahmad Dendy Syaputra', penerimaNama: 'jua' }
    ]
  },
  {
    name: 'ActivityLogs',
    paths: ['logistik/operations/activity_logs'],
    items: [
      { id: 'log-001', user: 'Admin Logistik', action: 'Inisialisasi Database Firestore Berhasil', timestamp: new Date().toISOString() }
    ]
  }
];
