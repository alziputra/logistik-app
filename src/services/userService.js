import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'users' },
  { parentCol: 'logistik', parentDoc: 'auth', subCol: 'users' },
  'users'
];

export const getUsers = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'usr-001', nama: 'Admin Logistik', email: 'admin@pegadaian.co.id', role: 'admin' },
    { id: 'usr-002', nama: 'Manajer Logistik', email: 'manager@pegadaian.co.id', role: 'manager' }
  ]);
};

export const addUser = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updateUser = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteUser = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

