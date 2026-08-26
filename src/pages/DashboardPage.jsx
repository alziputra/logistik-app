import React, { useState, useEffect, useMemo } from "react";
import AppHeader from "../components/Layout/AppHeader";
import Navbar from "../components/Layout/Navbar";
import TabBar from "../components/Layout/TabBar";
import TabContent from "../components/Layout/TabContent";
import { useAuth } from "../context/AuthContext";
import { useTabs } from "../hooks/useTabs";
import { useNotif } from "../hooks/useNotif";
import { useTransaksi } from "../hooks/useTransaksi";
import { hitungSisaBulan } from "../utils/deviceUtils";

import { getKomputer } from "../services/komputerService";
import { getPrinter } from "../services/printerService";
import { getTransaksi } from "../services/transaksiService";
import { getInventory } from "../services/inventoryService";
import { getVendors } from "../services/vendorService";
import { getUsers } from "../services/userService";
import { getInstansi } from "../services/instansiService";
import { getAsetTanah } from "../services/asetTanahService";
import { getMenuSewa } from "../services/menuSewaService";
import { getRenovasi } from "../services/renovasiService";
import { getPengamananKorporasi } from "../services/pengamananService";
import { getSpkHistories } from "../services/spkService";
import { getSoppHistories } from "../services/soppService";
import { getActivityLogs } from "../services/activityLogService";

