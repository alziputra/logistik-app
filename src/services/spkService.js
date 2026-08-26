import { fetchCollectionData, addDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/spk',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'spk' }
];

export const getSpkHistories = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'spk-001', noSpk: 'SPK/LOG/2024/001', perihal: 'Pengadaan Komputer & Printer', tanggal: '2024-01-10' }
  ]);
};

export const addSpkHistory = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};
