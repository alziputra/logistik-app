import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/vendors',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'vendors' }
];

export const getVendors = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'ven-001', nama: 'PT Solusi IT Prima', kontak: '08123456789', email: 'info@solusiit.co.id', alamat: 'Jl. Jend. Sudirman No. 45, Jakarta' },
    { id: 'ven-002', nama: 'PT PrintSolusi Prima', kontak: '08198765432', email: 'sales@printsolusi.co.id', alamat: 'Jl. Pemuda No. 12, Surabaya' }
  ]);
};

export const addVendor = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updateVendor = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteVendor = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
