import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/renovasi',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'renovasi' }
];

export const getRenovasi = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'rn-001', namaProyek: 'Renovasi Interior CP Medan Utama', kontraktor: 'PT Karya Cipta Bangun', biaya: 120000000, status: 'Selesai' }
  ]);
};

export const addRenovasi = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updateRenovasi = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteRenovasi = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
