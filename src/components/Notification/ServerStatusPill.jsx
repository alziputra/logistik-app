import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function ServerStatusPill() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sembunyikan sepenuhnya saat online agar header bersih & rapi
  if (!isOffline) return null;

  return (
    <div
      title="Perangkat Anda sedang tidak terhubung ke internet"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 shadow-sm animate-pulse shrink-0"
    >
      <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
      <span>Koneksi Terputus (Offline)</span>
    </div>
  );
}
