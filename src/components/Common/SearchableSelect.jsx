import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function SearchableSelect({
  label,
  value = "",
  onChange,
  onSelect,
  placeholder = "Pilih atau ketik...",
  required = false,
  disabled = false,
  options = [],
  getOptionLabel = (opt) => (typeof opt === "string" ? opt : opt?.nama || opt?.nama_perusahaan || opt?.produk || ""),
  getOptionSubLabel = (opt) => (typeof opt === "string" ? null : opt?.kode || opt?.idOutlet || opt?.pimpinan || opt?.kota || null),
  renderOption,
  filterOption,
  emptyMessage,
  className = "",
  inputClassName = "",
  labelClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    if (filterOption) return filterOption(opt, value);
    if (!value) return true;
    const q = String(value).toLowerCase().trim();
    const lbl = String(getOptionLabel(opt)).toLowerCase();
    const sub = String(getOptionSubLabel(opt) || "").toLowerCase();
    return lbl.includes(q) || sub.includes(q);
  });

  const defaultInputCls =
    "w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/30 focus:border-[#00753A] transition-all pr-9";
  const defaultLabelCls = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={labelClassName || defaultLabelCls}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${inputClassName || defaultInputCls} pr-8`}
        />
        <button type="button" tabIndex={-1} onClick={() => setIsOpen(!isOpen)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer p-0.5">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 text-slate-100 shadow-2xl custom-scrollbar p-1 animate-in fade-in duration-100">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              if (renderOption) {
                return (
                  <div
                    key={opt.id || opt.kode || idx}
                    onClick={() => {
                      onSelect?.(opt);
                      setIsOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    {renderOption(opt)}
                  </div>
                );
              }

              const mainLbl = getOptionLabel(opt);
              const subLbl = getOptionSubLabel(opt);
              return (
                <button
                  key={opt.id || opt.kode || idx}
                  type="button"
                  onClick={() => {
                    onSelect?.(opt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-300">{mainLbl}</span>
                  {subLbl && <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-mono ml-2 shrink-0">{subLbl}</span>}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-slate-400 italic">{emptyMessage || `Gunakan nilai custom: "${value}"`}</div>
          )}
        </div>
      )}
    </div>
  );
}
