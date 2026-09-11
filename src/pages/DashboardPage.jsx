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
import { getLaptop } from "../services/laptopService";
import { getPrinter } from "../services/printerService";
import { getTransaksi } from "../services/transaksiService";
import { getInventory } from "../services/inventoryService";
import { getVendors } from "../services/vendorService";
import { getUsers, updateUser } from "../services/userService";
import { getInstansi } from "../services/instansiService";
import { getAsetTanah } from "../services/asetTanahService";
import { getMenuSewa } from "../services/menuSewaService";
import { getRenovasi } from "../services/renovasiService";
import { getPengamananKorporasi } from "../services/pengamananService";
import { getSpkPksList } from "../services/spkPksService";
import { getSoppHistories } from "../services/soppService";
import { getActivityLogs } from "../services/activityLogService";

import ToastNotif from "../components/Modal/ToastNotif";
import ForceChangePasswordModal from "../components/Modal/ForceChangePasswordModal";


export default function DashboardPage() {
  const { user } = useAuth();
  const { tabs, setTabs, activeTab, setActiveTab, handleSetView, closeTab } = useTabs();
  const { notif, showNotif } = useNotif();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Core Data States
  const [computers, setComputers] = useState([]);
  const [laptops, setLaptops] = useState([]);
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

  // Filter & Search States
  const [computerFilter, setComputerFilter] = useState("Semua");
  const [printerFilter, setPrinterFilter] = useState("Semua");
  const [landFilter, setLandFilter] = useState("");
  const [sewaFilter, setSewaFilter] = useState("");
  const [renovationFilter, setRenovationFilter] = useState("");
  const [securityFilter, setSecurityFilter] = useState("");

  // Direct Search States for Notifications
  const [printerSearch, setPrinterSearch] = useState("");
  const [computerSearch, setComputerSearch] = useState("");
  const [landSearch, setLandSearch] = useState("");
  const [sewaSearch, setSewaSearch] = useState("");

  const ensureArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const loadAllData = async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const [compRes, laptopRes, printRes, trxRes, invRes, venRes, userRes, instRes, landRes, sewaRes, renoRes, secRes, spkRes, soppRes, logRes] = await Promise.allSettled([
        getKomputer(),
        getLaptop(),
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
        getSpkPksList(),
        getSoppHistories(),
        getActivityLogs(),
      ]);

      if (compRes.status === "fulfilled") setComputers(ensureArray(compRes.value));
      if (laptopRes.status === "fulfilled") setLaptops(ensureArray(laptopRes.value));
      if (printRes.status === "fulfilled") setPrinters(ensureArray(printRes.value));
      if (trxRes.status === "fulfilled") {
        const fetchedTrx = ensureArray(trxRes.value);
        setTransactions((prev) => {
          if (!prev || prev.length === 0) return fetchedTrx;
          // Merge preserving existing local state and prioritizing freshly added documents
          const fetchedMap = new Map();
          fetchedTrx.forEach((t) => {
            if (t.id) fetchedMap.set(t.id, t);
          });

          const merged = prev.map((local) => {
            if (local.id && fetchedMap.has(local.id)) {
              const serverDoc = fetchedMap.get(local.id);
              fetchedMap.delete(local.id);
              return { ...serverDoc, ...local };
            }
            return local;
          });

          // Append any remaining server docs that weren't in local state
          fetchedMap.forEach((serverDoc) => {
            merged.push(serverDoc);
          });
          return merged;
        });
      }
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
      if (!silent) setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      showNotif(`Role user berhasil diubah menjadi ${newRole}`, "success");
      loadAllData();
    } catch (err) {
      console.error("Gagal mengupdate role user:", err);
      showNotif("Gagal mengupdate role user", "error");
    }
  };

  const { formData, setFormData, items, setItems, activeTransaction, setActiveTransaction, startNewDocument, editDocument, viewDocument, addItem, removeItem, handleInputChange, handleItemChange, handleSaveTransaction, isSaving } =
    useTransaksi({
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

  const matchedUser = useMemo(() => {
    if (!user?.email) return null;
    return (usersList || []).find((u) => u.email?.toLowerCase() === user.email?.toLowerCase());
  }, [user, usersList]);

  const isMustChangePassword = useMemo(() => {
    if (user?.mustChangePassword) return true;
    if (matchedUser && matchedUser.mustChangePassword) return true;
    return false;
  }, [user, matchedUser]);

  const activeUser = useMemo(() => {
    if (!user) return null;
    const name = matchedUser?.name || matchedUser?.nama || user.name || (user.email === "officer@gmail.com" ? "Dio Haris Kurniawan" : user.email === "admin@logistik.com" ? "Alzi Rahmana Putra" : user.email?.split("@")[0] || "User Logistik");
    const roleStr = matchedUser?.role || user.role || "user";
    const r = String(roleStr).toLowerCase();
    let roleLabel = "USER (PENGGUNA)";
    if (r === "admin" || r === "administrator") roleLabel = "ADMINISTRATOR";
    else if (r === "officer" || r === "logistik officer" || r === "manager") roleLabel = "LOGISTIK OFFICER";

    return { ...user, name, role: roleLabel, rawRole: roleStr };
  }, [user, matchedUser]);

  const activeRole = useMemo(() => {
    if (!activeUser) return "user";
    const r = String(activeUser.role || activeUser.rawRole || "").toLowerCase();
    if (r.includes("admin")) return "admin";
    if (r.includes("officer")) return "officer";
    return "user";
  }, [activeUser]);

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
        buildingRenovations={buildingRenovations}
        securityFacilities={securityFacilities}
        user={activeUser}
        userRole={activeRole}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-84" : "md:ml-20"} pt-16 md:pt-0`}>
        {/* Header Bar */}
        <AppHeader
          user={activeUser}
          userRole={activeRole}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title={activeTab}
          printers={printers}
          computers={computers}
          buildingLands={buildingLands}
          buildingSewas={buildingSewas}
          setLandFilter={setLandFilter}
          setSewaFilter={setSewaFilter}
          setComputerFilter={setComputerFilter}
          setPrinterFilter={setPrinterFilter}
          setPrinterSearch={setPrinterSearch}
          setComputerSearch={setComputerSearch}
          setLandSearch={setLandSearch}
          setSewaSearch={setSewaSearch}
          setView={handleSetView}
          usersList={usersList}
        />

        {/* Tab Navigation & Search Bar */}
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabs={setTabs}
          closeTab={closeTab}
          notifSewaCount={notifSewa.length}
          notifSewaKomputerCount={notifSewaKomputer.length}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold">Memuat Data Sistem Logistik...</p>
            </div>
          ) : (
            <TabContent
              tabs={tabs}
              activeTab={activeTab}
              userRole={activeRole}
              transactions={transactions}
              setTransactions={setTransactions}
              inventory={inventory}
              setInventory={setInventory}
              outlets={outlets}
              printers={printers}
              computers={computers}
              laptops={laptops}
              notifSewa={notifSewa}
              notifSewaKomputer={notifSewaKomputer}
              usersList={usersList}
              vendors={vendors}
              loadAllData={loadAllData}
              activityLogs={activityLogs}
              setActivityLogs={setActivityLogs}
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
              startNewDocument={startNewDocument}
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
              printerSearch={printerSearch}
              setPrinterSearch={setPrinterSearch}
              computerSearch={computerSearch}
              setComputerSearch={setComputerSearch}
              landSearch={landSearch}
              setLandSearch={setLandSearch}
              sewaSearch={sewaSearch}
              setSewaSearch={setSewaSearch}
            />
          )}
        </main>
      </div>

      {/* Modal Wajib Ganti Password saat pertama kali login */}
      {isMustChangePassword && (
        <ForceChangePasswordModal
          isOpen={true}
          onSuccess={() => {
            showNotif("Password berhasil diganti. Selamat datang di sistem logistik!", "success");
            loadAllData();
          }}
        />
      )}

      <ToastNotif notif={notif} />
    </div>
  );
}
