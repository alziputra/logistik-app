import React, { useState } from "react";
import { FileCheck, Search, Minus, Plus } from "lucide-react";

export default function BangunanSPK({ type = "renovasi", setView = () => {} }) {
  const [activeFormTab, setActiveFormTab] = useState("kop");
  const [zoom, setZoom] = useState(85);

  // Form State
  const [noUrut, setNoUrut] = useState("");
  const [tempatSurat, setTempatSurat] = useState("Jakarta");
  const [tanggalSurat, setTanggalSurat] = useState("2026-08-26");
  const [namaPenerima, setNamaPenerima] = useState("");
  const [alamatTertuju, setAlamatTertuju] = useState("");
  const [provinsiKota, setProvinsiKota] = useState("");

  const getSubTitle = () => {
    switch (type) {
      case "elektronik": return "Editor Surat SPK Elektronik";
      case "kendaraan": return "Editor Surat SPK Kendaraan";
      default: return "Editor Surat SPK Bangunan";
    }
  };

  const formattedNumber = noUrut ? `${noUrut}/00108.08/2026` : ".../00108.08/2026";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM EDITOR CARD */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          {/* Header Editor */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#00753A] p-2.5 rounded-xl text-white">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">Surat Perintah Kerja</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getSubTitle()}</p>
            </div>
          </div>

          {/* Form Section Tabs */}
          <div className="grid grid-cols-4 bg-[#00753A] text-white rounded-xl p-1 mb-6 text-center text-xs font-bold shadow-xs">
            <button
              onClick={() => setActiveFormTab("kop")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                activeFormTab === "kop" ? "bg-white text-[#00753A] shadow-sm" : "hover:bg-[#005c2e] text-emerald-100"
              }`}
            >
              Kop & Pihak
            </button>
            <button
              onClick={() => setActiveFormTab("menunjuk")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                activeFormTab === "menunjuk" ? "bg-white text-[#00753A] shadow-sm" : "hover:bg-[#005c2e] text-emerald-100"
              }`}
            >
              Menunjuk
            </button>
            <button
              onClick={() => setActiveFormTab("uraian")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                activeFormTab === "uraian" ? "bg-white text-[#00753A] shadow-sm" : "hover:bg-[#005c2e] text-emerald-100"
              }`}
            >
              Uraian Kerja
            </button>
            <button
              onClick={() => setActiveFormTab("syarat")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                activeFormTab === "syarat" ? "bg-white text-[#00753A] shadow-sm" : "hover:bg-[#005c2e] text-emerald-100"
              }`}
            >
              Syarat & TTD
            </button>
          </div>

          {/* Form Content */}
          {activeFormTab === "kop" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* KOP & TANGGAL SURAT */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                  KOP & TANGGAL SURAT
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Urut SPK (Running Number) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: 1506"
                      value={noUrut}
                      onChange={(e) => setNoUrut(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      /00108.08/2026
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ketik nomor urut surat, bulan berjalan dan tahun akan otomatis terbuat di preview.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tempat Surat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta"
                      value={tempatSurat}
                      onChange={(e) => setTempatSurat(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Surat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tanggalSurat}
                      onChange={(e) => setTanggalSurat(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                  </div>
                </div>
              </div>

              {/* INFORMASI PENERIMA */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                  INFORMASI PENERIMA
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kepada Yth. (Nama Penerima/Perusahaan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Penerima/Perusahaan"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alamat Tertuju <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Alamat lengkap..."
                    value={alamatTertuju}
                    onChange={(e) => setAlamatTertuju(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Provinsi / Kota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Provinsi/Kota"
                    value={provinsiKota}
                    onChange={(e) => setProvinsiKota(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeFormTab !== "kop" && (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
              Form tab {activeFormTab.toUpperCase()} siap dikonfigurasi. Lengkapi data di tab Kop & Pihak.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE A4 DOCUMENT PREVIEW CARD */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Top Info Banner & Zoom Controls */}
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-200">
              <span>💡</span>
              <span>Anda dapat mengedit langsung pada pratinjau A4.</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-xl border border-amber-200 dark:border-amber-800/40">
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 text-slate-500 hover:text-slate-800 rounded">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 rounded">
                {zoom}%
              </span>
              <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 text-slate-500 hover:text-slate-800 rounded">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* A4 Paper Document Preview Container */}
          <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl rounded-xl p-8 sm:p-12 overflow-x-auto min-h-[750px] font-sans text-xs" style={{ zoom: `${zoom}%` }}>
            
            {/* Pegadaian Logo Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-[#82C341]"></div>
                <div className="w-5 h-5 rounded-full bg-[#00A859]"></div>
                <div className="w-5 h-5 rounded-full bg-[#00753A] flex items-center justify-center text-white text-[9px] font-bold">
                  ⚖
                </div>
              </div>
              <span className="font-extrabold text-lg text-[#00753A] tracking-tight">Pegadaian</span>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h1 className="font-extrabold text-sm uppercase tracking-wide underline text-slate-900">
                SURAT PERINTAH KERJA (SPK)
              </h1>
              <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                Nomor : {formattedNumber}
              </p>
            </div>

            {/* Letter Header Metadata */}
            <div className="flex justify-end mb-4 text-xs font-semibold text-slate-800">
              <p>26 Agustus 2026</p>
            </div>

            <div className="mb-6 space-y-1 text-xs text-slate-800 leading-relaxed">
              <p>Kepada Yth.</p>
              <p className="font-bold text-slate-900">{namaPenerima || "Nama Penerima/Perusahaan..."}</p>
              <p>{alamatTertuju || "Alamat Tertuju..."}</p>
              <p className="uppercase font-semibold">{provinsiKota || "PROVINSI/KOTA"}</p>
            </div>

            <div className="mb-6 space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <p className="font-semibold">Menunjuk :</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Surat Penawaran Harga dari Perusahaan Saudara Nomor : ... tanggal ...</li>
                <li>
                  {type === "kendaraan"
                    ? "Berita Acara Klarifikasi dan Negosiasi Nomor : ... tanggal ..."
                    : "Berita Acara Negosiasi Harga Nomor : ... tanggal ..."}
                </li>
                <li>Surat Penunjukan Pelaksanaan Pekerjaan : ... tanggal ...</li>
              </ol>
            </div>

            <p className="mb-4 text-xs text-slate-800 leading-relaxed">
              Dengan ini PT PEGADAIAN {type === "kendaraan" || type === "elektronik" ? "Kanwil VIII Jakarta 1" : ""} sepakat Menunjuk Perusahaan Saudara sebagai pelaksana pekerjaan untuk pengadaan tersebut dibawah ini sesuai dengan jumlah, uraian pekerjaan, harga serta syarat-syarat yang tercantum dalam Surat Perintah Kerja (SPK) sebagai berikut:
            </p>

            {/* Table Depending on SPK Type */}
            {type === "renovasi" && (
              <div className="border border-slate-900 mb-6 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                      <th className="p-2 border-r border-slate-900 w-10">No</th>
                      <th className="p-2 border-r border-slate-900">Uraian</th>
                      <th className="p-2 border-r border-slate-900 w-16">Jumlah</th>
                      <th className="p-2 border-r border-slate-900 w-28">Harga Satuan</th>
                      <th className="p-2 w-28">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-medium">
                    <tr>
                      <td className="p-2 border-r border-slate-900 text-center">1.</td>
                      <td className="p-2 border-r border-slate-900">Pekerjaan Renovasi Interior Gedung</td>
                      <td className="p-2 border-r border-slate-900 text-center">1</td>
                      <td className="p-2 border-r border-slate-900 text-right">Rp. ,-</td>
                      <td className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Jumlah</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Jasa Kontraktor 10%</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Sub Total</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">PPN 11%</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Total</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                    <tr className="font-extrabold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Dibulatkan</td>
                      <td colSpan={2} className="p-2 text-right">Rp. ,-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {type === "elektronik" && (
              <div className="border border-slate-900 mb-6 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                      <th className="p-2 border-r border-slate-900 w-10">No</th>
                      <th className="p-2 border-r border-slate-900">Uraian Pekerjaan</th>
                      <th className="p-2 border-r border-slate-900 w-16">QTY.</th>
                      <th className="p-2 border-r border-slate-900 w-32">Harga Sewa per Unit</th>
                      <th className="p-2 w-36">Jumlah Harga Sewa Perbulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-medium">
                    <tr>
                      <td className="p-2 border-r border-slate-900 text-center">1.</td>
                      <td className="p-2 border-r border-slate-900">Pengadaan Sewa Laptop Workstation i7</td>
                      <td className="p-2 border-r border-slate-900 text-center"></td>
                      <td className="p-2 border-r border-slate-900 text-right">Rp. ...,-</td>
                      <td className="p-2 text-right">Rp. ...,-</td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Total Harga Sewa Per Bulan</td>
                      <td colSpan={2} className="p-2 text-right">Rp -</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Total Harga Sewa</td>
                      <td colSpan={2} className="p-2 text-right">Rp -</td>
                    </tr>
                  </tbody>
                </table>
                <div className="p-2 bg-slate-50 italic text-center font-semibold text-slate-700 border-t border-slate-900">
                  "Nol rupiah"
                </div>
              </div>
            )}

            {type === "kendaraan" && (
              <div className="border border-slate-900 mb-6 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                      <th className="p-2 border-r border-slate-900 w-10">No</th>
                      <th className="p-2 border-r border-slate-900">Uraian Pekerjaan</th>
                      <th className="p-2 border-r border-slate-900 w-16">QTY.</th>
                      <th className="p-2 border-r border-slate-900 w-32">Harga Sewa per Unit/Bln</th>
                      <th className="p-2 w-28">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-medium">
                    <tr>
                      <td className="p-2 border-r border-slate-900 text-center">1.</td>
                      <td className="p-2 border-r border-slate-900">Sewa Kendaraan Operasional MPV</td>
                      <td className="p-2 border-r border-slate-900 text-center"></td>
                      <td className="p-2 border-r border-slate-900 text-right">Rp. ...,-</td>
                      <td className="p-2 text-right">Rp. ...,-</td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Jumlah Harga Sewa per Bulan</td>
                      <td colSpan={2} className="p-2 text-right">Rp. -</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={3} className="p-2 border-r border-slate-900 text-right">Total Harga Sewa (Sudah Termasuk Pajak)</td>
                      <td colSpan={2} className="p-2 text-right">Rp -</td>
                    </tr>
                  </tbody>
                </table>
                <div className="p-2 bg-slate-50 italic text-center font-semibold text-slate-700 border-t border-slate-900">
                  "Nol rupiah"
                </div>
              </div>
            )}

            {/* Syarat-syarat Section */}
            <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
              <p className="font-semibold">Syarat-syarat:</p>
              <ol className="list-alpha pl-5 space-y-1 text-[11px] text-slate-700">
                <li>Jangka Waktu Penyelesaian Pekerjaan adalah ... hari kalender terhitung sejak SPK diterima.</li>
                <li>Jangka waktu penyerahan Pekerjaan Barang/Jasa adalah [Tuliskan jangka waktu penyerahan, contoh: 30 hari kerja sejak SPK diterima]</li>
                <li>Jangka waktu sewa adalah [Tuliskan jangka waktu sewa, contoh: 36 Bulan sejak serah terima barang]</li>
                <li>Jangka waktu berlakunya Surat Perintah Kerja (SPK) adalah [Tuliskan jangka waktu berlakunya SPK, contoh: selama 36 Bulan terhitung sejak Serah Terima]</li>
              </ol>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
