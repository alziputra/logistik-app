import Papa from "papaparse";

/**
 * Universal Excel / CSV Exporter
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired file name without extension
 * @param {Object} [headersMap] - Key to Label mapping (e.g. { kode: "Kode Barang", nama: "Nama Barang" })
 */
export const exportToExcel = (data = [], fileName = "Export_Data", headersMap = null) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  // Format data keys if headersMap is provided
  const formattedData = data.map((item) => {
    if (!headersMap) return item;
    const mapped = {};
    Object.keys(headersMap).forEach((key) => {
      const label = headersMap[key];
      mapped[label] = item[key] !== undefined && item[key] !== null ? item[key] : "";
    });
    return mapped;
  });

  // Convert to CSV with UTF-8 BOM for Excel compatibility
  const csv = Papa.unparse(formattedData);
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download Sample Template Excel / CSV for Import
 */
export const downloadTemplate = (fileName = "Template_Import", headersMap = null, sampleRow = null) => {
  let templateData = [];
  
  if (headersMap) {
    const row = {};
    Object.keys(headersMap).forEach((key) => {
      const label = headersMap[key];
      row[label] = sampleRow && sampleRow[key] !== undefined ? sampleRow[key] : `[Contoh ${label}]`;
    });
    templateData = [row];
  } else if (sampleRow) {
    templateData = [sampleRow];
  } else {
    templateData = [{ "Nama": "Contoh Data 1", "Keterangan": "Contoh Keterangan" }];
  }

  exportToExcel(templateData, `${fileName}_Template`, null);
};

/**
 * Universal Excel / CSV Importer
 * @param {File} file - File uploaded by user (.csv, .xlsx, .xls)
 * @param {Object} [labelToKeyMap] - Header label to object key mapping
 * @returns {Promise<Array>} - Resolves array of object items
 */
export const importFromExcel = (file, labelToKeyMap = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File tidak ditemukan"));
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
          reject(new Error(results.errors[0].message || "Gagal membaca file Excel/CSV"));
          return;
        }

        let parsedData = results.data;

        // Map header labels back to object keys if map is provided
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
      },
      error: (err) => {
        reject(err);
      },
    });
  });
};
