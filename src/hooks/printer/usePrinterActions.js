// src/hooks/printer/usePrinterActions.js
import { useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { importPrinterCSV, downloadTemplate } from "../../services/printerService";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

// Mapping header CSV / Excel ke key JS internal
const HEADER_MAPPING = {
  "ID Outlet": "idOutlet",
  "Outlet Id": "idOutlet",
  "OUTLET ID": "idOutlet",
  "Id Outlet": "idOutlet",
  "Outlet": "outlet",
  "NAMA OUTLET": "outlet",
  "Nama Outlet": "outlet",
  "Produk / Model": "produk",
  "Product Hardware": "produk",
  "PRODUK": "produk",
  "Model": "produk",
  "Serial Number": "sn",
  "SERIAL NUMBER": "sn",
  "SN": "sn",
  "S/N": "sn",
  "Kondisi": "kondisi",
  "KONDISI": "kondisi",
  "Vendor": "penyedia",
  "PENYEDIA": "penyedia",
  "Penyedia": "penyedia",
  "Tgl Mulai Sewa": "tanggalMulai",
  "Tanggal Mulai": "tanggalMulai",
  "Tgl Selesai Sewa": "tanggalSelesai",
  "Tanggal Selesai": "tanggalSelesai",
  "MASA SEWA": "masaSewa",
  "Masa Sewa": "masaSewa",
  "Status": "status",
  "STATUS": "status",
  "Catatan": "deskripsi",
  "DESKRIPSI": "deskripsi",
  "Deskripsi": "deskripsi",
  "TGL CEK": "tglCek",
  "Tgl Cek": "tglCek",
};

export function usePrinterActions({ filteredData, setIsSaving, showNotif }) {
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
    showNotif("Sedang memproses dan mengunggah data...");

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });
          const normalizedData = normalizeDataKeys(rawData);
          const total = await importPrinterCSV(APP_ID, normalizedData);
          showNotif(`Sukses! ${total} data printer berhasil di-import. Memuat ulang...`);
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          console.error(err);
          showNotif("Gagal import file Excel! Periksa format file.", "error");
        } finally {
          setIsSaving(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        showNotif("Gagal membaca file Excel.", "error");
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async ({ data }) => {
          try {
            const normalizedData = normalizeDataKeys(data);
            const total = await importPrinterCSV(APP_ID, normalizedData);
            showNotif(`Sukses! ${total} data printer berhasil di-import. Memuat ulang...`);
            setTimeout(() => window.location.reload(), 1500);
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
    }
  };

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      showNotif("Tidak ada data untuk di-export.", "error");
      return;
    }

    const rows = filteredData.map((item) => ({
      "ID Outlet":        item.idOutlet       || "",
      "Outlet":           item.outlet         || "",
      "Produk / Model":   item.produk         || "",
      "Serial Number":    item.sn             || "",
      "Kondisi":          item.kondisi        || "",
      "Vendor":           item.penyedia       || "",
      "Tgl Mulai Sewa":   item.tanggalMulai   || "",
      "Tgl Selesai Sewa": item.tanggalSelesai || "",
      "Status":           item.status         || "",
      "Catatan":          item.deskripsi      || "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Printer");
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key]).length)) + 3,
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Data_Printer_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return {
    fileInputRef,
    handleFileUpload,
    exportToExcel,
    downloadTemplate,
  };
}

