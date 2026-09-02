import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Monitor,
  Printer,
  Network,
  FileText,
  Scale,
  Armchair,
  Zap,
  ShieldAlert,
  Car,
  Box,
  Sparkles,
} from "lucide-react";
import { BARANG_CATEGORIES } from "../../constants/barangCategories";

const ICON_MAP = {
  Monitor,
  Printer,
  Network,
  FileText,
  Scale,
  Armchair,
  Zap,
  ShieldAlert,
  Car,
  Box,
};

export default function CategoryDropdown({
  value,
  onChange,
  name = "kategori",
  required = false,
  label = "Kategori Barang",
  showCustomOption = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useRef(null);

  // Check if initial value is in predefined categories
  useEffect(() => {
    if (value) {
      const match = BARANG_CATEGORIES.find(
        (c) => c.name.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        setIsCustomMode(false);
      } else if (value && value !== "Lainnya") {
        setIsCustomMode(true);
        setCustomValue(value);
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = BARANG_CATEGORIES.find(
    (c) => c.name.toLowerCase() === (value || "").toLowerCase()
  ) || BARANG_CATEGORIES[0];

  const SelectedIcon = ICON_MAP[selectedCategory?.icon] || Box;

  const handleSelect = (cat) => {
    if (cat.name === "Lainnya" && showCustomOption) {
      onChange(cat.name);
      setIsCustomMode(false);
      setIsOpen(false);
    } else {
      setIsCustomMode(false);
      onChange(cat.name);
      setIsOpen(false);
    }
  };

  const handleCustomSubmit = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden input to ensure FormData gets the value */}
      <input type="hidden" name={name} value={value || ""} />

      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {isCustomMode ? (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              onChange("IT Hardware & Komputer");
            }}
            className="text-[10px] text-[#00753A] dark:text-emerald-400 hover:underline font-medium cursor-pointer"
          >
            Pilih dari daftar
          </button>
        ) : (
          showCustomOption && (
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setCustomValue("");
                onChange("");
              }}
              className="text-[10px] text-slate-500 hover:text-[#00753A] dark:hover:text-emerald-400 hover:underline font-normal cursor-pointer"
            >
              + Ketik manual
            </button>
          )
        )}
      </div>

      {isCustomMode ? (
        <div className="relative">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomSubmit}
            placeholder="Ketik nama kategori baru..."
            required={required}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-medium"
          />
        </div>
      ) : (
        <div className="relative">
          {/* Custom Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3.5 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs ${
              isOpen
                ? "border-[#00753A] ring-2 ring-[#00753A]/20 shadow-md"
                : "border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div
                className={`p-1.5 rounded-lg border shrink-0 ${
                  selectedCategory.color || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <SelectedIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  {selectedCategory?.name || value || "Pilih Kategori"}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-55">
                  {selectedCategory?.description}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                isOpen ? "rotate-180 text-[#00753A]" : ""
              }`}
            />
          </button>

          {/* Styled Floating Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00753A]" /> Pilihan Kategori Logistik
              </div>
              <div className="space-y-1 pt-1">
                {BARANG_CATEGORIES.map((cat) => {
                  const IconComp = ICON_MAP[cat.icon] || Box;
                  const isSelected =
                    (value || "").toLowerCase() === cat.name.toLowerCase();

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat)}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group ${
                        isSelected
                          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${
                            cat.color
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate font-semibold group-hover:text-[#00753A] dark:group-hover:text-emerald-400">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-60">
                            {cat.description}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="p-1 bg-[#00753A] text-white rounded-full shrink-0 ml-2">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
