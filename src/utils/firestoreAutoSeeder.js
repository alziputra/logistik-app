import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const SEED_CATALOG = [
  {
    name: 'Computers (Perangkat Komputer)',
    paths: ['logistik/devices/computers'],
    items: [
      { id: 'pc-001', produk: 'PC Desktop Core i5', namaUnit: 'PC Desktop Core i5', sn: 'SN-PC-2024-001', serialNumber: 'SN-PC-2024-001', outlet: 'CP Medan Utama', ipAddress: '192.168.1.10', status: 'Sewa Berjalan', vendor: 'PT Solusi IT Prima', tanggalMulai: '2024-01-15', tanggalSelesai: '2026-12-31', spkNo: 'SPK/COMP/2024/001' },
      { id: 'pc-002', produk: 'Laptop Workstation i7', namaUnit: 'Laptop Workstation i7', sn: 'SN-NB-2024-089', serialNumber: 'SN-NB-2024-089', outlet: 'CP Jakarta Central', ipAddress: '192.168.2.15', status: 'Sewa Berjalan', vendor: 'PT Teknologi Nusantara', tanggalMulai: '2024-02-01', tanggalSelesai: '2025-02-01', spkNo: 'SPK/COMP/2024/002' },
      { id: 'pc-003', produk: 'OptiPlex 3060', namaUnit: 'OptiPlex 3060', sn: '10.81.241.12', serialNumber: '10.81.241.12', outlet: 'UPC JATIWARINGIN RAYA', ipAddress: '10.81.241.12', status: 'Sewa Habis', vendor: 'PT Solusi IT Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/COMP/2022/010' },
      { id: 'pc-004', produk: 'Dell Optiplex 3070 MFF', namaUnit: 'Dell Optiplex 3070 MFF', sn: '10.82.25.65', serialNumber: '10.82.25.65', outlet: 'CP BUARAN', ipAddress: '10.82.25.65', status: 'Sewa Habis', vendor: 'PT Solusi IT Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/COMP/2022/011' },
      { id: 'pc-005', produk: 'Dell Optiplex 3070 MFF', namaUnit: 'Dell Optiplex 3070 MFF', sn: '10.86.9.10', serialNumber: '10.86.9.10', outlet: 'UPS EMBRIO', ipAddress: '10.86.9.10', status: 'Sewa Habis', vendor: 'PT Solusi IT Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/COMP/2022/012' }
    ]
  },
  {
    name: 'Printers (Perangkat Printer)',
    paths: ['logistik/devices/printers'],
    items: [
      { id: 'pr-001', produk: 'Printer Laserjet Multi-Function', namaUnit: 'Printer Laserjet Multi-Function', sn: 'SN-PR-99812', serialNumber: 'SN-PR-99812', outlet: 'CP Medan Utama', status: 'Sewa Berjalan', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2024-01-10', tanggalSelesai: '2026-01-10', spkNo: 'SPK/PRNT/2024/001' },
      { id: 'pr-002', produk: 'Printer Passbook BP-20', namaUnit: 'Printer Passbook BP-20', sn: 'SN-PB-54321', serialNumber: 'SN-PB-54321', outlet: 'CP Surabaya Barat', status: 'Sewa Berjalan', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2024-03-01', tanggalSelesai: '2025-03-01', spkNo: 'SPK/PRNT/2024/002' },
      { id: 'pr-003', produk: 'LQ-310 DOT MATRIX', namaUnit: 'LQ-310 DOT MATRIX', sn: 'R9JYJ02777', serialNumber: 'R9JYJ02777', outlet: 'UPS GALUH MAS', status: 'Sewa Habis', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/PRNT/2022/005' },
      { id: 'pr-004', produk: 'LQ-310 DOT MATRIX', namaUnit: 'LQ-310 DOT MATRIX', sn: 'R9JYJ02932', serialNumber: 'R9JYJ02932', outlet: 'CP KRANGGAN', status: 'Sewa Habis', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/PRNT/2022/006' },
      { id: 'pr-005', produk: 'EPSON L4260 ECO TANK', namaUnit: 'EPSON L4260 ECO TANK', sn: 'X85S008667', serialNumber: 'X85S008667', outlet: 'CP GUNUNG BATU', status: 'Sewa Habis', vendor: 'PT PrintSolusi Prima', tanggalMulai: '2022-01-01', tanggalSelesai: '2025-01-01', spkNo: 'SPK/PRNT/2022/007' }
    ]
  },
  {
    name: 'Outlets (Outlet & Instansi)',
    paths: ['logistik/master/outlets'],
    items: [
      { id: 'ins-001', kode: 'CPM01', code: 'CPM01', nama: 'CP Medan Utama', status: 'CABANG', kodeCabang: '001', cabangInduk: 'KANWIL MEDAN', area: 'AREA MEDAN 1', jenis: 'KONVEN', clustering: 'CLUSTER A', alamat: 'Jl. Gatot Subroto No. 100, Medan' },
      { id: 'ins-002', kode: 'CPJ02', code: 'CPJ02', nama: 'CP Jakarta Central', status: 'CABANG', kodeCabang: '002', cabangInduk: 'KANWIL JAKARTA 1', area: 'AREA JAKARTA CENTRAL', jenis: 'KONVEN', clustering: 'CLUSTER A', alamat: 'Jl. Kramat Raya No. 162, Jakarta' },
      { id: 'ins-003', kode: 'UPC03', code: 'UPC03', nama: 'UPC JATIWARINGIN RAYA', status: 'UPC', kodeCabang: '003', cabangInduk: 'KANWIL JAKARTA 2', area: 'AREA BEKASI', jenis: 'KONVEN', clustering: 'NON CLUSTER', alamat: 'Jl. Jatiwaringin Raya No. 45, Bekasi' },
      { id: 'ins-004', kode: 'CP04', code: 'CP04', nama: 'CP BUARAN', status: 'CABANG', kodeCabang: '004', cabangInduk: 'KANWIL JAKARTA 2', area: 'AREA BEKASI', jenis: 'KONVEN', clustering: 'CLUSTER B', alamat: 'Jl. Raden Inten No. 88, Buaran' },
      { id: 'ins-005', kode: 'UPS05', code: 'UPS05', nama: 'UPS EMBRIO', status: 'UPS', kodeCabang: '005', cabangInduk: 'KANWIL JAKARTA 2', area: 'AREA BEKASI', jenis: 'KONVEN', clustering: 'NON CLUSTER', alamat: 'Jl. Embrio No. 12, Jakarta' }
    ]
  },
  {
    name: 'Inventories (Barang / Inventory)',
    paths: ['logistik/master/inventory'],
    items: [
      { id: 'ast-001', nama: 'Kertas HVS A4 80gsm', kuantitas: 150, stok: 150, satuan: 'Rim', status: 'Tersedia' },
      { id: 'ast-002', nama: 'Pulpen Standard Black 0.5', kuantitas: 400, stok: 400, satuan: 'Pcs', status: 'Tersedia' },
      { id: 'ast-003', nama: 'Kursi Kerja Ergonomis Mesh', kuantitas: 25, stok: 25, satuan: 'Unit', status: 'Tersedia' }
    ]
  },
  {
    name: 'Vendors (Supplier)',
    paths: ['logistik/master/vendors'],
    items: [
      { id: 'ven-001', nama: 'PT Solusi IT Prima', kontak: '08123456789', email: 'info@solusiit.co.id', alamat: 'Jl. Jend. Sudirman No. 45, Jakarta' },
      { id: 'ven-002', nama: 'PT PrintSolusi Prima', kontak: '08198765432', email: 'sales@printsolusi.co.id', alamat: 'Jl. Pemuda No. 12, Surabaya' },
      { id: 'ven-003', nama: 'PT Teknologi Nusantara', kontak: '08137788990', email: 'hello@teknusa.co.id', alamat: 'Jl. Asia Afrika No. 88, Bandung' }
    ]
  },
  {
    name: 'Users (Pengguna)',
    paths: ['logistik/auth/users'],
    items: [
      { id: 'usr-001', nama: 'Admin Logistik', name: 'Admin Logistik', email: 'admin@logistik.co.id', role: 'admin', created_at: new Date().toISOString() },
      { id: 'usr-002', nama: 'User Operasional', name: 'User Operasional', email: 'user@logistik.co.id', role: 'user', created_at: new Date().toISOString() }
    ]
  },
  {
    name: 'AsetTanah',
    paths: ['logistik/master/aset_tanah'],
    items: [
      { id: 'at-001', namaAset: 'Gedung Kantor Cabang Medan', unit_kerja: 'CP Medan Utama', alamat: 'Jl. Gatot Subroto No. 100, Medan', luasTanah: '500 m2', luas_tanah_m2: 500, statusKepemilikan: 'SHM Milik Pegadaian' }
    ]
  },
  {
    name: 'MenuSewa',
    paths: ['logistik/master/menu_sewa'],
    items: [
      { id: 'sw-001', namaGedung: 'Gedung Ruko Outlet UPC Helvetia', pemilik: 'H. Ahmad', biayaSewa: 45000000, tanggalMulai: '2024-01-01', tanggalSelesai: '2026-12-31', status: 'Sewa Berjalan' }
    ]
  },
  {
    name: 'Renovasi',
    paths: ['logistik/master/renovasi'],
    items: [
      { id: 'rn-001', namaProyek: 'Renovasi Interior CP Medan Utama', kontraktor: 'PT Karya Cipta Bangun', biaya: 120000000, status: 'Selesai' }
    ]
  },
  {
    name: 'PengamananKorporasi',
    paths: ['logistik/master/pengamanan'],
    items: [
      { id: 'sec-001', fasilitas: 'CCTV Online 16 Channel', lokasi: 'CP Medan Utama', status: 'Berfungsi Baik' }
    ]
  },
  {
    name: 'SpkHistories',
    paths: ['logistik/master/spk'],
    items: [
      { id: 'spk-001', noSpk: 'SPK/LOG/2024/001', perihal: 'Pengadaan Komputer & Printer', tanggal: '2024-01-10' }
    ]
  },
  {
    name: 'SoppHistories',
    paths: ['logistik/master/sopp'],
    items: [
      { id: 'sopp-001', noSopp: 'SOPP/LOG/2024/001', perihal: 'SOP Pengelolaan Inventaris Outlet', tanggal: '2024-01-05' }
    ]
  },
  {
    name: 'Transactions',
    paths: ['logistik/operations/transactions'],
    items: [
      { id: 'trx-001', nomorSurat: '453/00108.00/04/2026', tanggal: '2026-07-20', jenisTransaksi: 'Barang Masuk', pengirimNama: 'Ahmad Dendy Syaputra', penerimaNama: 'jua' }
    ]
  },
  {
    name: 'ActivityLogs',
    paths: ['logistik/operations/activity_logs'],
    items: [
      { id: 'log-001', user: 'Admin Logistik', action: 'Inisialisasi Database Firestore Berhasil', timestamp: new Date().toISOString() }
    ]
  }
];

const getCollectionRef = (pathStr) => {
  const parts = pathStr.split('/');
  if (parts.length === 1) return collection(db, parts[0]);
  if (parts.length === 3) return collection(db, parts[0], parts[1], parts[2]);
  return null;
};

const getDocumentRef = (pathStr, docId) => {
  const parts = pathStr.split('/');
  if (parts.length === 1) return doc(db, parts[0], String(docId));
  if (parts.length === 3) return doc(db, parts[0], parts[1], parts[2], String(docId));
  return null;
};

// Function to clean up deprecated subcollections like instansi, asets, users under master
const cleanDeprecatedCollections = async () => {
  try {
    const deprecatedPaths = [
      collection(db, 'logistik', 'master', 'users'),
      collection(db, 'logistik', 'master', 'instansi'),
      collection(db, 'logistik', 'master', 'asets'),
      collection(db, 'users'),
      collection(db, 'instansi'),
      collection(db, 'asets')
    ];

    for (const colRef of deprecatedPaths) {
      try {
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          console.log(`[Firestore AutoSeeder] Membersihkan koleksi terdepresiasi pada: ${colRef.path}`);
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
          }
          console.log(`[Firestore AutoSeeder] Selesai menghapus dokumen pada: ${colRef.path}`);
        }
      } catch (err) {
        // Ignore read errors for non-existent collections
      }
    }
  } catch (err) {
    console.warn("[Firestore AutoSeeder] Cleanup error:", err.message);
  }
};

export const ensureFirestoreCollectionsSeeded = async () => {
  try {
    // 1. Clean deprecated subcollections (instansi -> outlets, asets -> inventory, master/users -> auth/users)
    await cleanDeprecatedCollections();

    // 2. Ensure active collections are seeded
    for (const group of SEED_CATALOG) {
      for (const pathStr of group.paths) {
        const colRef = getCollectionRef(pathStr);
        if (!colRef) continue;

        try {
          const snap = await getDocs(colRef);
          if (snap.empty) {
            console.log(`[Firestore AutoSeeder] Sub-koleksi ${pathStr} belum ada. Menambahkan ${group.items.length} dokumen...`);
            for (const item of group.items) {
              const { id, ...itemData } = item;
              const docRef = getDocumentRef(pathStr, id);
              if (docRef) {
                await setDoc(docRef, { ...itemData, created_at: new Date().toISOString() }, { merge: true });
              }
            }
          }
        } catch (e) {
          console.warn(`[Firestore AutoSeeder] Read error on ${pathStr}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error("[Firestore AutoSeeder] Seeding error:", err);
  }
};
