// src/hooks/komputer/useKomputerActions.js
import { useRef } from "react";
import Papa from "papaparse";
import { importKomputerCSV, downloadTemplate } from "../../services/komputerService";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

// Mapping header CSV ke key JS
const HEADER_MAPPING = {
  "Outlet": "outlet",
  "ID Outlet": "idOutlet",
  "Produk / Model": "produk",
  "Serial Number": "sn",
  "Kondisi": "kondisi",
  "IP Address": "ipAddress",
  "MAC Address": "macAddress",
  "CPU": "cpu",
  "RAM": "ram",
  "Storage": "storage",
  "OS": "os",
  "Vendor": "penyedia",
  "Tgl Mulai Sewa": "tanggalMulai",
  "Tgl Selesai Sewa": "tanggalSelesai",
  "Status": "status",
  "Catatan": "deskripsi",
};

export function useKomputerActions({ filteredData, setIsSaving, showNotif }) {
  const fileInputRef = useRef(null);

  const normalizeDataKeys = (dataArray) => {
    return dataArray.map((row) => {
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim();
        const mappedKey = HEADER_MAPPING[cleanKey] || cleanKey;
        normalizedRow[mappedKey] = row[key];
      });
      return normalizedRow;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSaving(true);
    showNotif("Sedang memproses dan mengunggah CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          const normalizedData = normalizeDataKeys(data);
          const total = await importKomputerCSV(APP_ID, normalizedData);
          showNotif(`Sukses! ${total} data komputer berhasil di-import. Memuat ulang...`);
          setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
          console.error(err);
          showNotif("Gagal import! Pastikan kolom header persis seperti template.", "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        showNotif("Gagal membaca file CSV.", "error");
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      showNotif("Tidak ada data untuk di-export.", "error");
      return;
    }

    const rows = filteredData.map((item) => ({
      "Outlet":           item.outlet          || "",
      "ID Outlet":        item.idOutlet        || "",
      "Produk / Model":   item.produk          || "",
      "Serial Number":    item.sn              || "",
      "Kondisi":          item.kondisi         || "",
      "IP Address":       item.ipAddress       || "",
      "MAC Address":      item.macAddress      || "",
      "CPU":              item.cpu             || "",
      "RAM":              item.ram             || "",
      "Storage":          item.storage         || "",
      "OS":               item.os              || "",
      "Vendor":           item.penyedia        || "",
      "Tgl Mulai Sewa":   item.tanggalMulai    || "",
      "Tgl Selesai Sewa": item.tanggalSelesai  || "",
      "Status":           item.status          || "",
      "Catatan":          item.deskripsi       || "",
    }));

    const csvContent = Papa.unparse(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Komputer_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    fileInputRef,
    handleFileUpload,
    exportToExcel: exportToCSV, // Alias agar kompatibel jika komponen UI memanggil nama exportToExcel
    downloadTemplate,
  };
}