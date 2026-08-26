import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/auth/users',
  { parentCol: 'logistik', parentDoc: 'auth', subCol: 'users' }
];

export const getUsers = async () => {
  const data = await fetchCollectionData(PATHS, [
    { id: 'usr-001', nama: 'Admin Logistik', email: 'admin@logistik.com', role: 'admin' },
    { id: 'usr-002', nama: 'User Biasa', email: 'user@gmail.com', role: 'user' }
  ]);

  return data.map((u) => ({
    ...u,
    nama: u.nama || u.name || 'User',
    name: u.name || u.nama || 'User',
  }));
};

export const addUser = async (formData) => {
  const nameValue = formData.name || formData.nama || '';
  const payload = {
    nama: nameValue,
    email: formData.email || '',
    role: formData.role || 'user',
    created_at: new Date().toISOString()
  };

  const res = await addDocumentData(PATHS[0], payload);
  return {
    ...res,
    name: nameValue,
    nama: nameValue,
  };
};

export const updateUser = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteUser = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
