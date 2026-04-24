// src/hooks/useAuth.js
// Login state, role, logout, idle timeout
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const IDLE_TIME_MS = 10 * 60 * 1000; // 10 menit

/**
 * Menangani autentikasi Firebase, pengambilan role user,
 * logout manual, dan auto-logout saat idle.
 *
 * @param {Function} onLogout  — callback dipanggil setelah logout (misal: reset ke dashboard)
 * @param {Function} showNotif — callback untuk menampilkan notifikasi
 */
export function useAuth(onLogout, showNotif) {
  const [user, setUser]             = useState(null);
  const [userRole, setUserRole]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Listen auth state ──────────────────────────────────────────────────
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef  = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || "user");
          } else {
            await setDoc(userRef, {
              email:      currentUser.email,
              role:       "user",
              created_at: new Date().toISOString(),
            });
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error mengambil role:", error);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Manual logout ──────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout?.();
    } catch {
      showNotif?.("Gagal logout", "error");
    }
  };

  // ── Auto logout saat idle ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let timeoutId;

    const handleIdleLogout = async () => {
      try {
        await signOut(auth);
        onLogout?.();
        showNotif?.(
          "Sesi telah habis karena tidak ada aktivitas. Silakan login kembali.",
          "error"
        );
      } catch {
        showNotif?.("Gagal logout", "error");
      }
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleIdleLogout, IDLE_TIME_MS);
    };

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { user, userRole, authLoading, handleLogout };
}