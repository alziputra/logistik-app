import React, { useState } from "react";
import { FileText, Plus, Trash2, Minus } from "lucide-react";

export default function SoppGenerator({ type = "pengadaan", setView = () => {} }) {
  const [zoom, setZoom] = useState(85);

  // Form States
  const [noUrut, setNoUrut] = useState("");
  const [tanggalDokumen, setTanggalDokumen] = useState("2026-08-26");
  const [unitKerja, setUnitKerja] = useState("Logistik Kanwil VIII Jakarta");
  const [cabang, setCabang] = useState("");
  const [outlet, setOutlet] = useState("");
  const [dibayarkanKepada, setDibayarkanKepada] = useState("");
  const [viaPembayaran, setViaPembayaran] = useState("Kas");

  // Rincian Perkiraan Rows State
  const [rows, setRows] = useState([
    { id: 1, kode: "171.01.01", uraian: "Biaya Pekerjaan Renovasi (Termin 1)", debet: "", kredit: "" },
    { id: 2, kode: "", uraian: "Retensi 5%", debet: "", kredit: "" },
    { id: 3, kode: "214.02.02", uraian: "Pajak PPN", debet: "", kredit: "" }
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), kode: "", uraian: "", debet: "", kredit: "" }
    ]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const getSubTitle = () => {
    switch (type) {
      case "sewa": return "Editor Surat SOPP Sewa";
      case "renovasi": return "Editor Surat SOPP Renovasi";
      default: return "Editor Surat SOPP Pengadaan";
    }
  };

  const formattedDocNo = noUrut ? `/SOPP-${noUrut}.08/2026` : "/SOPP-00108.08/2026";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM EDITOR CARD */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-5 flex flex-col">
          {/* Header Editor */}
          <div className="flex items-center gap-3">
            <div className="bg-[#00753A] p-2.5 rounded-xl text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">SOPP - Otorisasi Pembayaran</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getSubTitle()}</p>
            </div>
          </div>

          {/* INFORMASI UMUM */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
              INFORMASI UMUM
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NOMOR URUT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nomor Urut"
                  value={noUrut}
                  onChange={(e) => setNoUrut(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  TANGGAL DOKUMEN
                </label>
                <input
                  type="date"
                  value={tanggalDokumen}
                  onChange={(e) => setTanggalDokumen(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                NAMA UNIT KERJA / DIVISI
              </label>
              <input
                type="text"
                disabled
                value={unitKerja}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                CABANG
              </label>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
              >
                <option value="">Cari atau pilih cabang...</option>
                <option value="KANWIL MEDAN">KANWIL MEDAN</option>
                <option value="KANWIL JAKARTA 1">KANWIL JAKARTA 1</option>
                <option value="KANWIL JAKARTA 2">KANWIL JAKARTA 2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                NAMA OUTLET
              </label>
              <select
                value={outlet}
                onChange={(e) => setOutlet(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
              >
                <option value="">Cari atau pilih outlet...</option>
                <option value="CP Medan Utama">CP Medan Utama</option>
                <option value="CP Jakarta Central">CP Jakarta Central</option>
                <option value="UPC JATIWARINGIN RAYA">UPC JATIWARINGIN RAYA</option>
              </select>
            </div>
          </div>

          {/* PEMBAYARAN & REKENING */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
              PEMBAYARAN & REKENING
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                DIBAYARKAN KEPADA <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama Perusahaan / Penerima"
                value={dibayarkanKepada}
                onChange={(e) => setDibayarkanKepada(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                VIA PEMBAYARAN
              </label>
              <select
                value={viaPembayaran}
                onChange={(e) => setViaPembayaran(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
              >
                <option value="Kas">Kas</option>
                <option value="Cek">Cek</option>
                <option value="BG">BG</option>
              </select>
            </div>
          </div>

          {/* RINCIAN PERKIRAAN */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                RINCIAN PERKIRAAN
              </h3>
              <button
                onClick={addRow}
                className="flex items-center gap-1 text-xs font-bold text-[#00753A] hover:text-[#005c2e] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Baris {index + 1}
                    </span>
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(row.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">KODE PERKIRAAN</label>
                      <input
                        type="text"
                        value={row.kode}
                        onChange={(e) => updateRow(row.id, "kode", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">URAIAN</label>
                      <input
                        type="text"
                        value={row.uraian}
                        onChange={(e) => updateRow(row.id, "uraian", e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">DEBET (RP)</label>
                      <input
                        type="text"
                        value={row.debet}
                        onChange={(e) => updateRow(row.id, "debet", e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">KREDIT (RP)</label>
                      <input
                        type="text"
                        value={row.kredit}
                        onChange={(e) => updateRow(row.id, "kredit", e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
          <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl rounded-xl p-8 sm:p-10 overflow-x-auto min-h-[750px] font-sans text-xs" style={{ zoom: `${zoom}%` }}>
            
            {/* Header Document Title */}
            <div className="text-center mb-6">
              <h1 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-slate-900">
                SURAT OTORISASI PERMINTAAN PEMBAYARAN
              </h1>
              <p className="text-[10px] font-semibold text-slate-600">(Otorisasi Pembayaran)</p>
              <p className="text-[11px] font-bold text-slate-800 mt-1">
                Nomor : {formattedDocNo}
              </p>
            </div>

            {/* Document Attributes */}
            <div className="grid grid-cols-12 gap-y-1.5 text-xs text-slate-800 font-medium mb-6">
              <div className="col-span-4 font-semibold">Tanggal</div>
              <div className="col-span-8">: 26-Aug-26</div>

              <div className="col-span-4 font-semibold">Nama Unit Kerja/Divisi</div>
              <div className="col-span-8">: {unitKerja}</div>

              <div className="col-span-4 font-semibold">Dibayarkan kepada</div>
              <div className="col-span-8 flex items-center gap-2">
                <span className="border-b border-slate-900 flex-1 px-1 min-h-[18px]">
                  {dibayarkanKepada}
                </span>
              </div>

              <div className="col-span-4 font-semibold">Jumlah</div>
              <div className="col-span-8 flex items-center gap-4">
                <span className="border border-slate-900 px-3 py-0.5 font-bold min-w-[120px]">
                  Rp
                </span>
                <span className="text-[11px]">
                  Via: Kas [{viaPembayaran === "Kas" ? "X" : " "}] Cek [{viaPembayaran === "Cek" ? "X" : " "}] BG [{viaPembayaran === "BG" ? "X" : " "}]
                </span>
              </div>

              <div className="col-span-4 font-semibold">Kelengkapan data via BG</div>
              <div className="col-span-8 border-b border-slate-900 min-h-[18px]"></div>

              <div className="col-span-4 font-semibold">Nomor Rekening</div>
              <div className="col-span-8 border-b border-slate-900 min-h-[18px]"></div>

              <div className="col-span-4 font-semibold">Nama Bank</div>
              <div className="col-span-8 border-b border-slate-900 min-h-[18px]"></div>

              <div className="col-span-4 font-semibold">Pajak: Ada</div>
              <div className="col-span-8">
                [X] Ada &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp;] Tidak ada
              </div>
            </div>

            {/* Table Rincian Perkiraan */}
            <div className="border border-slate-900 mb-6 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-sky-200 font-bold border-b border-slate-900 text-center">
                    <th className="p-1.5 border-r border-slate-900 w-8">No.</th>
                    <th className="p-1.5 border-r border-slate-900 w-28">Kode Perkiraan</th>
                    <th className="p-1.5 border-r border-slate-900">Uraian</th>
                    <th className="p-1.5 border-r border-slate-900 w-20">Debet</th>
                    <th className="p-1.5 w-20">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {rows.map((row, i) => (
                    <tr key={row.id}>
                      <td className="p-1.5 border-r border-slate-900 text-center">{i + 1}</td>
                      <td className="p-1.5 border-r border-slate-900 font-mono text-[11px]">{row.kode || "144.01.01"}</td>
                      <td className="p-1.5 border-r border-slate-900">{row.uraian || "Uraian pekerjaan..."}</td>
                      <td className="p-1.5 border-r border-slate-900 text-right">{row.debet}</td>
                      <td className="p-1.5 text-right">{row.kredit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kelengkapan Dokumen Section */}
            <div className="space-y-2 text-xs text-slate-900">
              <p className="font-bold">Kelengkapan Dokumen</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold">X</span>
                  <span>Surat permohonan tagihan dari rekanan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold">X</span>
                  <span>Faktur Pajak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold"></span>
                  <span>Faktur surat jalan termasuk harga satuan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold"></span>
                  <span>Surat Perintah Kerja</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold">X</span>
                  <span>Kwitansi/Invoice bermeterai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold">X</span>
                  <span>Berita Acara Serah Terima Barang/pekerjaan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold">X</span>
                  <span>SOPP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold"></span>
                  <span>Berita Acara Pemeriksaan</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
