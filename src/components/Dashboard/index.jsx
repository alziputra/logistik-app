import React, { useState } from "react";
import NotificationAlerts  from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats       from "./ComputerStats";
import PrinterStats        from "./PrinterStats";
import InventoryChart      from "./InventoryChart";
import BuildingDashboardView from "./BuildingDashboardView";
import SecurityDashboardView from "./SecurityDashboardView";

const DashboardView = ({
  transactions = [],
  setView,
  inventory = [],
  notifSewa = [],
  notifSewaKomputer = [],
  printers = [],
  computers = [],
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
  const [activeSubTab, setActiveSubTab] = useState("inventaris");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Dashboard Informasi</h1>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex gap-6 -mb-px">
          <button 
            onClick={() => setActiveSubTab("inventaris")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeSubTab === "inventaris" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
          >
            Dashboard Inventaris
          </button>
          <button 
            onClick={() => setActiveSubTab("bangunan")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeSubTab === "bangunan" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
          >
            Dashboard Bangunan
          </button>
          <button 
            onClick={() => setActiveSubTab("pengamanan")} 
            className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeSubTab === "pengamanan" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
          >
            Dashboard Pengamanan & Korporasi
          </button>
        </div>
      </div>

      {activeSubTab === "inventaris" ? (
        <>
          <NotificationAlerts
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            setView={setView}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
          />
          <TransactionActivity transactions={transactions} setView={setView} />
          <ComputerStats computers={computers} setView={setView} setComputerFilter={setComputerFilter} />
          <PrinterStats printers={printers} setView={setView} setPrinterFilter={setPrinterFilter} />
          <InventoryChart inventory={inventory} />
        </>
      ) : activeSubTab === "bangunan" ? (
        <BuildingDashboardView
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          buildingRenovations={buildingRenovations}
          setView={setView}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
        />
      ) : (
        <SecurityDashboardView
          securityFacilities={securityFacilities}
          setView={setView}
          setSecurityFilter={setSecurityFilter}
        />
      )}
    </div>
  );
};

export default DashboardView;
