import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ToastNotif({ notif, onClose }) {
  if (!notif?.show) return null;

  const isSuccess = notif.type !== "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${
          isSuccess
            ? "bg-slate-900 border-emerald-500/40 text-emerald-300"
            : "bg-slate-900 border-rose-500/40 text-rose-300"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        )}
        <p className="text-sm font-medium">{notif.message}</p>
      </div>
    </div>
  );
}
