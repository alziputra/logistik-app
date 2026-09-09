import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';

const PATHS = [
  'logistik/master/outlets',
  { parentCol: 'logistik', parentDoc: 'master', subCol: 'outlets' }
];

export const getInstansi = async () => {
  const items = await fetchCollectionData(PATHS, [
    { id: 'ins-001', kode: 'CPM01', code: 'CPM01', nama: 'CP Medan Utama', status: 'CABANG', kodeCabang: '001', cabangInduk: 'KANWIL MEDAN', area: 'AREA MEDAN 1', jenis: 'KONVEN', clustering: 'CLUSTER A' },
    { id: 'ins-002', kode: 'CPJ02', code: 'CPJ02', nama: 'CP Jakarta Central', status: 'CABANG', kodeCabang: '002', cabangInduk: 'KANWIL JAKARTA 1', area: 'AREA JAKARTA CENTRAL', jenis: 'KONVEN', clustering: 'CLUSTER A' }
  ]);
  return items.map((item) => ({
    ...item,
    code: item.kode || item.code || "",
  }));
};

export const addInstansi = async (formData) => {
  const isBranch = ["UPC", "CABANG", "UPS", "AREA"].includes(String(formData.status || "").toUpperCase());
  const payload = {
    kode: formData.kode || formData.code || "",
    code: formData.kode || formData.code || "",
    nama: formData.nama || "",
    status: formData.status || "UPC",
    kodeCabang: formData.kodeCabang !== undefined ? formData.kodeCabang : (isBranch ? "" : "-"),
    cabangInduk: formData.cabangInduk !== undefined ? formData.cabangInduk : (isBranch ? "" : "-"),
    clustering: formData.clustering !== undefined ? formData.clustering : (isBranch ? "NON CLUSTER" : "-"),
    jenis: formData.jenis !== undefined ? formData.jenis : (isBranch ? "KONVEN" : "-"),
    area: formData.area !== undefined ? formData.area : (isBranch ? "AREA BEKASI" : "-"),
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateInstansi = async (id, formData) => {
  const isBranch = ["UPC", "CABANG", "UPS", "AREA"].includes(String(formData.status || "").toUpperCase());
  const payload = {
    kode: formData.kode || formData.code || "",
    code: formData.kode || formData.code || "",
    nama: formData.nama || "",
    status: formData.status,
    kodeCabang: formData.kodeCabang !== undefined ? formData.kodeCabang : (isBranch ? "" : "-"),
    cabangInduk: formData.cabangInduk !== undefined ? formData.cabangInduk : (isBranch ? "" : "-"),
    clustering: formData.clustering !== undefined ? formData.clustering : (isBranch ? "NON CLUSTER" : "-"),
    jenis: formData.jenis !== undefined ? formData.jenis : (isBranch ? "KONVEN" : "-"),
    area: formData.area !== undefined ? formData.area : (isBranch ? "AREA BEKASI" : "-"),
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteInstansi = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};
