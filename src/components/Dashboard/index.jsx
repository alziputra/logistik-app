import React, { useState } from "react";
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
  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {activeTab === "dashboard_bangunan" ? (
        <BuildingDashboardView
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          buildingRenovations={buildingRenovations}
          setView={setView}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
        />
      ) : activeTab === "dashboard_pengamanan" ? (
        <SecurityDashboardView
          securityFacilities={securityFacilities}
          setView={setView}
          setSecurityFilter={setSecurityFilter}
        />
      ) : (
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
      )}
    </div>
  );
};

export default DashboardView;
