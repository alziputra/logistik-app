// src/app/page.jsx
"use client";

import { CheckCircle } from "lucide-react";
import AppHeader        from "../components/Layout/AppHeader";
import { VIEW_TITLES }  from "../constants/tabConfig";
import Navbar           from "../components/Layout/Navbar";
import LoginView        from "../components/LoginView";
import TabBar           from "../components/Layout/TabBar";
import TabContent       from "../components/Layout/TabContent";
import { useNotif }     from "../hooks/useNotif";
import { useTabs }      from "../hooks/useTabs";
import { useAuth }      from "../hooks/useAuth";
import { useAppData }   from "../hooks/useAppData";
import { useTransaksi } from "../hooks/useTransaksi";

export default function SuratSerahTerimaApp() {
  const appId = process.env.NEXT_PUBLIC_APP_ID;

  const { notif, showNotif } = useNotif();
  const { tabs, setTabs, activeTab, setActiveTab, handleSetView } = useTabs();
  const { user, userRole, authLoading, handleLogout } = useAuth(
    () => handleSetView("dashboard"),
    showNotif
  );
  const {
    inventory, setInventory, outlets,
    transactions, setTransactions,
    printers, computers,
    notifSewa, notifSewaKomputer,
    usersList, activityLogs, setActivityLogs,
  } = useAppData(user, appId);
  const {
    formData, setFormData, items, setItems,
    activeTransaction, setActiveTransaction,
    startNewDocument, addItem, removeItem,
    handleInputChange, handleItemChange, handleSaveTransaction,
  } = useTransaksi({
    user, appId, transactions, inventory,
    setTransactions, setInventory, setActivityLogs,
    showNotif, navigateTo: handleSetView,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Memuat sistem...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {notif.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notif.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
            <span>{notif.message}</span>
          </div>
        )}
        <LoginView showNotif={showNotif} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:p-0">

      {/* Toast notifikasi */}
      {notif.show && (
        <div className={`fixed top-4 right-4 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white ${notif.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          <CheckCircle className="w-5 h-5" />
          <span>{notif.message}</span>
        </div>
      )}

      {/* Sidebar/Navbar — fixed di kiri (desktop) atau top (mobile) */}
      <Navbar
        view={activeTab}
        setView={handleSetView}
        startNewDocument={startNewDocument}
        handleLogout={handleLogout}
        notifCount={notifSewa.length + notifSewaKomputer.length}
        userRole={userRole}
      />

      {/*
        Konten utama:
        - pt-16   : kompensasi Navbar mobile fixed h-16
        - md:pt-0 : desktop tidak perlu, Navbar adalah sidebar
        - md:pl-64: geser kanan sejauh lebar sidebar desktop
      */}
      <div className="pt-16 md:pt-0 md:pl-64 flex flex-col min-h-screen print:pl-0 print:pt-0">

        {/* AppHeader sticky:
            - Mobile  : top-16 (tepat di bawah Navbar mobile fixed h-16)
            - Desktop : top-0  (Navbar adalah sidebar, bukan top bar)
        */}
        <AppHeader
          user={user}
          title={VIEW_TITLES[activeTab]}
        />

        {/* TabBar sticky:
            - Mobile  : top-32 (h-16 Navbar + h-16 AppHeader)
            - Desktop : top-20 (h-20 AppHeader saja)
        */}
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabs={setTabs}
        />

        {/* Konten halaman */}
        <div className="flex-1 bg-white pb-12">
          <TabContent
            tabs={tabs}
            activeTab={activeTab}
            userRole={userRole}
            user={user}
            transactions={transactions}
            inventory={inventory}
            outlets={outlets}
            printers={printers}
            computers={computers}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            usersList={usersList}
            activityLogs={activityLogs}
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
            setView={handleSetView}
          />
        </div>

      </div>
    </div>
  );
}