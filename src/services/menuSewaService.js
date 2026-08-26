import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/menu_sewa',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'menu_sewa' }
];

export const getMenuSewa = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'sw-001', namaGedung: 'Gedung Ruko Outlet UPC Helvetia', pemilik: 'H. Ahmad', biayaSewa: 45000000, tanggalMulai: '2024-01-01', tanggalSelesai: '2026-12-31', status: 'Sewa Berjalan' }
  ]);
};

export const addMenuSewa = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updateMenuSewa = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteMenuSewa = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
