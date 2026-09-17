import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData, importCollectionCSV, batchUpsertDocuments } from './firestoreHelper';

const PATHS = [
  'logistik/devices/computers',
  { parentCol: 'logistik', parentDoc: 'devices', subCol: 'computers' }
];

export const getKomputer = async () => {
  const rawItems = await fetchCollectionData(PATHS, [
    { id: 'pc-001', produk: 'PC Desktop Core i5', namaUnit: 'PC Desktop Core i5', sn: 'SN-PC-2024-001', serialNumber: 'SN-PC-2024-001', outlet: 'CP Medan Utama', ipAddress: '192.168.1.10', status: 'Sewa Berjalan', vendor: 'PT Solusi IT Prima', tanggalMulai: '2024-01-15', tanggalSelesai: '2026-12-31', spkNo: 'SPK/COMP/2024/001' },
    { id: 'pc-002', produk: 'Laptop Workstation i7', namaUnit: 'Laptop Workstation i7', sn: 'SN-NB-2024-089', serialNumber: 'SN-NB-2024-089', outlet: 'CP Jakarta Central', ipAddress: '192.168.2.15', status: 'Sewa Berjalan', vendor: 'PT Teknologi Nusantara', tanggalMulai: '2024-02-01', tanggalSelesai: '2025-02-01', spkNo: 'SPK/COMP/2024/002' }
  ]);

  return rawItems.map((item) => {
    const v = item.penyedia || item.vendor || item.nama_vendor || item.vendorNama || "-";
    return {
      ...item,
      produk: item.produk || item.namaUnit || item.nama || item.model || "PC Workstation",
      sn: item.sn || item.serialNumber || item.no_sn || item.serial_number || "-",
      outlet: item.outlet || item.nama_outlet || item.lokasi || item.cabang || "CP Medan Utama",
      ipAddress: item.ipAddress || item.ip_address || item.ip || "-",
      penyedia: v,
      vendor: v,
      status: item.status || "Sewa Berjalan",
    };
  });
};

export const addKomputer = async (formData) => {
  const v = formData.penyedia || formData.vendor || formData.nama_vendor || formData.vendorNama || "-";
  const payload = {
    ...formData,
    idOutlet: formData.idOutlet || formData.id_outlet || "",
    outlet: formData.outlet || formData.nama_outlet || "",
    username: formData.username || "",
    hostname: formData.hostname || "",
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    no_spk: formData.no_spk || formData.spk || formData.spkNo || "",
    penyedia: v,
    vendor: v,
    tanggalMulai: formData.tanggalMulai || formData.tanggal_mulai || "",
    tanggalSelesai: formData.tanggalSelesai || formData.tanggal_selesai || "",
    ipAddress: formData.ipAddress || formData.ip_address || "",
    macAddress: formData.macAddress || formData.mac || "",
    ram: formData.ram || formData.memory || "",
    cpu: formData.cpu || formData.processor || "",
    storage: formData.storage || formData.harddisk || "",
    os: formData.os || formData.osName || "",
    osVersion: formData.osVersion || "",
    lastUpdate: formData.lastUpdate || new Date().toISOString().slice(0, 10),
    timeUpdate: formData.timeUpdate || new Date().toTimeString().slice(0, 8),
    kondisi: formData.kondisi || "BAIK",
    status: formData.status || "Sewa Berjalan",
  };
  return addDocumentData(PATHS[0], payload);
};

export const updateKomputer = async (id, formData) => {
  const v = formData.penyedia || formData.vendor || formData.nama_vendor || formData.vendorNama || "-";
  const payload = {
    ...formData,
    idOutlet: formData.idOutlet || formData.id_outlet || "",
    outlet: formData.outlet || formData.nama_outlet || "",
    username: formData.username || "",
    hostname: formData.hostname || "",
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    no_spk: formData.no_spk || formData.spk || formData.spkNo || "",
    penyedia: v,
    vendor: v,
    tanggalMulai: formData.tanggalMulai || formData.tanggal_mulai || "",
    tanggalSelesai: formData.tanggalSelesai || formData.tanggal_selesai || "",
    ipAddress: formData.ipAddress || formData.ip_address || "",
    macAddress: formData.macAddress || formData.mac || "",
    ram: formData.ram || formData.memory || "",
    cpu: formData.cpu || formData.processor || "",
    storage: formData.storage || formData.harddisk || "",
    os: formData.os || formData.osName || "",
    osVersion: formData.osVersion || "",
    lastUpdate: formData.lastUpdate || new Date().toISOString().slice(0, 10),
    timeUpdate: formData.timeUpdate || new Date().toTimeString().slice(0, 8),
    kondisi: formData.kondisi || "BAIK",
    status: formData.status || "Sewa Berjalan",
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deleteKomputer = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

export const importKomputerCSV = async (rows) => {
  return importCollectionCSV(addKomputer, rows);
};

export const batchUpsertKomputer = async (items) => {
  return batchUpsertDocuments(PATHS[0], items);
};

