import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "last_active_timestamp";
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 Menit
const DEFAULT_WARNING_MS = 60 * 1000; // 60 Detik Countdown

/**
 * Custom hook untuk mendeteksi inaktivitas pengguna (Session Idle Timeout).
 * Mendukung throttling event, sinkronisasi multi-tab lewat localStorage,
 * dan countdown peringatan sebelum auto-logout.
 */
export function useSessionTimeout({ timeoutMs = DEFAULT_TIMEOUT_MS, warningMs = DEFAULT_WARNING_MS, onTimeout = () => {}, enabled = true } = {}) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Math.floor(warningMs / 1000));
  const lastThrottleRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Fungsi mereset waktu aktivitas terakhir
  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastThrottleRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {
      // Abaikan jika localStorage terbatas
    }
    setIsWarningOpen(false);
    setSecondsRemaining(Math.floor(warningMs / 1000));
  }, [warningMs]);

  useEffect(() => {
    if (!enabled) return;

    // Inisialisasi timestamp jika belum ada
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    // Event listener untuk mencatat interaksi user (diberi jeda throttle 3 detik)
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottleRef.current > 3000) {
        lastThrottleRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, now.toString());
        } catch {}
      }
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Sinkronisasi antar-tab: jika tab lain ada aktivitas, reset timer di tab ini
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setIsWarningOpen(false);
        setSecondsRemaining(Math.floor(warningMs / 1000));
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Interval pemeriksaan setiap 1 detik
    const interval = setInterval(() => {
      const now = Date.now();
      const lastActive = Number(localStorage.getItem(STORAGE_KEY) || now);
      const idleTime = now - lastActive;

      if (idleTime >= timeoutMs) {
        // Waktu habis -> Trigger Logout
        setIsWarningOpen(false);
        clearInterval(interval);
        if (typeof onTimeoutRef.current === "function") {
          onTimeoutRef.current();
        }
      } else if (idleTime >= timeoutMs - warningMs) {
        // Masuk fase peringatan (Countdown)
        const remaining = Math.max(0, Math.ceil((timeoutMs - idleTime) / 1000));
        setIsWarningOpen(true);
        setSecondsRemaining(remaining);
      } else {
        // Masih dalam fase aktif
        if (isWarningOpen) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [enabled, timeoutMs, warningMs, isWarningOpen]);

  return {
    isWarningOpen,
    secondsRemaining,
    resetTimer,
  };
}
