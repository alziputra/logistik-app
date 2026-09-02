import React from "react";
import { X, Printer, FileText } from "lucide-react";
import { angkaTerbilang } from "../../utils/terbilang";

function formatTanggalIndo(dateStr) {
  if (!dateStr) {
    const today = new Date();
    return today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getTerbilangBulan(num) {
  const words = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas", "dua belas"];
  if (num <= 12) return words[num] || String(num);
  if (num === 24) return "dua puluh empat";
  if (num === 36) return "tiga puluh enam";
  if (num === 48) return "empat puluh delapan";
  return angkaTerbilang(num).toLowerCase().replace(/\s*rupiah\s*$/i, "").trim();
}

export default function SpkPksPreviewModal({ isOpen, item, onClose }) {
  if (!isOpen || !item) return null;

  const jumlah = Number(item.jumlah || item.kuantitas || 1);
  const hargaSatuan = Number(item.harga_satuan || 0);
  const sewaPerbulan = item.sewa_perbulan ? Number(item.sewa_perbulan) : jumlah * hargaSatuan;
  const masaSewa = Number(item.masa_sewa_bulan !== undefined ? item.masa_sewa_bulan : 24);
  const totalSewa = item.total_sewa ? Number(item.total_sewa) : sewaPerbulan * (masaSewa || 1);
  const terbilangText = item.terbilang || (totalSewa > 0 ? angkaTerbilang(totalSewa) : "");
  const terbilangMasaSewa = getTerbilangBulan(masaSewa);
  const tanggalDokumen = formatTanggalIndo(item.tanggal_mulai || item.created_at);

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>SPK - ${item.no_spk || "Pegadaian"}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 15mm 10mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000000;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.35;
              padding: 0;
              margin: 0;
            }
            .document-container {
              width: 100%;
              max-width: 100%;
              min-height: 265mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header-logo {
              height: 42px;
              width: auto;
              object-contain: contain;
              margin-bottom: 12px;
            }
            .title-block {
              text-align: center;
              margin-bottom: 14px;
            }
            .title-block h1 {
              font-size: 13.5px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .title-block p {
              font-size: 11px;
              font-weight: 600;
            }
            .recipient-wrapper {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 14px;
            }
            .recipient-block {
              width: 280px;
              font-size: 11px;
              line-height: 1.35;
            }
            .recipient-block .date {
              margin-bottom: 8px;
            }
            .recipient-block .vendor-name {
              font-weight: bold;
              text-transform: uppercase;
            }
            .recipient-block .city {
              text-decoration: underline;
              font-weight: 500;
            }
            .narrative {
              font-size: 11px;
              line-height: 1.4;
              text-align: justify;
              margin-bottom: 12px;
            }
            table.spk-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 10.5px;
            }
            table.spk-table th,
            table.spk-table td {
              border: 1px solid #000000;
              padding: 5px 6px;
            }
            table.spk-table th {
              background-color: #d9e2ec !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-weight: bold;
              text-align: center;
            }
            table.spk-table td.align-top {
              vertical-align: top;
            }
            table.spk-table td.spec-cell {
              font-style: italic;
              font-size: 10px;
              line-height: 1.35;
              white-space: pre-line;
            }
            table.spk-table tr.bg-light td {
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-weight: bold;
            }
            table.spk-table tr.bg-total td {
              background-color: #e2e8f0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-weight: bold;
            }
            table.spk-table tr.bg-terbilang td {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-style: italic;
              text-align: center;
              font-size: 10.5px;
            }
            .terms-block {
              font-size: 10.5px;
              line-height: 1.35;
              text-align: justify;
              margin-bottom: 12px;
            }
            .terms-block .terms-title {
              font-weight: bold;
              margin-bottom: 4px;
            }
            .terms-list {
              padding-left: 0;
            }
            .terms-item {
              display: flex;
              gap: 6px;
              margin-bottom: 4px;
              align-items: flex-start;
            }
            .terms-item .num {
              font-weight: bold;
              width: 14px;
              flex-shrink: 0;
            }
            .footer-line {
              border-top: 2px solid #00753A;
              padding-top: 6px;
              margin-top: auto;
              font-size: 9.5px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .footer-line .title {
              font-weight: bold;
              color: #00753A;
              font-size: 10px;
            }
            .footer-line .url {
              font-weight: bold;
              color: #00753A;
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div>
              <!-- 1. Header Logo -->
              <div>
                <img src="/logo-pegadaian.png" alt="Logo Pegadaian" class="header-logo" />
              </div>

              <!-- 2. Judul SPK -->
              <div class="title-block">
                <h1>SURAT PERINTAH KERJA (SPK)</h1>
                <p>Nomor : ${item.no_spk || "1025/00108.04/2024"}</p>
              </div>

              <!-- 3. Tanggal & Kepada Yth -->
              <div class="recipient-wrapper">
                <div class="recipient-block">
                  <p class="date">Jakarta, ${tanggalDokumen}</p>
                  <p>Kepada Yth,</p>
                  <p>Direktur</p>
                  <p class="vendor-name">${item.vendor_nama || "PT PESONNA OPTIMA JASA"}</p>
                  <p>${item.vendor_alamat || "Jl. Laksamana Malahayati No.6Jl. Cipinang Muara, Jatinegara Pusat"}</p>
                  <p>Di</p>
                  <p class="city">${item.vendor_kota || "Jakarta Timur"}</p>
                </div>
              </div>

              <!-- 4. Narasi Pembuka -->
              <p class="narrative">
                Dengan ini PT. Pegadaian Kanwil VIII Jakarta 1 sepakat menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagaimana terlampir:
              </p>

              <!-- 5. Tabel SPK Resmi -->
              <table class="spk-table">
                <thead>
                  <tr>
                    <th style="width: 28px;">No</th>
                    <th style="width: 140px;">Nama Barang</th>
                    <th>Spesifikasi/Uraian Barang</th>
                    <th style="width: 55px;">Jumlah</th>
                    <th style="width: 95px;">Harga (Rp.)/Unit</th>
                    <th style="width: 110px;">Jumlah Harga (Rp.)/Bulan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="align-top">
                    <td style="text-align: center; font-weight: bold;">1.</td>
                    <td style="font-weight: bold;">${item.nama_barang || item.nama || "-"}</td>
                    <td class="spec-cell">${(item.spesifikasi || "-").replace(/\n/g, "<br />")}</td>
                    <td style="text-align: center; font-weight: bold;">${jumlah} ${item.satuan || "unit"}</td>
                    <td style="text-align: right; font-family: monospace;">${hargaSatuan.toLocaleString("id-ID")},-</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">${sewaPerbulan.toLocaleString("id-ID")},-</td>
                  </tr>
                  <tr class="bg-light">
                    <td colspan="5" style="text-align: right; font-weight: bold;">Sewa Perbulan</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">${sewaPerbulan.toLocaleString("id-ID")},-</td>
                  </tr>
                  <tr class="bg-total">
                    <td colspan="5" style="text-align: right; font-weight: bold;">Sewa Dalam ${masaSewa} bulan)</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">${totalSewa.toLocaleString("id-ID")},-</td>
                  </tr>
                  ${
                    terbilangText
                      ? `<tr class="bg-terbilang"><td colspan="6">(${terbilangText})</td></tr>`
                      : ""
                  }
                </tbody>
              </table>

              <!-- 6. Syarat-syarat Resmi SPK Pegadaian -->
              <div class="terms-block">
                <p class="terms-title">Syarat-syarat:</p>
                <div class="terms-list">
                  <div class="terms-item">
                    <span class="num">1.</span>
                    <div>
                      <p>a. Harga sudah termasuk pajak-pajak.</p>
                      <p>b. Jangka waktu penyerahan Pekerjaan Barang/Jasa 30 (tiga puluh) hari kalender sejak SPK ini diterima langsung melalui kurir, Email atau facsimile.</p>
                      <p>c. Jangka waktu berlakunya Surat Perintah Kerja (SPK) adalah selama ${masaSewa} (${terbilangMasaSewa}) bulan, terhitung sejak Serah Terima atau penyerahan Barang.</p>
                    </div>
                  </div>
                  <div class="terms-item">
                    <span class="num">2.</span>
                    <p>Denda, Apabila jangka waktu Penyerahan Barang/Jasa terlambat akibat kesalahan Perusahaan Saudara, maka kami akan mengenakan denda sebesar 1‰ (satu permil) setinggi tingginya 5‰ (lima permil) setiap hari kalender dari total harga sebelum pajak sebagaimana tercantum dalam Surat Perintah Kerja (SPK).</p>
                  </div>
                  <div class="terms-item">
                    <span class="num">3.</span>
                    <p>Barang yang diserahkan adalah 100% baru sesuai dengan spesifikasi dan jumlah yang disepakati, tidak mempunyai cacat material/bahan atau cacat teknis dan siap digunakan/pakai.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 7. Footer Resmi PT Pegadaian Kanwil VIII Jakarta -->
            <div class="footer-line">
              <div>
                <p class="title">PT PEGADAIAN – Kantor Wilayah VIII Jakarta</p>
                <p style="color: #475569;">Jl Senen Raya No. 36</p>
                <p style="color: #475569;">Jakarta Pusat</p>
              </div>
              <div style="text-align: right; color: #475569;">
                <p>Telepon : 021-3840229</p>
                <p>Fax : 021-3454116 <span class="url">www.pegadaian.co.id</span></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printContent);
    frameDoc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // ignore
        }
      }, 2000);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Modal Header Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Preview Surat Perintah Kerja (SPK)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No. SPK: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{item.no_spk || "-"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00753A] text-white text-xs font-semibold rounded-xl hover:bg-[#005c2e] transition-all cursor-pointer shadow-sm shadow-[#00753A]/20"
            >
              <Printer className="w-4 h-4" /> Cetak / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Authentic Sheet Paper for Screen Preview */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-200/70 dark:bg-slate-950 flex justify-center items-start">
          {/* Official A4 Sheet */}
          <div className="bg-white text-black w-full max-w-[760px] p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-300 font-sans flex flex-col justify-between min-h-[950px]">
            <div>
              {/* 1. Header Logo (Top Left) */}
              <div className="mb-3">
                <img
                  src="/logo-pegadaian.png"
                  alt="Logo Pegadaian"
                  className="h-9 sm:h-11 w-auto object-contain"
                  onError={(e) => {
                    e.target.src = "/logo-pegadaian.svg";
                  }}
                />
              </div>

              {/* 2. Judul Dokumen (Center) */}
              <div className="text-center mb-4">
                <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                  SURAT PERINTAH KERJA (SPK)
                </h1>
                <p className="text-xs font-semibold text-black mt-0.5">
                  Nomor : {item.no_spk || "1025/00108.04/2024"}
                </p>
              </div>

              {/* 3. Tanggal & Kepada Yth Block (Right Aligned) */}
              <div className="flex justify-end mb-4 text-xs text-black leading-relaxed">
                <div className="w-64 sm:w-72">
                  <p className="mb-2">Jakarta, {tanggalDokumen}</p>
                  <p>Kepada Yth,</p>
                  <p>Direktur</p>
                  <p className="font-bold uppercase tracking-tight">
                    {item.vendor_nama || "PT PESONNA OPTIMA JASA"}
                  </p>
                  <p className="text-[11px] leading-tight text-slate-800">
                    {item.vendor_alamat || "Jl. Laksamana Malahayati No.6Jl. Cipinang Muara, Jatinegara Pusat"}
                  </p>
                  <p className="mt-1">Di</p>
                  <p className="underline font-medium">
                    {item.vendor_kota || "Jakarta Timur"}
                  </p>
                </div>
              </div>

              {/* 4. Narasi Pembuka */}
              <p className="text-xs text-black leading-relaxed mb-3 text-justify">
                Dengan ini PT. Pegadaian Kanwil VIII Jakarta 1 sepakat menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagaimana terlampir:
              </p>

              {/* 5. Tabel SPK Resmi */}
              <div className="w-full border border-black mb-3">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#d9e2ec] text-black font-bold text-center border-b border-black">
                      <th className="border-r border-black p-1.5 w-8">No</th>
                      <th className="border-r border-black p-1.5 w-32">Nama Barang</th>
                      <th className="border-r border-black p-1.5">Spesifikasi/Uraian Barang</th>
                      <th className="border-r border-black p-1.5 w-14">Jumlah</th>
                      <th className="border-r border-black p-1.5 w-24">Harga (Rp.)/Unit</th>
                      <th className="p-1.5 w-28">Jumlah Harga (Rp.)/Bulan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black align-top">
                      <td className="border-r border-black p-2 text-center font-bold">1.</td>
                      <td className="border-r border-black p-2 font-bold text-black">
                        {item.nama_barang || item.nama}
                      </td>
                      <td className="border-r border-black p-2 text-[10.5px] leading-snug italic text-black whitespace-pre-line font-serif">
                        {item.spesifikasi || "-"}
                      </td>
                      <td className="border-r border-black p-2 text-center font-bold">
                        {jumlah} {item.satuan || "unit"}
                      </td>
                      <td className="border-r border-black p-2 text-right font-mono">
                        {hargaSatuan.toLocaleString("id-ID")},-
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-black">
                        {sewaPerbulan.toLocaleString("id-ID")},-
                      </td>
                    </tr>

                    {/* Summary 1: Sewa Perbulan */}
                    <tr className="border-b border-black bg-[#f1f5f9] font-bold text-[11px]">
                      <td colSpan={5} className="border-r border-black p-1.5 text-right">
                        Sewa Perbulan
                      </td>
                      <td className="p-1.5 text-right font-mono font-extrabold text-black">
                        {sewaPerbulan.toLocaleString("id-ID")},-
                      </td>
                    </tr>

                    {/* Summary 2: Sewa Total Bulan */}
                    <tr className="border-b border-black bg-[#e2e8f0] font-bold text-[11px]">
                      <td colSpan={5} className="border-r border-black p-1.5 text-right">
                        Sewa Dalam {masaSewa} bulan)
                      </td>
                      <td className="p-1.5 text-right font-mono font-black text-black">
                        {totalSewa.toLocaleString("id-ID")},-
                      </td>
                    </tr>

                    {/* Summary 3: Terbilang */}
                    {terbilangText && (
                      <tr className="bg-[#f8fafc]">
                        <td colSpan={6} className="p-1.5 text-center text-[11px] italic font-medium text-black">
                          ({terbilangText})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 6. Syarat-syarat Resmi SPK Pegadaian */}
              <div className="text-[10.5px] text-black space-y-1.5 leading-tight text-justify mb-4">
                <p className="font-bold">Syarat-syarat:</p>
                <div className="pl-1 space-y-1">
                  <div className="flex gap-2 items-start">
                    <span className="font-bold w-3.5 shrink-0">1.</span>
                    <div className="space-y-0.5">
                      <p>a. Harga sudah termasuk pajak-pajak.</p>
                      <p>
                        b. Jangka waktu penyerahan Pekerjaan Barang/Jasa 30 (tiga puluh) hari kalender sejak SPK ini diterima langsung melalui kurir, Email atau facsimile.
                      </p>
                      <p>
                        c. Jangka waktu berlakunya Surat Perintah Kerja (SPK) adalah selama {masaSewa} ({terbilangMasaSewa}) bulan, terhitung sejak Serah Terima atau penyerahan Barang.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="font-bold w-3.5 shrink-0">2.</span>
                    <p>
                      Denda, Apabila jangka waktu Penyerahan Barang/Jasa terlambat akibat kesalahan Perusahaan Saudara, maka kami akan mengenakan denda sebesar 1‰ (satu permil) setinggi tingginya 5‰ (lima permil) setiap hari kalender dari total harga sebelum pajak sebagaimana tercantum dalam Surat Perintah Kerja (SPK).
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <span className="font-bold w-3.5 shrink-0">3.</span>
                    <p>
                      Barang yang diserahkan adalah 100% baru sesuai dengan spesifikasi dan jumlah yang disepakati, tidak mempunyai cacat material/bahan atau cacat teknis dan siap digunakan/pakai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Footer Resmi PT Pegadaian Kanwil VIII Jakarta (Bottom of Page) */}
            <div className="pt-2.5 border-t-2 border-[#00753A] mt-2 text-[9.5px] text-black">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-black text-[#00753A] text-[10.5px]">
                    PT PEGADAIAN – Kantor Wilayah VIII Jakarta
                  </p>
                  <p className="text-slate-700">Jl Senen Raya No. 36</p>
                  <p className="text-slate-700">Jakarta Pusat</p>
                </div>
                <div className="text-right text-slate-700">
                  <p>Telepon : 021-3840229</p>
                  <p>
                    Fax : 021-3454116{" "}
                    <span className="font-bold text-[#00753A]">www.pegadaian.co.id</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


