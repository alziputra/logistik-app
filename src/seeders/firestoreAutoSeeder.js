import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { SEED_CATALOG } from './seedCatalog';

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

// Clean up deprecated subcollections like instansi, asets, users under master
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
    // 1. Clean deprecated subcollections
    await cleanDeprecatedCollections();

    // 2. Ensure active collections are seeded
    for (const group of SEED_CATALOG) {
      for (const pathStr of group.paths) {
        const colRef = getCollectionRef(pathStr);
        if (!colRef) continue;

        try {
          const snap = await getDocs(colRef);
          const isVendors = pathStr === 'logistik/master/vendors';
          if (snap.empty || (isVendors && snap.size < 35)) {
            console.log(`[Firestore AutoSeeder] Syncing sub-koleksi ${pathStr} (${group.items.length} dokumen)...`);
            for (const item of group.items) {
              const { id, ...itemData } = item;
              const docRef = getDocumentRef(pathStr, id);
              if (docRef) {
                await setDoc(docRef, { ...itemData, updated_at: new Date().toISOString() }, { merge: true });
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
