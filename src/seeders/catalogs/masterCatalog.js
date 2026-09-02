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
    name: 'SpkPksMaster',
    paths: ['logistik/master/spk_pks'],
    items: [
      {
        id: 'spk-001',
        no_spk: 'PO/3567/00108.04/2026',
        no_pks: '2503/00108.04/2026',
        nama_barang: 'Printer Epson L4260',
        kategori: 'Perangkat Cetak & Scan',
        spesifikasi: '- Compact Integrated Tank design\n- Print speeds up to 10.5 ipm for black and 5.0 ipm for colour\n- Wi-Fi & Wi-Fi Direct\n- Borderless Printing up to A4 size\n- Spill-free ink refilling\n- ISO 24734 Duplex A4 (Black or Color)\n- Warranty of 2 years or 30.000 pages, whichever comes first',
        jumlah: 60,
        satuan: 'Unit',
        harga_satuan: 170000,
        sewa_perbulan: 10200000,
        masa_sewa_bulan: 24,
        total_sewa: 244800000,
        terbilang: 'Dua ratus empat puluh empat juta delapan ratus ribu rupiah',
        tanggal_mulai: '2024-01-15',
        tanggal_selesai: '2026-01-14',
        vendor_nama: 'PT Solusi IT Prima',
        status: 'Sewa Berjalan',
        keterangan: 'Pengadaan Sewa Printer Kantor Wilayah VIII Jakarta 1'
      },
      {
        id: 'spk-002',
        no_spk: 'PO/4112/00108.04/2025',
        no_pks: '3104/00108.04/2025',
        nama_barang: 'Dell Optiplex 3070 MFF',
        kategori: 'IT Hardware & Komputer',
        spesifikasi: '- Intel Core i5-9500T 6-Core up to 3.7GHz\n- RAM 8GB DDR4\n- SSD 256GB NVMe M.2\n- Intel UHD Graphics 630\n- OS Windows 10 Pro 64-bit\n- Include Monitor Dell 21.5" Full HD & Keyboard Mouse USB',
        jumlah: 45,
        satuan: 'Unit',
        harga_satuan: 225000,
        sewa_perbulan: 10125000,
        masa_sewa_bulan: 36,
        total_sewa: 364500000,
        terbilang: 'Tiga ratus enam puluh empat juta lima ratus ribu rupiah',
        tanggal_mulai: '2022-01-01',
        tanggal_selesai: '2025-01-01',
        vendor_nama: 'PT Solusi IT Prima',
        status: 'Sewa Selesai',
        keterangan: 'Pengadaan PC Desktop Kasir & Operasional Unit Cabang'
      }
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
