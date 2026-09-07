import React from "react";
import DashboardHero from "./DashboardHero";
import InventoryKpiCards from "./InventoryKpiCards";
import NotificationAlerts from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats from "./ComputerStats";
import PrinterStats from "./PrinterStats";
import InventoryChart from "./InventoryChart";
import BuildingDashboardView from "./BuildingDashboardView";
import SecurityDashboardView from "./SecurityDashboardView";

const DashboardView = ({
  activeTab = "dashboard",
  transactions = [],
  setView,
  inventory = [],
  user = {},
  userRole,
  notifSewa = [],
  notifSewaKomputer = [],
  printers = [],
  computers = [],
  laptops = [],
  outlets = [],
  startNewDocument,
  buildingLands = [],
  buildingSewas = [],
  buildingRenovations = [],
  securityFacilities = [],
  landFilter,
  setLandFilter,
  sewaFilter,
  setSewaFilter,
  securityFilter,
  setSecurityFilter,
  computerFilter,
  setComputerFilter,
  printerFilter,
  setPrinterFilter,
}) => {
  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {activeTab === "dashboard_bangunan" ? (
        <BuildingDashboardView buildingLands={buildingLands} buildingSewas={buildingSewas} buildingRenovations={buildingRenovations} setView={setView} setLandFilter={setLandFilter} setSewaFilter={setSewaFilter} />
      ) : activeTab === "dashboard_pengamanan" ? (
        <SecurityDashboardView securityFacilities={securityFacilities} setView={setView} setSecurityFilter={setSecurityFilter} />
      ) : (
        <div className="space-y-6">
          {/* 1. Hero Command Center Banner */}
          <DashboardHero user={user} setView={setView} startNewDocument={startNewDocument} />

          {/* 2. Executive KPI Metric Cards */}
          <InventoryKpiCards inventory={inventory} transactions={transactions} computers={computers} laptops={laptops} printers={printers} notifSewa={notifSewa} notifSewaKomputer={notifSewaKomputer} setView={setView} />

          {/* 3. Smart Risk Management (Masa Sewa Warning Alerts) */}
          <NotificationAlerts notifSewa={notifSewa} notifSewaKomputer={notifSewaKomputer} setView={setView} setPrinterFilter={setPrinterFilter} setComputerFilter={setComputerFilter} />

          {/* 4. Analytics & Operational Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <InventoryChart inventory={inventory} setView={setView} />
            </div>
            <div className="lg:col-span-5">
              <TransactionActivity transactions={transactions} setView={setView} startNewDocument={startNewDocument} />
            </div>
          </div>

          {/* 5. TI Hardware & Perangkat Operasional Section */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Monitoring & Status Perangkat TI Seluruh Unit
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pemantauan status sewa berjalan, inventaris gudang, dan perangkat perbaikan</p>
            </div>
            <ComputerStats computers={computers} setView={setView} setComputerFilter={setComputerFilter} />
            <PrinterStats printers={printers} setView={setView} setPrinterFilter={setPrinterFilter} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
