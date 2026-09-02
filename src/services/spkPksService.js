import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/spk_pks',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'spk_pks' }
];

export const INITIAL_SPK_PKS = [
  {
    id: 'spk-001',
    no_spk: 'PO/3567/00108.04/2026',
    no_pks: '2503/00108.04/2026',
    nama_barang: 'Printer Epson L4260',
    kategori: 'Perangkat Cetak & Scan',
    spesifikasi: `- Compact Integrated Tank design\n- Print speeds up to 10.5 ipm for black and 5.0 ipm for colour\n- Wi-Fi & Wi-Fi Direct\n- Borderless Printing up to A4 size\n- Spill-free ink refilling\n- ISO 24734 Duplex A4 (Black or Color)\n- Warranty of 2 years or 30.000 pages, whichever comes first`,
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
    spesifikasi: `- Intel Core i5-9500T 6-Core up to 3.7GHz\n- RAM 8GB DDR4\n- SSD 256GB NVMe M.2\n- Intel UHD Graphics 630\n- OS Windows 10 Pro 64-bit\n- Include Monitor Dell 21.5" Full HD & Keyboard Mouse USB`,
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
  },
  {
    id: 'spk-003',
    no_spk: 'PO/4890/00108.04/2026',
    no_pks: '3890/00108.04/2026',
    nama_barang: 'LQ-310 DOT MATRIX',
    kategori: 'Perangkat Cetak & Scan',
    spesifikasi: `- 24-Pin Narrow Carriage Impact Dot Matrix\n- Speed: up to 416 cps (12 cpi)\n- 1 Original + 3 Copies Continuous Form\n- USB 2.0, Bi-directional parallel (IEEE-1284), Serial`,
    jumlah: 30,
    satuan: 'Unit',
    harga_satuan: 135000,
    sewa_perbulan: 4050000,
    masa_sewa_bulan: 24,
    total_sewa: 97200000,
    terbilang: 'Sembilan puluh tujuh juta dua ratus ribu rupiah',
    tanggal_mulai: '2024-06-01',
    tanggal_selesai: '2026-05-31',
    vendor_nama: 'PT Teknologi Nusantara',
    status: 'Sewa Berjalan',
    keterangan: 'Printer Bukti Transaksi Surat Bukti Kredit (SBK)'
  }
];

export const getSpkPksList = async () => {
  return fetchCollectionData(PATHS, INITIAL_SPK_PKS);
};

export const addSpkPks = async (formData) => {
  const jumlah = Number(formData.jumlah || 0);
  const hargaSatuan = Number(formData.harga_satuan || 0);
  const sewaPerbulan = formData.sewa_perbulan ? Number(formData.sewa_perbulan) : jumlah * hargaSatuan;
  const masaSewa = Number(formData.masa_sewa_bulan || 0);
  const totalSewa = formData.total_sewa ? Number(formData.total_sewa) : sewaPerbulan * (masaSewa || 1);

  const payload = {
    no_spk: formData.no_spk || '',
    no_pks: formData.no_pks || '',
    nama_barang: formData.nama_barang || '',
    kategori: formData.kategori || 'IT Hardware & Komputer',
    spesifikasi: formData.spesifikasi || '',
    jumlah: jumlah,
    satuan: formData.satuan || 'Unit',
    harga_satuan: hargaSatuan,
    sewa_perbulan: sewaPerbulan,
    masa_sewa_bulan: masaSewa,
    total_sewa: totalSewa,
    terbilang: formData.terbilang || '',
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    vendor_nama: formData.vendor_nama || '-',
    vendorId: formData.vendorId || null,
    status: formData.status || 'Sewa Berjalan',
    keterangan: formData.keterangan || '',
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateSpkPks = async (id, formData) => {
  const jumlah = Number(formData.jumlah || 0);
  const hargaSatuan = Number(formData.harga_satuan || 0);
  const sewaPerbulan = formData.sewa_perbulan ? Number(formData.sewa_perbulan) : jumlah * hargaSatuan;
  const masaSewa = Number(formData.masa_sewa_bulan || 0);
  const totalSewa = formData.total_sewa ? Number(formData.total_sewa) : sewaPerbulan * (masaSewa || 1);

  const payload = {
    no_spk: formData.no_spk || '',
    no_pks: formData.no_pks || '',
    nama_barang: formData.nama_barang || '',
    kategori: formData.kategori || 'IT Hardware & Komputer',
    spesifikasi: formData.spesifikasi || '',
    jumlah: jumlah,
    satuan: formData.satuan || 'Unit',
    harga_satuan: hargaSatuan,
    sewa_perbulan: sewaPerbulan,
    masa_sewa_bulan: masaSewa,
    total_sewa: totalSewa,
    terbilang: formData.terbilang || '',
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    vendor_nama: formData.vendor_nama || '-',
    vendorId: formData.vendorId || null,
    status: formData.status || 'Sewa Berjalan',
    keterangan: formData.keterangan || '',
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteSpkPks = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
