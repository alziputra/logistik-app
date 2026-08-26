import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/aset_tanah',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'aset_tanah' }
];

export const getAsetTanah = async () => {
  return fetchCollectionData(PATHS, [
    { id: 'at-001', namaAset: 'Gedung Kantor Cabang Medan', unit_kerja: 'CP Medan Utama', alamat: 'Jl. Gatot Subroto No. 100, Medan', luasTanah: '500 m2', luas_tanah_m2: 500, statusKepemilikan: 'SHM Milik Pegadaian' }
  ]);
};

export const addAsetTanah = async (formData) => {
  return addDocumentData(PATHS[0], formData);
};

export const updateAsetTanah = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

export const deleteAsetTanah = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
