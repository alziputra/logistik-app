"use client";
import { History, Plus, ArrowLeft } from "lucide-react";

const DashboardView = ({ transactions, setFormData, setItems, setActiveTransaction, setView }) => {
  const stats = { masuk: 0, keluar: 0, total: transactions.length };
  transactions.forEach((trx) => {
    const d = new Date(trx.tanggal);
    const today = new Date();
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      if (trx.jenisTransaksi === "Barang Masuk") stats.masuk++;
      else stats.keluar++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Logistik</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <History className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Masuk (Bulan Ini)</p>
            <p className="text-2xl font-bold">{stats.masuk}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-full">
            <ArrowLeft className="w-6 h-6 text-orange-600 transform rotate-180" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Keluar (Bulan Ini)</p>
            <p className="text-2xl font-bold">{stats.keluar}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="p-4">Tanggal</th>
                <th className="p-4">No. Surat</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Pihak Terlibat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Belum ada transaksi tersimpan.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-sm">{trx.tanggal}</td>
                    <td className="p-4 font-medium text-sm text-blue-600">{trx.nomorSurat}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trx.jenisTransaksi === "Barang Masuk" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {trx.jenisTransaksi}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {trx.pengirimNama} ➔ {trx.penerimaNama}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setFormData(trx);
                          setItems(trx.items || []);
                          setActiveTransaction(trx);
                          setView("preview");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md"
                      >
                        Lihat Dokumen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
