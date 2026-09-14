import * as XLSX from "xlsx";

/**
 * Universal Excel Exporter (.xlsx)
 * @param {Array}  data       - Array of objects to export
 * @param {String} fileName   - File name without extension
 * @param {Object} headersMap - { key: "Label Kolom" }  (optional)
 */
export const exportToExcel = (data = [], fileName = "Export_Data", headersMap = null) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  // Map data keys → friendly labels
  const formattedData = data.map((item) => {
    if (!headersMap) return item;
    const row = {};
    Object.keys(headersMap).forEach((key) => {
      row[headersMap[key]] = item[key] !== undefined && item[key] !== null ? item[key] : "";
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Auto column width (measure headers + data)
  const headers = headersMap ? Object.values(headersMap) : Object.keys(formattedData[0] || {});
  const colWidths = headers.map((h) => String(h).length + 4);
  formattedData.forEach((row) => {
    Object.values(row).forEach((val, i) => {
      const len = String(val ?? "").length;
      colWidths[i] = Math.max(colWidths[i] || 10, len + 2);
    });
  });
  ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w, 60) }));

  // Freeze top header row sehingga tetap tampak saat scroll
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activeCell: "A2", sqref: "A2" };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName}_${dateStr}.xlsx`);
};


/**
 * Download Template Excel (.xlsx) untuk Import
 * @param {String} fileName   - File name without extension
 * @param {Object} headersMap - { key: "Label Kolom" }
 * @param {Object} sampleRow  - { key: "contoh nilai" }  (optional)
 */
export const downloadTemplate = (
  fileName = "Template_Import",
  headersMap = null,
  sampleRow = null
) => {
  let templateData = [];

  if (headersMap) {
    const row = {};
    Object.keys(headersMap).forEach((key) => {
      const label = headersMap[key];
      row[label] =
        sampleRow && sampleRow[key] !== undefined ? sampleRow[key] : `[Contoh ${label}]`;
    });
    templateData = [row];
  } else if (sampleRow) {
    templateData = [sampleRow];
  } else {
    templateData = [{ Nama: "Contoh Data 1", Keterangan: "Contoh Keterangan" }];
  }

  const ws = XLSX.utils.json_to_sheet(templateData);

  // Style header row & auto width
  const headers = Object.keys(templateData[0]);
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(String(h).length + 4, 18) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `${fileName}_Template.xlsx`);
};

/**
 * Universal Excel / CSV Importer
 * Mendukung .xlsx, .xls, dan .csv
 * @param {File}   file          - File yang diupload user
 * @param {Object} labelToKeyMap - { key: "Label Kolom" }  (optional)
 * @returns {Promise<Array>}
 */
export const importFromExcel = (file, labelToKeyMap = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File tidak ditemukan"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          reject(new Error("File Excel tidak memiliki sheet"));
          return;
        }

        const ws = workbook.Sheets[firstSheet];
        let parsedData = XLSX.utils.sheet_to_json(ws, {
          defval: "",
          raw: false, // Convert dates & numbers to string
        });

        if (!parsedData || parsedData.length === 0) {
          reject(new Error("File Excel kosong atau tidak ada data"));
          return;
        }

        // Map header labels → object keys
        if (labelToKeyMap) {
          const reverseMap = {};
          Object.keys(labelToKeyMap).forEach((key) => {
            reverseMap[labelToKeyMap[key].toLowerCase().trim()] = key;
          });

          parsedData = parsedData.map((row) => {
            const mappedRow = { ...row };
            Object.keys(row).forEach((colHeader) => {
              const cleanedHeader = colHeader.toLowerCase().trim();
              const targetKey = reverseMap[cleanedHeader];
              if (targetKey) {
                mappedRow[targetKey] = row[colHeader];
              }
            });
            return mappedRow;
          });
        }

        resolve(parsedData);
      } catch (err) {
        reject(new Error(`Gagal membaca file Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsArrayBuffer(file);
  });
};
