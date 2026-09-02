import React from "react";
import {
  DashboardView,
  DataMaster,
  FormView,
  PreviewView,
  DataPrinter,
  DataKomputer,
  DataLaptop,
  KelolaUser,
  RiwayatTransaksi,
  LogAktivitas,
  BangunanTanah,
  BangunanSewa,
  BangunanRenovasi,
  BangunanSarana,
  BangunanSPK,
  NotificationPageView,
  SoppGenerator,
} from "./LazyComponents";

function Panel({ id, activeTab, children }) {
  const isActive = activeTab === id || (id === "dashboard" && activeTab?.startsWith("dashboard"));
  return (
    <div id={id} className={isActive ? "block animate-in fade-in duration-300" : "hidden"}>
      {children}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-slate-200">Akses Ditolak</h2>
      <p className="text-sm mt-1">Anda tidak memiliki izin (Admin) untuk mengakses halaman ini.</p>
    </div>
  );
}

export default function TabContent({
  tabs,
  activeTab,
  userRole = "admin",
  transactions = [],
  setTransactions = () => {},
  inventory = [],
  outlets = [],
  printers = [],
  computers = [],
  laptops = [],
  notifSewa = [],
  notifSewaKomputer = [],
  usersList = [],
  vendors = [],
  loadAllData = () => {},
  activityLogs = [],
  buildingLands = [],
  buildingSewas = [],
  buildingRenovations = [],
  securityFacilities = [],
  spkHistory = [],
  soppHistory = [],
  formData = {},
  setFormData = () => {},
  items = [],
  setItems = () => {},
  activeTransaction = null,
  setActiveTransaction = () => {},
  handleInputChange = () => {},
  handleItemChange = () => {},
  addItem = () => {},
  removeItem = () => {},
  handleSaveTransaction = () => {},
  isSaving = false,
  editDocument = () => {},
  viewDocument = () => {},
  setView = () => {},
  user = {},
  handleUpdateRole = () => {},
  landFilter = "",
  setLandFilter = () => {},
  sewaFilter = "",
  setSewaFilter = () => {},
  renovationFilter = "",
  setRenovationFilter = () => {},
  securityFilter = "",
  setSecurityFilter = () => {},
  printerFilter = "Semua",
  setPrinterFilter = () => {},
  computerFilter = "Semua",
  setComputerFilter = () => {},
  printerSearch = "",
  setPrinterSearch = () => {},
  computerSearch = "",
  setComputerSearch = () => {},
  landSearch = "",
  setLandSearch = () => {},
  sewaSearch = "",
  setSewaSearch = () => {},
}) {
  const has = (id) => tabs.some((t) => t.id === id);

  return (
    <div className="flex-1 w-full bg-slate-950 text-slate-100 relative transition-colors">
      {has("dashboard") && (
        <Panel id="dashboard" activeTab={activeTab}>
          <DashboardView
            activeTab={activeTab}
            transactions={transactions}
            inventory={inventory}
            setView={setView}
            user={user}
            userRole={userRole}
            notifSewa={notifSewa}
            notifSewaKomputer={notifSewaKomputer}
            printers={printers}
            computers={computers}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            buildingRenovations={buildingRenovations}
            securityFacilities={securityFacilities}
            landFilter={landFilter}
            setLandFilter={setLandFilter}
            sewaFilter={sewaFilter}
            setSewaFilter={setSewaFilter}
            securityFilter={securityFilter}
            setSecurityFilter={setSecurityFilter}
            computerFilter={computerFilter}
            setComputerFilter={setComputerFilter}
            printerFilter={printerFilter}
            setPrinterFilter={setPrinterFilter}
          />
        </Panel>
      )}

      {/* BUAT SURAT / EDIT SURAT (DESKTOP SPLIT-VIEW) VS LIHAT SURAT (FULL DOKUMEN PREVIEW) */}
      {(has("form") || has("preview") || activeTab === "form" || activeTab === "preview") && (
        <div id="form_preview_panel" className={activeTab === "form" || activeTab === "preview" ? "block animate-in fade-in duration-300 print:block print:p-0 print:m-0" : "hidden"}>
          <div className="w-full max-w-[1700px] mx-auto pt-6 pb-2 px-2 sm:p-4 lg:p-6 print:p-0 print:m-0 print:max-w-full">
            {activeTab === "preview" ? (
              /* MODE LIHAT SURAT (👁️): Tampilan Dokumen Penuh di Tengah (Clean Full-Width View) */
              <div className="w-full max-w-4xl mx-auto">
                <PreviewView formData={formData} items={items} activeTransaction={activeTransaction} setView={setView} handleSaveTransaction={handleSaveTransaction} isSaving={isSaving} isViewOnly={true} />
              </div>
            ) : (
              /* MODE EDIT SURAT (✏️) ATAU BUAT SURAT BARU (➕): Split-View Form (Kiri) & Live Preview (Kanan) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 xl:col-span-6">
                  <FormView formData={formData} handleInputChange={handleInputChange} items={items} handleItemChange={handleItemChange} addItem={addItem} removeItem={removeItem} setView={setView} inventory={inventory} outlets={outlets} />
                </div>

                <div className="lg:col-span-6 xl:col-span-6 sticky top-6">
                  <PreviewView formData={formData} items={items} activeTransaction={activeTransaction} setView={setView} handleSaveTransaction={handleSaveTransaction} isSaving={isSaving} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {has("master_barang") && (
        <Panel id="master_barang" activeTab={activeTab}>
          <DataMaster activeMenu="master_barang" inventory={inventory} outlets={outlets} vendors={vendors} spkPksList={spkHistory} userRole={userRole} loadAllData={loadAllData} />
        </Panel>
      )}

      {has("master_spk_pks") && (
        <Panel id="master_spk_pks" activeTab={activeTab}>
          <DataMaster activeMenu="master_spk_pks" spkPksList={spkHistory} inventory={inventory} outlets={outlets} vendors={vendors} userRole={userRole} loadAllData={loadAllData} />
        </Panel>
      )}

      {has("master_outlet") && (
        <Panel id="master_outlet" activeTab={activeTab}>
          <DataMaster activeMenu="master_outlet" inventory={inventory} outlets={outlets} vendors={vendors} userRole={userRole} loadAllData={loadAllData} />
        </Panel>
      )}

      {has("master_vendor") && (
        <Panel id="master_vendor" activeTab={activeTab}>
          <DataMaster activeMenu="master_vendor" inventory={inventory} outlets={outlets} vendors={vendors} userRole={userRole} loadAllData={loadAllData} />
        </Panel>
      )}

      {(has("perangkat_printer") || has("printer")) && (
        <Panel id={has("perangkat_printer") ? "perangkat_printer" : "printer"} activeTab={activeTab}>
          <DataPrinter
            printers={printers}
            outlets={outlets}
            inventory={inventory}
            vendors={vendors}
            userRole={userRole}
            loadAllData={loadAllData}
            printerFilter={printerFilter}
            setPrinterFilter={setPrinterFilter}
            printerSearch={printerSearch}
            setPrinterSearch={setPrinterSearch}
          />
        </Panel>
      )}

      {(has("perangkat_komputer") || has("komputer")) && (
        <Panel id={has("perangkat_komputer") ? "perangkat_komputer" : "komputer"} activeTab={activeTab}>
          <DataKomputer
            computers={computers}
            outlets={outlets}
            inventory={inventory}
            vendors={vendors}
            userRole={userRole}
            loadAllData={loadAllData}
            computerFilter={computerFilter}
            setComputerFilter={setComputerFilter}
            computerSearch={computerSearch}
            setComputerSearch={setComputerSearch}
          />
        </Panel>
      )}

      {(has("perangkat_laptop") || has("laptop")) && (
        <Panel id={has("perangkat_laptop") ? "perangkat_laptop" : "laptop"} activeTab={activeTab}>
          <DataLaptop laptops={laptops} vendors={vendors} inventory={inventory} userRole={userRole} loadAllData={loadAllData} />
        </Panel>
      )}

      {has("bangunan_tanah") && (
        <Panel id="bangunan_tanah" activeTab={activeTab}>
          <BangunanTanah userRole={userRole} lands={buildingLands} landFilter={landFilter} setLandFilter={setLandFilter} landSearch={landSearch} setLandSearch={setLandSearch} />
        </Panel>
      )}

      {has("bangunan_sewa") && (
        <Panel id="bangunan_sewa" activeTab={activeTab}>
          <BangunanSewa userRole={userRole} sewas={buildingSewas} outlets={outlets} sewaFilter={sewaFilter} setSewaFilter={setSewaFilter} sewaSearch={sewaSearch} setSewaSearch={setSewaSearch} />
        </Panel>
      )}

      {has("bangunan_renovasi") && (
        <Panel id="bangunan_renovasi" activeTab={activeTab}>
          <BangunanRenovasi userRole={userRole} renovations={buildingRenovations} renovationFilter={renovationFilter} setRenovationFilter={setRenovationFilter} />
        </Panel>
      )}

      {has("bangunan_sarana") && (
        <Panel id="bangunan_sarana" activeTab={activeTab}>
          <BangunanSarana userRole={userRole} facilities={securityFacilities} securityFilter={securityFilter} setSecurityFilter={setSecurityFilter} />
        </Panel>
      )}

      <Panel id="spk_renovasi" activeTab={activeTab}>
        <BangunanSPK type="renovasi" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="spk_elektronik" activeTab={activeTab}>
        <BangunanSPK type="elektronik" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="spk_kendaraan" activeTab={activeTab}>
        <BangunanSPK type="kendaraan" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="sopp_pengadaan" activeTab={activeTab}>
        <SoppGenerator type="pengadaan" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="sopp_sewa" activeTab={activeTab}>
        <SoppGenerator type="sewa" setView={setView} activeTab={activeTab} />
      </Panel>

      <Panel id="sopp_renovasi" activeTab={activeTab}>
        <SoppGenerator type="renovasi" setView={setView} activeTab={activeTab} />
      </Panel>

      {has("riwayat") && (
        <Panel id="riwayat" activeTab={activeTab}>
          <RiwayatTransaksi
            transactions={transactions}
            setTransactions={setTransactions}
            setFormData={setFormData}
            setItems={setItems}
            setActiveTransaction={setActiveTransaction}
            setView={setView}
            editDocument={editDocument}
            viewDocument={viewDocument}
            currentTab={activeTab}
            spkHistoryProp={spkHistory}
            soppHistoryProp={soppHistory}
          />
        </Panel>
      )}

      {has("kelola_user") && (
        <Panel id="kelola_user" activeTab={activeTab}>
          {userRole === "admin" ? <KelolaUser usersList={usersList} handleUpdateRole={handleUpdateRole} /> : <AccessDenied />}
        </Panel>
      )}

      {has("log_aktivitas") && (
        <Panel id="log_aktivitas" activeTab={activeTab}>
          {userRole === "admin" ? <LogAktivitas logs={activityLogs} /> : <AccessDenied />}
        </Panel>
      )}

      {has("notifikasi") && (
        <Panel id="notifikasi" activeTab={activeTab}>
          <NotificationPageView notifSewa={notifSewa} notifSewaKomputer={notifSewaKomputer} setView={setView} />
        </Panel>
      )}
    </div>
  );
}
