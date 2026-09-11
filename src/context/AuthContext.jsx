import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { addActivityLog } from "../services/activityLogService";
import { addUser } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const getNameFromEmail = (email, existingName) => {
    if (existingName && existingName !== "officer" && existingName !== "admin" && existingName !== "user") return existingName;
    if (!email) return "Pengguna Logistik";
    const e = email.toLowerCase();
    if (e === "officer@gmail.com") return "Dio Haris Kurniawan";
    if (e.includes("admin") || e === "admin@logistik.com" || e === "admin@logistik.co.id") return "Alzi Rahmana Putra";
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const determineRole = (email, existingRole) => {
    if (existingRole) {
      const r = String(existingRole).toLowerCase();
      if (r === "admin" || r === "administrator") return "admin";
      if (r === "officer" || r === "logistik officer" || r === "manager") return "officer";
      if (r === "user" || r === "viewer" || r === "guest") return "user";
    }
    if (!email) return "user";
    const e = email.toLowerCase();
    if (e.includes("admin") || e === "admin@logistik.com" || e === "admin@logistik.co.id") {
      return "admin";
    }
    if (e === "officer@gmail.com" || e.includes("officer")) {
      return "officer";
    }
    // Pengguna baru / umum berstatus "user"
    return "user";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let firestoreRole = null;
        let firestoreName = null;
        let mustChangePassword = false;
        let tempPasswordVal = null;

        try {
          // Sync with Firestore collection: logistik > auth > users
          const userDocRef = doc(db, "logistik", "auth", "users", firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            firestoreRole = data.role;
            firestoreName = data.nama || data.name;
            mustChangePassword = Boolean(data.mustChangePassword);
            tempPasswordVal = data.tempPasswordValue || null;
          } else {
            // Auto create doc if missing in Firestore
            const cleanName = firebaseUser.displayName || getNameFromEmail(firebaseUser.email);
            const initialRole = determineRole(firebaseUser.email);
            const docPayload = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              nama: cleanName,
              name: cleanName,
              email: firebaseUser.email,
              role: initialRole,
              status: "Aktif",
              mustChangePassword: false,
              created_at: new Date().toISOString(),
            };
            await setDoc(userDocRef, docPayload, { merge: true });
            firestoreRole = initialRole;
            firestoreName = cleanName;
            mustChangePassword = false;
          }
        } catch (e) {
          console.warn("Firestore user sync warning in onAuthStateChanged:", e);
        }

        const userRole = determineRole(firebaseUser.email, firestoreRole);
        const userName = firestoreName || getNameFromEmail(firebaseUser.email, firebaseUser.displayName);

        const userData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: userName,
          nama: userName,
          role: userRole,
          mustChangePassword: mustChangePassword,
          tempPasswordValue: tempPasswordVal,
        };
        setUser(userData);
        setToken(firebaseUser.accessToken || "firebase-token");
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", firebaseUser.accessToken || "firebase-token");
      } else {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let firestoreRole = null;
      let firestoreName = null;
      let mustChangePassword = false;

      try {
        // Ambil data user dari Firestore logistik/auth/users
        const userDocRef = doc(db, "logistik", "auth", "users", firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const docData = snap.data();

          // ❌ Blokir login jika user sudah dihapus (soft delete)
          if (docData.deleted === true || docData.status === "Nonaktif") {
            await signOut(auth);
            return {
              success: false,
              message: "Akun Anda telah dinonaktifkan atau dihapus oleh Administrator. Silakan hubungi admin sistem.",
            };
          }

          firestoreRole = docData.role;
          firestoreName = docData.nama || docData.name;
          mustChangePassword = Boolean(docData.mustChangePassword);
        } else {
          // Jika dokumen belum ada di Firestore (misal registrasi sebelum fix), buat otomatis
          const cleanName = firebaseUser.displayName || getNameFromEmail(firebaseUser.email);
          const initialRole = determineRole(firebaseUser.email);
          const newDocPayload = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            nama: cleanName,
            name: cleanName,
            email: firebaseUser.email,
            role: initialRole,
            status: "Aktif",
            mustChangePassword: false,
            created_at: new Date().toISOString(),
          };
          await setDoc(userDocRef, newDocPayload, { merge: true });
          firestoreRole = initialRole;
          firestoreName = cleanName;
        }
      } catch (e) {
        console.warn("Firestore lookup in login warning:", e);
      }

      const userRole = determineRole(firebaseUser.email, firestoreRole);
      const userName = firestoreName || getNameFromEmail(firebaseUser.email, firebaseUser.displayName);

      const userData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: userName,
        nama: userName,
        role: userRole,
        mustChangePassword: mustChangePassword,
        tempPasswordValue: docData?.tempPasswordValue || null,
      };
      const authToken = await firebaseUser.getIdToken();

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("last_active_timestamp", Date.now().toString());
      setToken(authToken);
      setUser(userData);

      addActivityLog({
        user: userData.name,
        user_name: userData.name,
        user_email: userData.email,
        modul: "AUTENTIKASI",
        aksi: "LOGIN",
        keterangan: `Pengguna ${userData.name} (${userData.email}) berhasil login dengan hak akses: ${userRole.toUpperCase()}${mustChangePassword ? " [Wajib Ganti Password]" : ""}`,
      });

      return { success: true, data: { user: userData, token: authToken } };
    } catch (error) {
      console.warn("Firebase login attempt failed:", error.code, error.message);

      // Tangani error jika password atau email salah (antisipasi salah ketik/typo user atau admin)
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        (error.message && (error.message.includes("invalid-credential") || error.message.includes("wrong-password") || error.message.includes("INVALID_LOGIN_CREDENTIALS")))
      ) {
        return {
          success: false,
          message: "Password atau email yang Anda masukkan salah. Mohon periksa kembali apakah ada salah ketik (typo) dan pastikan sesuai dengan password yang diberikan Administrator.",
        };
      }

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          message: "Akun dengan email ini tidak ditemukan. Silakan periksa kembali email Anda atau hubungi Administrator.",
        };
      }

      if (error.code === "auth/user-disabled") {
        return {
          success: false,
          message: "Akun Anda telah dinonaktifkan oleh Administrator.",
        };
      }

      if (error.code === "auth/too-many-requests") {
        return {
          success: false,
          message: "Akses diblokir sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi beberapa saat lagi.",
        };
      }

      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          message: "Format alamat email tidak valid.",
        };
      }

      // Fallback lokal HANYA jika offline / jaringan gagal (network error)
      if (error.code === "auth/network-request-failed" || !window.navigator.onLine) {
        let savedRole = null;
        let savedName = null;
        let mustChangePassword = false;
        let expectedTempPassword = null;
        try {
          const registeredUsersStr = localStorage.getItem("registered_users");
          if (registeredUsersStr) {
            const list = JSON.parse(registeredUsersStr);
            const found = list.find((u) => u.email.toLowerCase() === email.toLowerCase());
            if (found) {
              expectedTempPassword = found.tempPasswordValue;
              savedRole = found.role;
              savedName = found.name || found.nama;
              mustChangePassword = Boolean(found.mustChangePassword);
            }
          }
        } catch (e) {}

        if (expectedTempPassword && expectedTempPassword !== password) {
          return {
            success: false,
            message: "Password yang Anda masukkan salah. Mohon periksa kembali apakah ada salah ketik (typo) dan pastikan sesuai dengan password yang diberikan Administrator.",
          };
        }

        const userRole = determineRole(email, savedRole);
        const userName = getNameFromEmail(email, savedName);
        const fallbackUser = {
          uid: email.includes("admin") ? "local-admin-01" : email.includes("officer") ? "local-officer-01" : `local-user-${Date.now()}`,
          id: email.includes("admin") ? "local-admin-01" : email.includes("officer") ? "local-officer-01" : `local-user-${Date.now()}`,
          email: email,
          name: userName,
          nama: userName,
          role: userRole,
          mustChangePassword: mustChangePassword,
        };
        const fallbackToken = "demo-token-" + Date.now();
        localStorage.setItem("token", fallbackToken);
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        localStorage.setItem("last_active_timestamp", Date.now().toString());
        setToken(fallbackToken);
        setUser(fallbackUser);

        addActivityLog({
          user: fallbackUser.name,
          user_name: fallbackUser.name,
          user_email: fallbackUser.email,
          modul: "AUTENTIKASI",
          aksi: "LOGIN",
          keterangan: `Pengguna ${fallbackUser.name} (${fallbackUser.email}) login ke sistem (Offline Fallback) [Role: ${userRole.toUpperCase()}]`,
        });

        return { success: true, data: { user: fallbackUser, token: fallbackToken } };
      }

      return { success: false, message: error.message || "Login gagal, periksa email dan password Anda" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanName = (name || "").trim() || getNameFromEmail(cleanEmail);
      let firebaseUser = null;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUser = userCredential.user;
        if (firebaseUser) {
          await updateProfile(firebaseUser, { displayName: cleanName }).catch(() => {});
        }
      } catch (authError) {
        console.warn("Firebase createUser failed or fallback:", authError.message);
        if (authError.code === "auth/email-already-in-use") {
          return {
            success: false,
            message: "Email ini sudah terdaftar di Firebase Authentication. Silakan gunakan tab Masuk atau gunakan password Anda.",
          };
        }
      }

      // Setiap user baru yang mendaftar mandiri PASTI berstatus / ber-Role "user" dan tidak wajib ganti password (karena dibuat sendiri)
      const userRole = "user";
      const newUid = firebaseUser?.uid || `usr-${Date.now()}`;

      const userData = {
        uid: newUid,
        id: newUid,
        name: cleanName,
        nama: cleanName,
        email: cleanEmail,
        role: userRole,
        status: "Aktif",
        mustChangePassword: false,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // 1. Simpan langsung ke Firestore collection 'logistik/auth/users'
      try {
        await addUser(userData);
      } catch (fsErr) {
        console.error("Failed to write user to Firestore:", fsErr);
      }

      // 2. Simpan cadangan di localStorage
      try {
        let existingList = [];
        const saved = localStorage.getItem("registered_users");
        if (saved) existingList = JSON.parse(saved);
        existingList.push(userData);
        localStorage.setItem("registered_users", JSON.stringify(existingList));
      } catch (err) {}

      // 3. Log aktivitas pendaftaran
      addActivityLog({
        user: cleanName,
        user_name: cleanName,
        user_email: cleanEmail,
        modul: "AUTENTIKASI",
        aksi: "REGISTER",
        keterangan: `Pendaftaran akun baru: ${cleanName} (${cleanEmail}) berhasil disimpan ke Firebase Firestore dengan Hak Akses: USER`,
      });

      return { success: true, data: userData };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: error.message || "Registrasi gagal, silakan coba lagi." };
    }
  };

  const changeUserPassword = async (currentPassword, newPassword) => {
    try {
      if (!currentPassword || !currentPassword.trim()) {
        return {
          success: false,
          message: "Password saat ini (dari Administrator) wajib diisi.",
        };
      }

      // 1. Jika pengguna login via Firebase Auth
      if (auth.currentUser && auth.currentUser.email) {
        // Re-autentikasi pengguna menggunakan currentPassword dari Admin
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Perbarui password ke password baru pribadi
        await updatePassword(auth.currentUser, newPassword);

        // Perbarui status mustChangePassword di Firestore dan hapus tempPasswordValue
        const userDocRef = doc(db, "logistik", "auth", "users", auth.currentUser.uid);
        const updatePayload = {
          mustChangePassword: false,
          tempPassword: false,
          tempPasswordValue: null,
          passwordChangedAt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, updatePayload, { merge: true });

        // Update state & localStorage
        setUser((prev) => {
          const updated = { ...prev, mustChangePassword: false };
          delete updated.tempPasswordValue;
          localStorage.setItem("user", JSON.stringify(updated));
          return updated;
        });

        addActivityLog({
          user: user?.name || auth.currentUser.email,
          user_name: user?.name || auth.currentUser.email,
          user_email: auth.currentUser.email,
          modul: "AUTENTIKASI",
          aksi: "GANTI_PASSWORD",
          keterangan: `Pengguna ${user?.name || auth.currentUser.email} berhasil memperbarui password sementara ke password baru pribadi.`,
        });

        return { success: true };
      }

      // 2. Fallback demo/local user: pastikan password saat ini diverifikasi jika ada tempPasswordValue
      const currentUid = user?.uid || user?.id;
      let expectedTempPassword = user?.tempPasswordValue;

      if (!expectedTempPassword && currentUid) {
        try {
          const userDocRef = doc(db, "logistik", "auth", "users", String(currentUid));
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            expectedTempPassword = snap.data().tempPasswordValue;
          }
        } catch (e) {}
      }

      // Jika ada data password sementara yang terdaftar dan tidak cocok -> tolak!
      if (expectedTempPassword && expectedTempPassword !== currentPassword) {
        return {
          success: false,
          message: "Password saat ini (yang diberikan Administrator) salah atau tidak sesuai. Mohon periksa kembali apakah ada salah ketik (typo).",
        };
      }

      const savedUserStr = localStorage.getItem("user");
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        u.mustChangePassword = false;
        delete u.tempPasswordValue;
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      }
      return { success: true };
    } catch (err) {
      console.error("Gagal mengganti password:", err);
      let errorMsg = "Gagal memperbarui password. Periksa kembali password lama Anda.";
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/invalid-login-credentials" ||
        (err.message && (err.message.includes("invalid-credential") || err.message.includes("wrong-password") || err.message.includes("INVALID_LOGIN_CREDENTIALS")))
      ) {
        errorMsg = "Password saat ini (yang diberikan Administrator) salah atau tidak sesuai. Mohon periksa kembali apakah ada salah ketik (typo).";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Password baru terlalu lemah. Gunakan minimal 6 karakter kombinasi.";
      } else if (err.code === "auth/too-many-requests") {
        errorMsg = "Terlalu banyak percobaan yang gagal. Silakan coba lagi beberapa saat lagi.";
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = async (reason) => {
    if (user) {
      const isTimeout = reason === "SESSION_TIMEOUT";
      addActivityLog({
        user: user.name || "Petugas Logistik",
        user_name: user.name || "Petugas Logistik",
        user_email: user.email || "",
        modul: "AUTENTIKASI",
        aksi: "LOGOUT",
        keterangan: isTimeout ? `Sesi pengguna ${user.name || user.email} ditutup otomatis oleh sistem karena tidak ada aktivitas (Session Timeout Keamanan)` : `Pengguna ${user.name || user.email} telah logout dari sistem`,
      });
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out of Firebase:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("last_active_timestamp");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        changeUserPassword,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

