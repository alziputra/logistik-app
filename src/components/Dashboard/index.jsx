"use client";

import { User } from "lucide-react";
import NotificationAlerts from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats from "./ComputerStats";
import PrinterStats from "./PrinterStats";
import InventoryChart from "./InventoryChart";

const DashboardView = ({ transactions = [], setView, user, inventory = [], notifSewa = [], notifSewaKomputer = [], printers = [], computers = [] }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Dashboard Logistik</h2>
        {user && (
          <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
            <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm pr-1">
              <p className="text-gray-500 text-[10px] font-medium leading-tight uppercase tracking-wide">Admin Aktif</p>
              <p className="font-bold text-gray-800 text-xs leading-tight">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* BLOK 1: NOTIFIKASI */}
      <NotificationAlerts notifSewa={notifSewa} notifSewaKomputer={notifSewaKomputer} setView={setView} />

      {/* BLOK 2: TRANSAKSI */}
      <TransactionActivity transactions={transactions} setView={setView} />

      {/* BLOK 3: KOMPUTER */}
      <ComputerStats computers={computers} setView={setView} />

      {/* BLOK 4: PRINTER */}
      <PrinterStats printers={printers} setView={setView} />

      {/* BLOK 5: GRAFIK */}
      <InventoryChart inventory={inventory} />
        
    </div>
  );
};

export default DashboardView;