import ToastNotif from "../components/Modal/ToastNotif";
import { ensureFirestoreCollectionsSeeded } from "../utils/firestoreAutoSeeder";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tabs, setTabs, activeTab, setActiveTab, handleSetView } = useTabs();
  const { notif, showNotif } = useNotif();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Core Data States
  const [computers, setComputers] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Dynamically calculate notification counters for expiring rentals (sisa bulan <= 3)
  const notifSewa = useMemo(() => {
    return (printers || []).filter((p) => {
      const tgl = p.tanggalSelesai || p.tanggal_selesai;
      if (!tgl) return false;
      const sisaBulan = hitungSisaBulan(tgl);
      return sisaBulan !== null && sisaBulan <= 3;
    });
  }, [printers]);

  const notifSewaKomputer = useMemo(() => {
    return (computers || []).filter((c) => {
      const tgl = c.tanggalSelesai || c.tanggal_selesai;
      if (!tgl) return false;
      const sisaBulan = hitungSisaBulan(tgl);
      return sisaBulan !== null && sisaBulan <= 3;
    });
  }, [computers]);

  // Secondary Data States
  const [buildingLands, setBuildingLands] = useState([]);
  const [buildingSewas, setBuildingSewas] = useState([]);
  const [buildingRenovations, setBuildingRenovations] = useState([]);
  const [securityFacilities, setSecurityFacilities] = useState([]);
  const [spkHistory, setSpkHistory] = useState([]);
  const [soppHistory, setSoppHistory] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Filter States
  const [computerFilter, setComputerFilter] = useState("Semua");
  const [printerFilter, setPrinterFilter] = useState("Semua");
  const [landFilter, setLandFilter] = useState("");
  const [sewaFilter, setSewaFilter] = useState("");
  const [renovationFilter, setRenovationFilter] = useState("");
  const [securityFilter, setSecurityFilter] = useState("");

  const ensureArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [
        compRes, printRes, trxRes, invRes, venRes, userRes, instRes,
        landRes, sewaRes, renoRes, secRes, spkRes, soppRes, logRes
      ] = await Promise.allSettled([
        getKomputer(),
        getPrinter(),
        getTransaksi(),
        getInventory(),
        getVendors(),
        getUsers(),
        getInstansi(),
        getAsetTanah(),
        getMenuSewa(),
        getRenovasi(),
        getPengamananKorporasi(),
        getSpkHistories(),
        getSoppHistories(),
        getActivityLogs(),
      ]);

      if (compRes.status === "fulfilled") setComputers(ensureArray(compRes.value));
      if (printRes.status === "fulfilled") setPrinters(ensureArray(printRes.value));
      if (trxRes.status === "fulfilled") setTransactions(ensureArray(trxRes.value));
      if (invRes.status === "fulfilled") setInventory(ensureArray(invRes.value));
      if (venRes.status === "fulfilled") setVendors(ensureArray(venRes.value));
      if (userRes.status === "fulfilled") setUsersList(ensureArray(userRes.value));
      if (instRes.status === "fulfilled") setOutlets(ensureArray(instRes.value));
      if (landRes.status === "fulfilled") setBuildingLands(ensureArray(landRes.value));
      if (sewaRes.status === "fulfilled") setBuildingSewas(ensureArray(sewaRes.value));
      if (renoRes.status === "fulfilled") setBuildingRenovations(ensureArray(renoRes.value));
      if (secRes.status === "fulfilled") setSecurityFacilities(ensureArray(secRes.value));
      if (spkRes.status === "fulfilled") setSpkHistory(ensureArray(spkRes.value));
      if (soppRes.status === "fulfilled") setSoppHistory(ensureArray(soppRes.value));
      if (logRes.status === "fulfilled") setActivityLogs(ensureArray(logRes.value));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await ensureFirestoreCollectionsSeeded();
      loadAllData();
    };
    initApp();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { updateUser } = await import("../services/userService");
      await updateUser(userId, { role: newRole });
      showNotif(`Role user berhasil diubah menjadi ${newRole}`, "success");
      loadAllData();
    } catch (err) {
      console.error("Gagal mengupdate role user:", err);
      showNotif("Gagal mengupdate role user", "error");
    }
  };

  const {
    formData, setFormData,
    items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument,
    editDocument,
    viewDocument,
    addItem, removeItem,
    handleInputChange, handleItemChange,
    handleSaveTransaction,
    isSaving,
  } = useTransaksi({
    user,
    transactions,
    inventory,
    setTransactions,
    setInventory,
    setActivityLogs,
    showNotif,
    navigateTo: handleSetView,
    loadAllData,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Navbar
        view={activeTab}
        setView={handleSetView}
        startNewDocument={startNewDocument}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        printers={printers}
        computers={computers}
        buildingLands={buildingLands}
        buildingSewas={buildingSewas}
        setLandFilter={setLandFilter}
        setSewaFilter={setSewaFilter}
        setRenovationFilter={setRenovationFilter}
        setSecurityFilter={setSecurityFilter}
        setComputerFilter={setComputerFilter}
        setPrinterFilter={setPrinterFilter}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:pl-[336px]" : "md:pl-20"}`}>
        <AppHeader
          user={user}
          title={activeTab.replace("_", " ").toUpperCase()}
          printers={printers}
          computers={computers}
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          setView={handleSetView}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabs={setTabs}
        />

        <main className="flex-1 p-4 md:p-6 bg-slate-100/70 dark:bg-slate-900/60 overflow-y-auto">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-400">Sinkronisasi data dengan sistem...</p>
            </div>
          ) : (
            <TabContent
              tabs={tabs}
              activeTab={activeTab}
              userRole={user?.role || "admin"}
              transactions={transactions}
              setTransactions={setTransactions}
              inventory={inventory}
              outlets={outlets}
              printers={printers}
              computers={computers}
              notifSewa={notifSewa}
              notifSewaKomputer={notifSewaKomputer}
              usersList={usersList}
              vendors={vendors}
              loadAllData={loadAllData}
              activityLogs={activityLogs}
              buildingLands={buildingLands}
              buildingSewas={buildingSewas}
              buildingRenovations={buildingRenovations}
              securityFacilities={securityFacilities}
              spkHistory={spkHistory}
              soppHistory={soppHistory}
              formData={formData}
              setFormData={setFormData}
              items={items}
              setItems={setItems}
              activeTransaction={activeTransaction}
              setActiveTransaction={setActiveTransaction}
              handleInputChange={handleInputChange}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              handleSaveTransaction={handleSaveTransaction}
              isSaving={isSaving}
              editDocument={editDocument}
              viewDocument={viewDocument}
              setView={handleSetView}
              user={user}
              handleUpdateRole={handleUpdateRole}
              landFilter={landFilter}
              setLandFilter={setLandFilter}
              sewaFilter={sewaFilter}
              setSewaFilter={setSewaFilter}
              renovationFilter={renovationFilter}
              setRenovationFilter={setRenovationFilter}
              securityFilter={securityFilter}
              setSecurityFilter={setSecurityFilter}
              printerFilter={printerFilter}
              setPrinterFilter={setPrinterFilter}
              computerFilter={computerFilter}
              setComputerFilter={setComputerFilter}
            />
          )}
        </main>
      </div>

      <ToastNotif notif={notif} />
    </div>
  );
}
