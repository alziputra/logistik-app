import { fetchCollectionData, addDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/sopp',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'sopp' }
];

export const getSoppHistories = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'sopp-001', noSopp: 'SOPP/LOG/2024/001', perihal: 'SOP Pengelolaan Inventaris Outlet', tanggal: '2024-01-05' }
  ]);
};

export const addSoppHistory = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};
