import React, { useState } from "react";
import NotificationAlerts from "./NotificationAlerts";
import TransactionActivity from "./TransactionActivity";
import ComputerStats from "./ComputerStats";
import PrinterStats from "./PrinterStats";
import InventoryChart from "./InventoryChart";
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
    <div className="max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      
      {/* Sub Tabs matching view.jpeg theme */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex gap-6 -mb-px overflow-x-auto">
          <button 
            onClick={() => setActiveSubTab("inventaris")} 
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "inventaris"
                ? "border-[#00753A] text-[#00753A] dark:text-[#22C55E] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Dashboard Inventaris
          </button>
          <button 
            onClick={() => setActiveSubTab("bangunan")} 
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "bangunan"
                ? "border-[#00753A] text-[#00753A] dark:text-[#22C55E] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Dashboard Bangunan
          </button>
          <button 
            onClick={() => setActiveSubTab("pengamanan")} 
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === "pengamanan"
                ? "border-[#00753A] text-[#00753A] dark:text-[#22C55E] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
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
