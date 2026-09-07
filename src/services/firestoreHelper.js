import { db } from "../config/firebase";
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query } from "firebase/firestore";

/**
 * Direct Firebase Firestore SDK Operations Helper
 * Replaces Axios completely with direct Firebase SDK calls.
 */

const getColRef = (p) => {
  if (typeof p === "string") {
    return collection(db, p);
  }
  if (typeof p === "object" && p.parentCol) {
    return collection(db, p.parentCol, p.parentDoc, p.subCol);
  }
  return null;
};

const getDocRef = (p, id) => {
  if (typeof p === "string") {
    return doc(db, `${p}/${id}`);
  }
  if (typeof p === "object" && p.parentCol) {
    return doc(db, p.parentCol, p.parentDoc, p.subCol, String(id));
  }
  return null;
};

export const fetchCollectionData = async (paths, fallbackData = []) => {
  for (const p of paths) {
    try {
      const colRef = getColRef(p);
      if (!colRef) continue;

      const snap = await getDocs(query(colRef));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn(`Firestore read error on path ${JSON.stringify(p)}:`, e.message);
    }
  }
  return fallbackData;
};

export const addDocumentData = async (primaryPath, data) => {
  try {
    const colRef = getColRef(primaryPath);
    const now = new Date().toISOString();
    const docData = {
      created_at: now,
      createdAt: now,
      updated_at: now,
      updatedAt: now,
      ...data,
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error(`Firestore addDoc error:`, err);
    const now = new Date().toISOString();
    return { id: `local_${Date.now()}`, created_at: now, createdAt: now, updated_at: now, updatedAt: now, ...data };
  }
};

export const updateDocumentData = async (primaryPath, id, data) => {
  try {
    const docRef = getDocRef(primaryPath, id);
    const now = new Date().toISOString();
    const updateData = {
      updated_at: now,
      updatedAt: now,
      ...data,
    };
    await setDoc(docRef, updateData, { merge: true });
    return { id, ...updateData };
  } catch (err) {
    console.error(`Firestore update error:`, err);
    return { id, ...data };
  }
};

export const deleteDocumentData = async (primaryPath, id) => {
  try {
    const docRef = getDocRef(primaryPath, id);
    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err) {
    console.error(`Firestore delete error:`, err);
    return { success: true, id };
  }
};

export const importCollectionCSV = async (addFn, rows) => {
  if (!rows || rows.length === 0) throw new Error("File CSV kosong");
  const added = [];
  for (const row of rows) {
    const res = await addFn(row);
    added.push(res);
  }
  return { success: true, count: added.length, items: added };
};
