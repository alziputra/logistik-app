"use client";
import { ArrowLeft, Save, Printer } from "lucide-react";

const PreviewView = ({ formData, items, activeTransaction, setView, handleSaveTransaction }) => (
  <div className="w-full max-w-4xl mx-auto bg-white mt-6 shadow-xl relative print:shadow-none print:m-0 print:p-0 print:max-w-none print:bg-transparent">
    
    {/* NAVBAR PREVIEW (Disembunyikan saat print) */}
    <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center sticky top-0 z-10 border-b">
      <button
        onClick={() => setView(activeTransaction ? "dashboard" : "form")}
        className="flex items-center gap-2 text-gray-700 bg-white px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {activeTransaction ? "Ke Riwayat" : "Edit Kembali"}
      </button>
      <div className="flex gap-3">
        {!activeTransaction && (
          <button
            onClick={handleSaveTransaction}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Simpan Transaksi
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Cetak Dokumen
        </button>
      </div>
    </div>

    {/* AREA CETAK (Hanya menggunakan relative biasa) */}
    <div className="p-8 sm:p-12 bg-white print:p-0 text-sm print:text-[11px] relative" id="printable-area">
      
      {/* BUNGKUSAN KONTEN UTAMA
        Diberi padding bawah (print:pb-[80px]) agar kalau isi tabel penuh, 
        teksnya tidak tertutup oleh footer alamat yang melayang di bawah kertas.
      */}
      <div className="print:pb-[80px]">
        
        {/* Header Surat */}
        <div className="flex items-center justify-between mb-8 print:mb-4 border-b-[3px] border-black pb-5 print:pb-2">
          <img
            src="/logo-pegadaian.png"
            alt="Logo Pegadaian"
            className="h-16 print:h-12 object-contain"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'></path><polyline points='3.27 6.96 12 12.01 20.73 6.96'></polyline><line x1='12' y1='22.08' x2='12' y2='12'></line></svg>";
            }}
          />
          <div className="text-right">
            <h1 className="text-2xl print:text-[16px] font-bold uppercase tracking-wider text-gray-900 leading-tight">Departemen Logistik</h1>
            <p className="text-gray-600 print:text-[10px]">Sistem Informasi Manajemen Barang</p>
          </div>
        </div>

        {/* Judul Surat */}
        <div className="text-center mb-6 print:mb-4">
          <h2 className="text-xl print:text-[13px] font-bold underline uppercase text-gray-900 leading-tight">
            Berita Acara Serah Terima {formData.jenisTransaksi}
          </h2>
          <p className="text-gray-700 mt-1 print:mt-0 print:text-[10px]">Nomor: {formData.nomorSurat}</p>
        </div>

        {/* Teks Pengantar */}
        <div className="mb-6 print:mb-3 text-gray-800 text-justify">
          <div className="mb-4 print:mb-2">
            <h1 className="font-semibold">Penerima Barang:</h1>
            {formData.penerimaInstansi && <strong>{formData.penerimaInstansi}</strong>}
          </div>
          <p className="leading-relaxed print:leading-normal">
            Pada hari ini, tanggal <strong>
              {new Date(formData.tanggal).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </strong> bertempat di <strong>{formData.lokasi}</strong>, telah dilakukan serah
            terima barang dengan rincian sebagai berikut:
          </p>
        </div>

        {/* Tabel Barang */}
        <table className="w-full border-collapse border border-black text-gray-900 text-sm print:text-[10px] mb-6 print:mb-3">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-black p-2 print:p-1 w-10 text-center">No</th>
              <th className="border border-black p-2 print:p-1 text-left">Nama Barang</th>
              <th className="border border-black p-2 print:p-1 text-left w-32">S/N</th>
              <th className="border border-black p-2 print:p-1 text-center w-10">Qty</th>
              <th className="border border-black p-2 print:p-1 text-center w-14">Satuan</th>
              <th className="border border-black p-2 print:p-1 text-left w-48">Outlet Tujuan</th>
              <th className="border border-black p-2 print:p-1 text-left w-24">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="break-inside-avoid">
                <td className="border border-black p-2 print:p-1 text-center">{index + 1}</td>
                <td className="border border-black p-2 print:p-1">{item.nama}</td>
                <td className="border border-black p-2 print:p-1 break-all">{item.sn}</td>
                <td className="border border-black p-2 print:p-1 text-center">{item.kuantitas}</td>
                <td className="border border-black p-2 print:p-1 text-center">{item.satuan}</td>
                <td className="border border-black p-2 print:p-1">{item.outlet}</td>
                <td className="border border-black p-2 print:p-1">{item.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Teks Penutup */}
        <div className="text-gray-800 mb-6 print:mb-2 text-justify">
          <p className="leading-relaxed print:leading-normal">
            Demikian Berita Acara Serah Terima Barang ini dibuat dengan sebenarnya
            dalam keadaan sadar dan tanpa paksaan dari pihak manapun, untuk dapat
            dipergunakan sebagaimana mestinya.
          </p>
        </div>
        <div className="mb-8 print:mb-4">
          <p className="inline bg-yellow-300/60 px-2 py-0.5 font-medium rounded-sm border border-yellow-400 print:bg-transparent print:border-none print:font-bold print:underline print:p-0">
            NOTE : MOHON UNTUK DISIMPAN SEBAGAI BUKTI SAH SERAH TERIMA BARANG
          </p>
        </div>

        {/* Tanda Tangan (break-inside-avoid agar tidak terpotong ke halaman 2) */}
        <div className="grid grid-cols-3 mt-8 print:mt-4 text-center text-gray-900 w-full break-inside-avoid">
          <div className="flex flex-col items-start">
            <p className="mb-20 print:mb-14">Yang Menerima,</p>
            <div className="h-10 flex flex-col items-start justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.penerimaNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[10px] mt-1 text-left">{formData.penerimaJabatan}</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="mb-20 print:mb-14">Yang Menyerahkan,</p>
            <div className="h-10 flex flex-col items-center justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.pengirimNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[10px] mt-1">{formData.pengirimJabatan}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="mb-20 print:mb-14">Mengetahui,</p>
            <div className="h-10 flex flex-col items-end justify-end w-full">
              <p className="font-bold underline uppercase">
                {formData.mengetahuiNama || "( ........................ )"}
              </p>
              <p className="text-sm print:text-[10px] mt-1 text-right">{formData.mengetahuiJabatan}</p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER ALAMAT (CARA MUTLAK)
        print:fixed print:bottom-0 akan memaku elemen ini persis di batas bawah margin kertas
      */}
      <div className="mt-8 print:mt-0 print:fixed print:bottom-0 print:left-0 print:w-full print:bg-white text-left text-[11px] text-gray-800 border-t-[2px] border-black w-full pt-4 print:pt-2 print:text-[9px]">
        <p className="font-bold text-[12px] print:text-[10px] text-gray-900 leading-tight">PT. PEGADAIAN</p>
        <p className="leading-tight">Kantor Wilayah VIII Jakarta 1</p>
        <p className="leading-tight">Jl. Senen Raya No. 36 Jakarta Pusat 10410</p>
        <p className="leading-tight">Telp : (021) 3840229 &nbsp;&nbsp;&nbsp; Fax : (021) 3454116</p>
      </div>

    </div>
  </div>
);

export default PreviewView;