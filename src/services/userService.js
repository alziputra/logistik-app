import { fetchCollectionData, addDocumentData, updateDocumentData, deleteDocumentData } from './firestoreHelper';
import { db, firebaseConfig } from '../config/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

const PATHS = [
  'logistik/auth/users',
  { parentCol: 'logistik', parentDoc: 'auth', subCol: 'users' }
];

export const getUsers = async () => {
  const data = await fetchCollectionData(PATHS, [
    { id: 'usr-001', nama: 'Admin Logistik', email: 'admin@logistik.com', role: 'admin' },
    { id: 'usr-002', nama: 'User Biasa', email: 'user@gmail.com', role: 'user' }
  ]);

  // Filter out soft-deleted users (deleted: true)
  return data
    .filter((u) => !u.deleted)
    .map((u) => ({
      ...u,
      nama: u.nama || u.name || 'User',
      name: u.name || u.nama || 'User',
    }));
};

export const addUser = async (formData) => {
  const nameValue = formData.name || formData.nama || '';
  const now = new Date().toISOString();
  const payload = {
    nama: nameValue,
    name: nameValue,
    email: formData.email || '',
    role: formData.role || 'user',
    status: formData.status || 'Aktif',
    mustChangePassword: formData.mustChangePassword ?? false,
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
  };

  const docId = formData.id || formData.uid;
  if (docId) {
    try {
      const docRef = doc(db, 'logistik', 'auth', 'users', String(docId));
      await setDoc(docRef, { ...payload, id: docId, uid: docId }, { merge: true });
      return { id: docId, uid: docId, ...payload };
    } catch (err) {
      console.warn("Direct setDoc user in Firestore failed, fallback to addDoc:", err);
    }
  }

  const res = await addDocumentData(PATHS[0], payload);
  return {
    ...res,
    name: nameValue,
    nama: nameValue,
  };
};

export const createAdminUser = async ({ name, email, password, role }) => {
  let createdUid = null;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();

  // Buat user di Firebase Auth menggunakan instance secondary app (agar Admin tidak logout)
  try {
    const secondaryAppName = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
    createdUid = userCredential.user.uid;
    await updateProfile(userCredential.user, { displayName: cleanName }).catch(() => {});
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  } catch (authErr) {
    console.warn("Secondary Firebase Auth user creation warning:", authErr.message);
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error(`Email "${cleanEmail}" sudah terdaftar di sistem. Gunakan email lain atau perbarui akun yang sudah ada.`);
    } else if (authErr.code === 'auth/weak-password') {
      throw new Error("Password sementara minimal 6 karakter.");
    }
  }

  const newUid = createdUid || `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const payload = {
    id: newUid,
    uid: newUid,
    name: cleanName,
    nama: cleanName,
    email: cleanEmail,
    role: role || 'user',
    status: 'Aktif',
    mustChangePassword: true,
    tempPassword: true,
    tempPasswordValue: password, // Menyimpan password sementara untuk verifikasi jika terjadi typo
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
  };

  const createdDoc = await addUser(payload);
  return { ...createdDoc, mustChangePassword: true, tempPasswordValue: password };
};

export const updateUser = async (id, formData) => {
  return updateDocumentData(PATHS[0], id, formData);
};

/**
 * Soft-delete: Tandai user sebagai deleted di Firestore.
 * Firebase Auth tidak bisa dihapus dari frontend tanpa Admin SDK,
 * tapi user yang sudah ditandai deleted akan diblokir saat login.
 */
export const deleteUser = async (id) => {
  try {
    const docRef = doc(db, 'logistik', 'auth', 'users', String(id));
    const now = new Date().toISOString();
    await setDoc(docRef, {
      deleted: true,
      status: 'Nonaktif',
      deleted_at: now,
      updated_at: now,
    }, { merge: true });
    return { success: true, id };
  } catch (err) {
    console.error('Soft delete user failed:', err);
    return { success: false, id };
  }
};

