import React from "react";
import { X, QrCode } from "lucide-react";

export default function QrLabelModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-100">Label QR Code Perangkat</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl inline-block my-2">
          <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
          <p className="text-xs font-mono font-bold text-slate-900 mt-2">{data.sn || "SN-000000"}</p>
        </div>

        <p className="text-xs text-slate-300 font-semibold">{data.produk}</p>
        <p className="text-[11px] text-slate-400">{data.outlet}</p>
      </div>
    </div>
  );
}
