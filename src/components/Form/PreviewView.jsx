import React from "react";
import { Printer, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";

const formatIndonesianDate = (dateStr) => {
  if (!dateStr) return "4 Agustus 2026";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const checkNomorValid = (nomor, jenis = "Barang Keluar") => {
  if (!nomor || typeof nomor !== "string") return false;
  const trimmed = nomor.trim();
  const parts = trimmed.split("/");
  if (jenis === "Barang Masuk") {
    if (parts.length !== 3) return false;
    const [num, kode, year] = parts;
    if (!num || ["0", "00", "000"].includes(num) || num.trim() === "") return false;
    if (!kode || kode === "....." || kode.trim() === "") return false;
    if (!year || !/^\d{4}$/.test(year)) return false;
    return true;
  }
  if (parts.length < 4) return false;
  const num = parts[0];
  if (!num || ["0", "00", "000"].includes(num) || num.trim() === "") return false;
  const lastPart = parts[parts.length - 1];
  if (!lastPart || !/^\d{4}$/.test(lastPart)) return false;
  return true;
};

const PreviewView = ({ formData = {}, items = [], activeTransaction = null, setView = () => {}, handleSaveTransaction = () => {}, isSaving = false, isViewOnly = false }) => {
  const isMasuk = formData.jenisTransaksi === "Barang Masuk";
  const nomorIsValid = checkNomorValid(formData.nomorSurat, formData.jenisTransaksi);

  const handlePrint = () => {
    if (!nomorIsValid) {
      alert("⚠️ Harap masukkan nomor surat terlebih dahulu sebelum mencetak dokumen!");
      return;
    }
    window.print();
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!nomorIsValid) {
      alert("⚠️ Harap masukkan nomor surat terlebih dahulu sebelum menyimpan transaksi!");
      return;
    }
    if (handleSaveTransaction) {
      await handleSaveTransaction();
    }
  };

  // Kalo data tujuan kosong (surat baru), tampilkan titik-titik (bukan hardcoded CPS METRO)
  const tujuanStr = isMasuk ? formData.tujuan || formData.penerimaInstansi || "LOGISTIK KANWIL VIII" : formData.tujuan || formData.outletTujuan || formData.pihak2Instansi || formData.penerimaInstansi || "........................";

  const renderDocumentContent = () => (
    <div className="p-5 sm:p-8 bg-white text-black flex flex-col justify-between min-h-[900px] sm:min-h-[950px] print:min-h-[270mm] print:max-h-[270mm] w-full min-w-[600px] sm:min-w-0" id="printable-area">
      <div>
        {/* Kop Surat Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5">
          {/* Pegadaian Official Logo */}
          <div className="flex items-center">
            <img
              src="/logo-pegadaian.png"
              alt="Logo Pegadaian"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.src = "/logo-pegadaian.svg";
              }}
            />
          </div>

          {/* Department Title */}
          <div className="text-right">
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-black leading-tight font-sans">DEPARTEMEN LOGISTIK</h1>
            <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Sistem Informasi Manajemen Barang</p>
          </div>
        </div>

        <div className="border-b-[3px] border-black mb-6 sm:mb-8"></div>

        {/* Document Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xs sm:text-sm font-extrabold underline uppercase text-black leading-tight tracking-wide">BERITA ACARA SERAH TERIMA {formData.jenisTransaksi ? formData.jenisTransaksi.toUpperCase() : "BARANG KELUAR"}</h2>
          <p className="text-[11px] sm:text-xs text-black mt-1 font-medium">Nomor: {formData.nomorSurat || (isMasuk ? `...../...../${new Date().getFullYear()}` : `...../00108.00/04/${new Date().getFullYear()}`)}</p>
        </div>

        {/* Yellow Banner 1: Penerima Barang */}
        <div className="bg-[#FFE600] px-3 py-1.5 mb-3.5 text-[11px] sm:text-xs font-bold text-black border border-black flex items-center gap-2">
          <span>Penerima Barang:</span>
          <span className="font-extrabold uppercase">{tujuanStr}</span>
        </div>

        {/* Opening Paragraph */}
        <p className="text-[11px] sm:text-xs text-black leading-relaxed mb-3.5">
          Pada hari ini, tanggal <strong className="font-bold">{formatIndonesianDate(formData.tanggal)}</strong> bertempat di <strong className="font-bold">{formData.lokasi || "Jakarta"}</strong>, telah dilakukan serah terima barang dengan
          rincian sebagai berikut:
        </p>

        {/* Items Table */}
        <table className="w-full border-collapse mb-3.5 text-[11px] sm:text-xs border border-black">
          <thead>
            <tr className="bg-gray-100 font-bold text-black border-b border-black">
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-center w-[6%] font-bold">No</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-left w-[25%] font-bold">Nama Barang</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-left w-[15%] font-bold">S/N</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-center w-[8%] font-bold">Qty</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-center w-[10%] font-bold">Satuan</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-left w-[18%] font-bold">{isMasuk ? "Outlet / Asal" : "Outlet Tujuan"}</th>
              <th className="border border-black py-1.5 px-1.5 sm:px-2 text-left w-[18%] font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="text-black">
                <td className="border border-black py-1.5 px-1.5 sm:px-2 text-center">{index + 1}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2 font-medium">{item.namaBarang || item.nama}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2 font-mono text-[10px] sm:text-[11px]">{item.sn || "-"}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2 text-center font-bold">{item.jumlah || item.kuantitas}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2 text-center">{item.satuan || "Unit"}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2 uppercase">{item.outlet || (isMasuk ? formData.asalOutlet || "LOGISTIK KANWIL VIII" : tujuanStr !== "........................" ? tujuanStr : "-")}</td>
                <td className="border border-black py-1.5 px-1.5 sm:px-2">{item.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Closing Paragraph */}
        <p className="text-[11px] sm:text-xs text-black leading-relaxed mb-3.5">
          Demikian Berita Acara Serah Terima Barang ini dibuat dengan sebenarnya dalam keadaan sadar dan tanpa paksaan dari pihak manapun, untuk dapat dipergunakan sebagaimana mestinya.
        </p>

        {/* Yellow Banner 2: NOTE */}
        <div className="bg-[#FFE600] px-3 py-1.5 mb-4 sm:mb-6 text-[11px] sm:text-xs font-bold text-black border border-black">NOTE : MOHON UNTUK DISIMPAN SEBAGAI BUKTI SAH SERAH TERIMA BARANG</div>

        {/* Signature Section */}
        {isMasuk ? (
          /* Signature Khusus Barang Masuk: 2 Kolom (Yang Menyerahkan | Yang Menerima) */
          <div className="grid grid-cols-2 gap-8 text-[10px] sm:text-xs text-black mb-4 sm:mb-6 print:flex print:justify-between print:gap-8">
            <div className="print:w-1/2">
              <p className="font-semibold mb-12 sm:mb-16">Yang Menyerahkan,</p>
              <p className="font-bold underline uppercase text-black break-words">{formData.pihak1Nama || formData.pengirimNama || "........................"}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-700 leading-tight">{formData.pihak1Jabatan || formData.pengirimJabatan || ""}</p>
            </div>

            <div className="print:w-1/2 text-right sm:text-left print:text-left">
              <p className="font-semibold mb-12 sm:mb-16">Yang Menerima,</p>
              <p className="font-bold underline uppercase text-black break-words">{formData.pihak2Nama || formData.penerimaNama || "........................"}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-700 leading-tight">{formData.pihak2Jabatan || formData.penerimaJabatan || ""}</p>
            </div>
          </div>
        ) : (
          /* Signature Standard Barang Keluar: 3 Kolom (Yang Menerima | Yang Menyerahkan | Mengetahui) */
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs text-black mb-4 sm:mb-6 print:flex print:justify-between print:gap-4">
            <div className="print:w-1/3">
              <p className="font-semibold mb-12 sm:mb-16">Yang Menerima,</p>
              <p className="font-bold underline uppercase text-black break-words">{formData.pihak2Nama || formData.penerimaNama || "........................"}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-700 leading-tight">{formData.pihak2Jabatan || formData.penerimaJabatan || ""}</p>
            </div>

            <div className="print:w-1/3">
              <p className="font-semibold mb-12 sm:mb-16">Yang Menyerahkan,</p>
              <p className="font-bold underline uppercase text-black break-words">{formData.pihak1Nama || formData.pengirimNama || "AHMAD DENDY SYAPUTRA"}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-700 leading-tight">{formData.pihak1Jabatan || formData.pengirimJabatan || "Staff Pengadaan dan Logistik"}</p>
            </div>

            <div className="print:w-1/3">
              <p className="font-semibold mb-12 sm:mb-16">Mengetahui,</p>
              <p className="font-bold underline uppercase text-black break-words">{formData.pihakMengetahuiNama || formData.mengetahuiNama || "ZONI RAHMAWAN PUTRA"}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-600 leading-tight">{formData.pihakMengetahuiJabatan || formData.mengetahuiJabatan || "Kabag Pengadaan dan Logistik"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Official Footer PT PEGADAIAN - Pinned to bottom of A4 paper */}
      <div className="official-footer pt-1.5 border-t-2 border-black text-black mt-auto pb-0.5">
        <p className="font-bold text-xs uppercase mb-0.5">PT. PEGADAIAN</p>
        <p className="text-[10px] sm:text-[11px] text-gray-700 leading-tight">Kantor Wilayah VIII Jakarta 1</p>
        <p className="text-[10px] sm:text-[11px] text-gray-700 leading-tight">Jl. Senen Raya No. 36 Jakarta Pusat 10410</p>
        <p className="text-[10px] sm:text-[11px] text-gray-700 leading-tight">Telp : (021) 3840229 &nbsp;&nbsp;&nbsp;&nbsp; Fax : (021) 3454116</p>
      </div>
    </div>
  );

  return (
    <div className="w-full pt-5 sm:pt-2 pb-6 print:p-0">
      {/* Strict A4 Single-Page Print Specific CSS Overrides */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm 8mm 8mm;
          }
          html, body, #root, main, section, article {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-area, #printable-area * {
            visibility: visible !important;
          }
          #printable-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 15px 25px 12px 25px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .bg-\\[\\#FFE600\\] {
            background-color: #FFE600 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-100 {
            background-color: #F3F4F6 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
          }
          .official-footer {
            margin-top: auto !important;
            padding-top: 4px !important;
            padding-bottom: 0px !important;
            border-top: 2px solid #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Warning Banner if Nomor Surat is missing or invalid */}
      {!nomorIsValid && !isViewOnly && (
        <div className="print:hidden mb-2.5 px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs font-semibold shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
          <span>Nomor surat belum diisi! Harap masukkan nomor surat terlebih dahulu untuk mencetak atau menyimpan transaksi.</span>
        </div>
      )}

      {/* Top Action Bar (Dedicated Toolbar Card - Clean Light & Dark Mode Styling) */}
      <div className="print:hidden mb-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md flex flex-wrap items-center justify-between gap-2.5 transition-colors">
        <div className="flex items-center gap-2">
          {/* Tombol Kembali ke Riwayat (jika Mode Lihat Surat) atau Edit Kembali (jika di Mobile) */}
          {isViewOnly ? (
            <button
              type="button"
              onClick={() => setView("riwayat")}
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kembali ke Riwayat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView("form")}
              className="lg:hidden flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Edit Kembali</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Cetak Surat */}
          <button
            type="button"
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
              nomorIsValid
                ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-blue-600/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-75"
            }`}
            title="Cetak Surat (A4)"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>

          {!isViewOnly && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-70 active:scale-95 shrink-0 ${
                nomorIsValid
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-75"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Transaksi"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Area Container Card */}
      <div className="print-wrapper w-full bg-white shadow-xl print:shadow-none relative text-slate-900 rounded-2xl print:rounded-none overflow-hidden print:overflow-visible border border-slate-200 print:border-none">
        <div className="overflow-x-auto bg-white">{renderDocumentContent()}</div>
      </div>
    </div>
  );
};

export default PreviewView;
