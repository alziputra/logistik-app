import React, { useRef, useState } from "react";
import { Download, Upload, FileText, Loader2 } from "lucide-react";
import { exportToExcel, importFromExcel, downloadTemplate } from "../../utils/excelHelper";

const ExcelActionButtons = ({
  data = [],
  fileName = "Export_Data",
  headersMap = null,
  labelToKeyMap = null,
  sampleRow = null,
  onExport = null,
  onImport = null,
  onTemplate = null,
  showExport = true,
  showImport = true,
  showTemplate = true,
  className = "",
}) => {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportClick = () => {
    if (onExport) {
      onExport();
    } else {
      exportToExcel(data, fileName, headersMap);
    }
  };

  const handleTemplateClick = () => {
    if (onTemplate) {
      onTemplate();
    } else {
      downloadTemplate(fileName, headersMap, sampleRow);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const parsedData = await importFromExcel(file, labelToKeyMap || headersMap);
      if (onImport) {
        await onImport(parsedData);
      }
    } catch (error) {
      console.error("Import Excel Error:", error);
      alert(`Gagal mengimpor file: ${error.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Hidden File Input for Import */}
      {showImport && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
      )}

      {/* Download Template Button (Icon Only) */}
      {showTemplate && (
        <button
          type="button"
          onClick={handleTemplateClick}
          className="p-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
          title="Download Template Format Excel"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}

      {/* Import Button (Icon Only) */}
      {showImport && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center shrink-0"
          title="Import Data dari Excel / CSV"
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Export Button (Icon Only) */}
      {showExport && (
        <button
          type="button"
          onClick={handleExportClick}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
          title="Export Data ke Excel / CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ExcelActionButtons;
