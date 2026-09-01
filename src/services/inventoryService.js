import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/inventory',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'inventory' }
];

export const getInventory = async () => {
  const items = await fetchCollectionData(PATHS, [
    { id: 'ast-001', nama: 'Kertas HVS A4 80gsm', kuantitas: 150, stok: 150, satuan: 'Rim', status: 'Tersedia' },
    { id: 'ast-002', nama: 'Pulpen Standard Black 0.5', kuantitas: 400, stok: 400, satuan: 'Pcs', status: 'Tersedia' },
    { id: 'ast-003', nama: 'Kursi Kerja Ergonomis Mesh', kuantitas: 25, stok: 25, satuan: 'Unit', status: 'Tersedia' }
  ]);
  return items.map((item) => ({
    ...item,
    kuantitas: item.stok !== undefined ? item.stok : (item.kuantitas || 0),
  }));
};

export const addInventory = async (formData) => {
  const payload = {
    nama: formData.nama,
    stok: formData.stok !== undefined ? Number(formData.stok) : Number(formData.kuantitas || 0),
    satuan: formData.satuan || "Pcs",
    vendorId: formData.vendorId || null,
    vendor_nama: formData.vendor_nama || "-",
    no_spk: formData.no_spk || null,
    no_pks: formData.no_pks || null,
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    status: formData.status || "Sewa Berjalan",
    masa_sewa_bulan: Number(formData.masa_sewa_bulan || 0),
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateInventory = async (id, formData) => {
  const payload = {
    nama: formData.nama,
    stok: formData.stok !== undefined ? Number(formData.stok) : Number(formData.kuantitas || 0),
    satuan: formData.satuan || "Pcs",
    vendorId: formData.vendorId || null,
    vendor_nama: formData.vendor_nama || "-",
    no_spk: formData.no_spk || null,
    no_pks: formData.no_pks || null,
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    status: formData.status || "Sewa Berjalan",
    masa_sewa_bulan: Number(formData.masa_sewa_bulan || 0),
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteInventory = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
