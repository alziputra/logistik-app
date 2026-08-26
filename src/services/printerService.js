import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData, importCollectionCSV } from './firestoreHelper';

const PATHS = [
  'logistik/devices/printers',
  { parentCol: 'logistik', parentDoc: 'devices', subCol: 'printers' }
];

export const getPrinter = async () => {
  const rawItems = await fetchCollectionData(PATHS, [
    { id: 'pr-001', produk: 'Printer Laserjet Multi-Function', namaUnit: 'Printer Laserjet Multi-Function', sn: 'SN-PR-99812', serialNumber: 'SN-PR-99812', outlet: 'CP Medan Utama', status: 'Sewa Berjalan', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2024-01-10', tanggalSelesai: '2026-01-10', spkNo: 'SPK/PRNT/2024/001' },
    { id: 'pr-002', produk: 'Printer Passbook BP-20', namaUnit: 'Printer Passbook BP-20', sn: 'SN-PB-54321', serialNumber: 'SN-PB-54321', outlet: 'CP Surabaya Barat', status: 'Sewa Berjalan', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2024-03-01', tanggalSelesai: '2025-03-01', spkNo: 'SPK/PRNT/2024/002' }
  ]);

  return rawItems.map((item) => ({
    ...item,
    produk: item.produk || item.namaUnit || item.nama || item.model || "Printer Passbook",
    sn: item.sn || item.serialNumber || item.no_sn || item.serial_number || "-",
    outlet: item.outlet || item.nama_outlet || item.lokasi || item.cabang || "CP Medan Utama",
    status: item.status || "Sewa Berjalan",
  }));
};

export const addPrinter = async (formData) => {
  const payload = {
    ...formData,
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    outlet: formData.outlet || formData.nama_outlet || "",
  };
  return addDocumentData(PATHS[0], payload);
};

export const updatePrinter = async (id, formData) => {
  const payload = {
    ...formData,
    produk: formData.produk || formData.namaUnit || formData.nama || "",
    sn: formData.sn || formData.serialNumber || "",
    outlet: formData.outlet || formData.nama_outlet || "",
  };
  return updateDocumentData(PATHS[0], id, payload);
};

export const deletePrinter = async (id) => {
  return deleteDocumentData(PATHS[0], id);
};

export const importPrinterCSV = async (rows) => {
  return importCollectionCSV(addPrinter, rows);
};
