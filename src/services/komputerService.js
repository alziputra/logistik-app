import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData, importCollectionCSV } from './firestoreHelper';

const PATHS = [
  'logistik/devices/computers',
  'logistik/devices/komputer',
  'devices/computers',
  'devices/komputer',
  'computers',
  'komputer'
];

export const getKomputer = async () => {
  const rawItems = await fetchCollectionData(PATHS, [
    { id: 'pc-001', produk: 'PC Desktop Core i5', namaUnit: 'PC Desktop Core i5', sn: 'SN-PC-2024-001', serialNumber: 'SN-PC-2024-001', outlet: 'CP Medan Utama', ipAddress: '192.168.1.10', status: 'Sewa Berjalan', vendor: 'PT Solusi IT Prima', tanggalMulai: '2024-01-15', tanggalSelesai: '2026-12-31', spkNo: 'SPK/COMP/2024/001' },
    { id: 'pc-002', produk: 'Laptop Workstation i7', namaUnit: 'Laptop Workstation i7', sn: 'SN-NB-2024-089', serialNumber: 'SN-NB-2024-089', outlet: 'CP Jakarta Central', ipAddress: '192.168.2.15', status: 'Sewa Berjalan', vendor: 'PT Teknologi Nusantara', tanggalMulai: '2024-02-01', tanggalSelesai: '2025-02-01', spkNo: 'SPK/COMP/2024/002' }
  ]);

  return rawItems.map((item) => ({
    ...item,
    produk: item.produk || item.namaUnit || item.nama || item.model || "PC Workstation",
    sn: item.sn || item.serialNumber || item.no_sn || item.serial_number || "-",
    outlet: item.outlet || item.nama_outlet || item.lokasi || item.cabang || "CP Medan Utama",
    ipAddress: item.ipAddress || item.ip_address || item.ip || "-",
    status: item.status || "Sewa Berjalan",
  }));
};

export const addKomputer = async (formData) => {
  const payload = {
    ...formData,
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    outlet: formData.outlet || formData.nama_outlet || "",
    ipAddress: formData.ipAddress || formData.ip_address || "",
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateKomputer = async (id, formData) => {
  const payload = {
    ...formData,
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    outlet: formData.outlet || formData.nama_outlet || "",
    ipAddress: formData.ipAddress || formData.ip_address || "",
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteKomputer = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

export const importKomputerCSV = async (rows) => {
  return importCollectionCSV(addKomputer, rows);
};


