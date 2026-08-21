import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/operations/transactions',
  'logistik/operations/transaksi',
  'operations/transactions',
  'operations/transaksi',
  'transactions',
  'transaksi'
];

export const getTransaksi = async () => {
  return fetchCollectionData(PATHS, []);
};

export const createTransaksi = async (data) => {
  return addDocumentData(PATHS[0], data);
};

export const addTransaksi = createTransaksi;

export const updateTransaksi = async (id, data) => {
  return updateDocumentData(PATHS[0], id, data);
};

export const deleteTransaksi = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

