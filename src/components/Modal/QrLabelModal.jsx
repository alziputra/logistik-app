import React, { useRef } from "react";
import { X, Printer, QrCode as QrIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrLabelModal({ data, onClose }) {
  const printRef = useRef(null);

  if (!data) return null;

  const isLaptop = data.kategori === "LAPTOP" || Boolean(data.hostname) || Boolean(data.nik);
  const isPrinter = data.kategori === "PRINTER" || data.isPrinter || (!isLaptop && !data.cpu && !data.processor && !data.ipAddress);

  const serialNum = data.sn || data.serialNumber || data.serial_number || data.id || (isPrinter ? "SN-PR-99812" : isLaptop ? "5CG4222JJW" : "PGD-93YMS44");
  const produkNama = data.produk || data.namaUnit || data.nama || data.produkNama || (isPrinter ? "Printer Laserjet Multi-Function" : isLaptop ? "Laptop HP ProBook" : "OptiPlex SFF 7010");
  const outletNama = data.outlet || data.nama_outlet || data.lokasi || data.departemen || "Kantor Cabang Pegadaian";
  const idOutlet = data.idOutlet || data.kode || "12676";
  const vendorNama = data.penyedia || data.vendor || data.vendor_nama || data.vendorNama || (isPrinter ? "PT PrintSolusi Prima" : isLaptop ? "PT GLOBAL SOLUSINDO KOMPUDATA" : "PT Pesonna Optima Jasa");
  
  const spkNo = data.spkNo || data.no_spk || data.spk || data.noSpk || data.spk_no || (isPrinter ? "SPK/PRNT/2024/001" : isLaptop ? "SPK/LTP/2024/001" : "SPK/COMP/2024/001");
  const pksNo = data.pksNo || data.no_pks || data.pks || data.noPks || data.pks_no || "2503/00108.04/2024";
  
  const tglMulai = data.tanggalMulai || data.tanggal_mulai || data.tglMulai || data.tgl_mulai || data.tglMulaiSewa || data.start_date || (isPrinter ? "2024-01-10" : "2024-01-01");
  const tglSelesai = data.tanggalSelesai || data.tanggal_selesai || data.tglSelesai || data.tgl_selesai || data.tglAkhir || data.tglSelesaiSewa || data.end_date || (isPrinter ? "2026-01-10" : "2026-01-01");
  const statusStr = data.status || "Sewa Berjalan";
  const kondisiStr = data.kondisi || data.kondisiHardware || "BAIK";

  let fullScanPayload = "";

  if (isLaptop) {
    // Payload khusus Laptop (dengan NIK, Pengguna, Jabatan, Departemen, Hostname)
    const nik = data.nik || "-";
    const namaPengguna = data.nama || data.namaPengguna || "Pengguna Pegadaian";
    const jabatan = data.jabatan || data.namaJabatan || "-";
    const departemen = data.departemen || "Departemen Logistik & Umum";
    const hostname = data.hostname || data.deviceName || "-";
    const os = data.os || "Windows";

    fullScanPayload = `[ASET PEGADAIAN LOGISTIK - LAPTOP]
SN: ${serialNum}
Pengguna: ${namaPengguna} (NIK: ${nik})
Jabatan: ${jabatan}
Departemen: ${departemen}
Hostname: ${hostname}
OS: ${os}
Vendor: ${vendorNama}
Tgl Mulai Sewa: ${tglMulai}
Tgl Selesai Sewa: ${tglSelesai}
Status: ${statusStr}
No. SPK: ${spkNo}
No. PKS: ${pksNo}
Kondisi: ${kondisiStr}`;
  } else if (isPrinter) {
    // Payload khusus Printer (tanpa spek PC)
    const deskripsiStr = data.deskripsi || data.keterangan || "-";
    fullScanPayload = `[ASET PEGADAIAN LOGISTIK - PRINTER]
SN: ${serialNum}
Perangkat: ${produkNama}
Outlet: ${outletNama} (ID: ${idOutlet})
Vendor: ${vendorNama}
Tgl Mulai Sewa: ${tglMulai}
Tgl Selesai Sewa: ${tglSelesai}
Status: ${statusStr}
No. SPK: ${spkNo}
No. PKS: ${pksNo}
Kondisi: ${kondisiStr}${deskripsiStr !== "-" ? `\nKeterangan: ${deskripsiStr}` : ""}`;
  } else {
    // Payload khusus Komputer / PC (dengan spek hardware & jaringan lengkap)
    const ipAddress = data.ipAddress || data.ip_address || data.ip || "10.86.19.72";
    const macAddress = data.macAddress || data.mac_address || data.mac || "4c:d7:17:9e:1a:a9";
    const cpuStr = data.cpu || data.processor || "13th Gen Intel(R) Core(TM) i5-13600";
    const ramStr = data.ram || "7 GB";
    const storageStr = data.storage || data.harddisk || "503GB";
    const osStr = data.os || "Ubuntu Pegadaian V.22 Build 2025.05.14";

    fullScanPayload = `[ASET PEGADAIAN LOGISTIK - KOMPUTER]
SN: ${serialNum}
Perangkat: ${produkNama}
Outlet: ${outletNama} (ID: ${idOutlet})
Vendor: ${vendorNama}
Tgl Mulai Sewa: ${tglMulai}
Tgl Selesai Sewa: ${tglSelesai}
Status: ${statusStr}
No. SPK: ${spkNo}
No. PKS: ${pksNo}
IP Address: ${ipAddress}
MAC Address: ${macAddress}
Kondisi: ${kondisiStr}
Processor: ${cpuStr}
RAM: ${ramStr}
Storage: ${storageStr}
OS: ${osStr}`;
  }

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Label Stiker QR Code Pegadaian - ${serialNum}</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body { font-family: sans-serif; padding: 10px; display: flex; justify-content: center; align-items: center; background: #fff; }
            .label-card { border: 2px solid #000000; padding: 20px; border-radius: 8px; width: 360px; text-align: center; background: #ffffff; }
            .header-logo { color: #00753A; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .sn-text { font-family: monospace; font-size: 12px; font-weight: bold; margin-top: 4px; color: #000; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 print:p-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950 p-1.5 rounded-lg text-[#00753A] dark:text-emerald-400">
              <QrIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Label QR Code {isLaptop ? "Laptop" : isPrinter ? "Printer" : "Komputer"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Sticker Card Display Area */}
        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <div ref={printRef} className="label-card bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-md w-full text-center text-slate-900 space-y-4">
            
            {/* Header Brand Logo */}
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#82C341]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A859]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00753A]" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-[#00753A] uppercase">
                PEGADAIAN LOGISTIK
              </span>
            </div>

            {/* OFFICIAL QR CODE USING qrcode.react (ISO/IEC 18004 Compliant) */}
            <div className="py-2 flex items-center justify-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner inline-block">
                <QRCodeSVG
                  value={fullScanPayload}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                  marginSize={4}
                />
              </div>
            </div>

            {/* Serial Number Text */}
            <div className="pt-2 border-t border-slate-200">
              <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
                SN: {serialNum}
              </div>
            </div>

          </div>
        </div>

        {/* Clean Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" /> Cetak Label Stiker
          </button>
        </div>

      </div>
    </div>
  );
}
