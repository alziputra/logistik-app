import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/pengamanan',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'pengamanan' }
];

export const getPengamananKorporasi = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'sec-001', fasilitas: 'CCTV Online 16 Channel', lokasi: 'CP Medan Utama', status: 'Berfungsi Baik' }
  ]);
};

export const addPengamananKorporasi = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updatePengamananKorporasi = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deletePengamananKorporasi = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
