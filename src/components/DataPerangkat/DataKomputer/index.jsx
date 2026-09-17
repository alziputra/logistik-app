import React, { useCallback, useMemo } from "react";
import { Monitor, Search, Plus } from "lucide-react";

import KomputerTable from "./KomputerTable";
import KomputerModal from "./KomputerModal";
import QrLabelModal from "../../Modal/QrLabelModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addKomputer, updateKomputer, deleteKomputer, batchUpsertKomputer } from "../../../services/komputerService";
import { useDeviceTableState } from "../../../hooks/useDeviceTableState";

export default function DataKomputer({
  userRole = "admin",
  computers = [],
  outlets = [],
  inventory = [],
  vendors = [],
  filterStatus: propFilterStatus = "Semua",
  computerFilter,
  setComputerFilter,
  setFilterStatus,
  computerSearch = "",
  setComputerSearch,
  loadAllData,
}) {
  const enrichedComputers = useMemo(() => {
    return (computers || []).map((comp) => {
      const spk = comp.no_spk || comp.spk || comp.spkNo || "";
      const matchedInv = inventory?.find(
        (inv) => (inv.nama && comp.produk && inv.nama.toLowerCase() === comp.produk.toLowerCase()) ||
                 (inv.no_spk && spk && inv.no_spk.toLowerCase() === spk.toLowerCase())
      );
      const fallbackVendor = matchedInv?.vendor_nama || (typeof matchedInv?.vendor === "string" ? matchedInv.vendor : matchedInv?.vendor?.nama) || "";
      const vendorName = comp.penyedia || comp.vendor || comp.nama_vendor || comp.vendorNama || fallbackVendor || "-";
      return {
        ...comp,
        penyedia: vendorName,
        vendor: vendorName,
      };
    });
  }, [computers, inventory]);

  const filterKomputerFn = useCallback((item, search, statusFilter) => {
    const q = (search || "").toLowerCase();
    const matchSearch =
      item.produk?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.outlet?.toLowerCase().includes(q) ||
      item.idOutlet?.toLowerCase().includes(q) ||
      item.hostname?.toLowerCase().includes(q) ||
      item.username?.toLowerCase().includes(q) ||
      item.ipAddress?.toLowerCase().includes(q) ||
      item.macAddress?.toLowerCase().includes(q) ||
      item.no_spk?.toLowerCase().includes(q) ||
      item.vendor?.toLowerCase().includes(q) ||
      item.penyedia?.toLowerCase().includes(q);

    let matchFilter = true;
    if (statusFilter === "warning" || statusFilter === "Sewa Habis" || statusFilter === "Habis") {
      const st = (item.status || "").toLowerCase();
      matchFilter = st.includes("habis") || st.includes("warning") || st.includes("akan habis") || (item.tanggalSelesai && new Date(item.tanggalSelesai) <= new Date(Date.now() + 30 * 86400000));
    } else if (statusFilter && statusFilter !== "Semua") {
      matchFilter = (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    }
    return matchSearch && matchFilter;
  }, []);

  const {
    searchQuery,
    handleSearchChange,
    filterStatusState,
    handleFilterChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredData,
    totalPages,
    startIndex,
    paginatedData,
    isModalOpen,
    setIsModalOpen,
    editingId,
    formData,
    setFormData,
    isSaving,
    openAddModal,
    openEditModal,
    handleSave,
    qrModalData,
    setQrModalData,
    deleteConfirm,
    setDeleteConfirm,
    requestDelete,
    handleDeleteConfirm,
    notif,
    setNotif,
  } = useDeviceTableState({
    data: enrichedComputers,
    filterFn: filterKomputerFn,
    externalSearch: computerSearch,
    onExternalSearchChange: setComputerSearch,
    externalFilter: computerFilter,
    onExternalFilterChange: (newSt) => {
      if (setComputerFilter) setComputerFilter(newSt);
      if (setFilterStatus) setFilterStatus(newSt);
    },
    initialFilter: propFilterStatus,
    loadAllData,
  });

  const parseIndonesianDate = (val) => {
    if (!val) return "";
    if (typeof val?.toDate === "function") return val.toDate().toISOString().slice(0, 10);
    if (val?.seconds) return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

    const monthMap = {
      januari: "01", jan: "01",
      februari: "02", feb: "02",
      maret: "03", mar: "03",
      april: "04", apr: "04",
      mei: "05", may: "05",
      juni: "06", jun: "06",
      juli: "07", jul: "07",
      agustus: "08", aug: "08", agu: "08",
      september: "09", sep: "09",
      oktober: "10", oct: "10", okt: "10",
      november: "11", nov: "11",
      desember: "12", dec: "12", des: "12",
    };

    const indoMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    if (indoMatch) {
      const day = indoMatch[1].padStart(2, "0");
      const mStr = indoMatch[2].toLowerCase();
      const yr = indoMatch[3];
      const mon = monthMap[mStr] || "01";
      return `${yr}-${mon}-${day}`;
    }

    const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return str;
  };

  const calculateStatusFromDates = (tglSelesai) => {
    if (!tglSelesai) return "Sewa Berjalan";
    const end = new Date(tglSelesai);
    if (isNaN(end.getTime())) return "Sewa Berjalan";
    const now = new Date();
    return end < now ? "Sewa Habis" : "Sewa Berjalan";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Monitor className="w-6 h-6 text-emerald-400" /> Manajemen Data Komputer (PC / Laptop)
          </h2>
          <p className="text-sm text-slate-400 mt-1">Kelola data perangkat komputer, IP address, spesifikasi teknis, dan masa sewa.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExcelActionButtons
            data={filteredData}
            fileName="Data_Komputer_Pegadaian"
            headersMap={{
              idOutlet: "Outlet Id",
              outlet: "Nama Outlet",
              username: "Username",
              hostname: "Hostname",
              produk: "Product Hardware",
              sn: "Serial Number",
              no_spk: "SPK",
              penyedia: "Penyedia / Vendor",
              tanggalMulai: "Awal Sewa",
              tanggalSelesai: "Akhir Sewa",
              ipAddress: "Ip Address",
              macAddress: "Mac",
              ram: "Physical Memory",
              cpu: "CPU",
              storage: "Physical Disk",
              os: "OS Name",
              osVersion: "OS Version",
              lastUpdate: "Last Update",
              timeUpdate: "Time Update",
            }}
            sampleRow={{
              idOutlet: "12473",
              outlet: "CP BEKASI TIMUR",
              username: "pegadaian",
              hostname: "pc-12473-2.pegadaiann.co.id",
              produk: "Dell Pro Slim QCS1250",
              sn: "8V63PD4",
              no_spk: "642/00108.04/2026",
              penyedia: "PT PESONA OPTIMA JASA",
              tanggalMulai: "05 Maret 2026",
              tanggalSelesai: "05 Maret 2028",
              ipAddress: "10.81.182.30",
              macAddress: "d4:a2:cd:a4:94:e0",
              ram: "7 GB",
              cpu: "Intel(R) Core(TM) i5-14600",
              storage: "503GB",
              os: "Ubuntu 22.04 Build 2025.11.11",
              osVersion: "22.04",
              lastUpdate: "2026-09-01",
              timeUpdate: "7:40:09",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;

              const findExisting = (rowSn, rowHost, rowId) => {
                if (!computers || computers.length === 0) return null;
                const cleanId = String(rowId || "").trim();
                const cleanSn = String(rowSn || "").trim().toLowerCase();
                const cleanHost = String(rowHost || "").trim().toLowerCase();

                if (cleanId) {
                  const byId = computers.find((c) => String(c.id) === cleanId);
                  if (byId) return byId;
                }
                if (cleanSn && cleanSn !== "-" && cleanSn !== "empty") {
                  const bySn = computers.find(
                    (c) => String(c.sn || c.serialNumber || "").trim().toLowerCase() === cleanSn
                  );
                  if (bySn) return bySn;
                }
                if (cleanHost && cleanHost !== "-" && cleanHost !== "empty") {
                  const byHost = computers.find(
                    (c) => String(c.hostname || c.host || "").trim().toLowerCase() === cleanHost
                  );
                  if (byHost) return byHost;
                }
                return null;
              };

              const hasDiff = (existing, payload) => {
                const keys = [
                  "idOutlet", "outlet", "username", "hostname", "produk", "sn",
                  "no_spk", "penyedia", "tanggalMulai", "tanggalSelesai", "ipAddress", "macAddress",
                  "ram", "cpu", "storage", "os", "osVersion", "kondisi", "status"
                ];
                return keys.some((k) => {
                  const v1 = String(existing[k] ?? "").trim().toLowerCase();
                  const v2 = String(payload[k] ?? "").trim().toLowerCase();
                  return v1 !== v2;
                });
              };

              const itemsToUpsert = [];
              let updatedCount = 0;
              let newCount = 0;
              let skippedCount = 0;

              for (const row of parsedRows) {
                const produk = row.produk || row["Product Hardware"] || row["Model / Perangkat"] || row["nama"] || "";
                const sn = row.sn || row["Serial Number"] || row["SN"] || "";
                const hostname = row.hostname || row["Hostname"] || "";
                const rowId = row.id || row["ID"] || row["Id"] || "";
                if (!produk && !sn && !hostname) continue;

                const rawTglMulai = row.tanggalMulai || row["Awal Sewa"] || row["Tgl Mulai Sewa"] || row["tanggal_mulai"] || "";
                const rawTglSelesai = row.tanggalSelesai || row["Akhir Sewa"] || row["Tgl Selesai Sewa"] || row["tanggal_selesai"] || "";
                const tglMulai = parseIndonesianDate(rawTglMulai);
                const tglSelesai = parseIndonesianDate(rawTglSelesai);
                const status = row.status || row["Status"] || calculateStatusFromDates(tglSelesai);

                const rawPenyedia =
                  row.penyedia ||
                  row["Penyedia / Vendor"] ||
                  row["Penyedia"] ||
                  row["Vendor / Penyedia"] ||
                  row["Vendor"] ||
                  row["vendor"] ||
                  row["nama_vendor"] ||
                  "";
                const fallbackMatchedInv = inventory?.find(
                  (inv) => (inv.nama && produk && inv.nama.toLowerCase() === produk.toLowerCase()) ||
                           (inv.no_spk && (row.no_spk || row["SPK"]) && inv.no_spk.toLowerCase() === String(row.no_spk || row["SPK"]).toLowerCase())
                );
                const finalPenyedia = rawPenyedia || fallbackMatchedInv?.vendor_nama || "-";

                const payload = {
                  idOutlet: row.idOutlet || row["Outlet Id"] || row["ID Outlet"] || "",
                  outlet: row.outlet || row["Nama Outlet"] || row["Outlet / Unit Kerja"] || "",
                  username: row.username || row["Username"] || "pegadaian",
                  hostname,
                  produk,
                  sn,
                  no_spk: row.no_spk || row["SPK"] || row["No SPK"] || "",
                  penyedia: finalPenyedia,
                  vendor: finalPenyedia,
                  tanggalMulai: tglMulai,
                  tanggalSelesai: tglSelesai,
                  ipAddress: row.ipAddress || row["Ip Address"] || row["IP Address"] || "",
                  macAddress: row.macAddress || row["Mac"] || row["MAC Address"] || "",
                  ram: row.ram || row["Physical Memory"] || row["RAM"] || "",
                  cpu: row.cpu || row["CPU"] || row["Processor (CPU)"] || "",
                  storage: row.storage || row["Physical Disk"] || row["Storage / Harddisk"] || "",
                  os: row.os || row["OS Name"] || row["Operating System"] || "",
                  osVersion: row.osVersion || row["OS Version"] || "",
                  lastUpdate: row.lastUpdate || row["Last Update"] || new Date().toISOString().slice(0, 10),
                  timeUpdate: row.timeUpdate || row["Time Update"] || new Date().toTimeString().slice(0, 8),
                  kondisi: row.kondisi || row["Kondisi Hardware"] || "BAIK",
                  status,
                  keterangan: row.keterangan || row["Keterangan"] || "",
                };

                const existing = findExisting(sn, hostname, rowId);
                if (existing) {
                  if (hasDiff(existing, payload)) {
                    itemsToUpsert.push({ id: existing.id, isNew: false, data: payload });
                    updatedCount++;
                  } else {
                    // Sama persis, lewati! (0 kuota Firebase terpakai)
                    skippedCount++;
                  }
                } else {
                  itemsToUpsert.push({ isNew: true, data: payload });
                  newCount++;
                }
              }

              if (itemsToUpsert.length === 0) {
                setNotif({
                  show: true,
                  message: `Semua data (${skippedCount} baris) sudah sesuai & tidak ada perubahan. Hemat kuota: 0 kuota Firebase terpakai!`,
                  type: "info",
                });
                return;
              }

              try {
                await batchUpsertKomputer(itemsToUpsert);
                setNotif({
                  show: true,
                  message: `Import Berhasil! ${updatedCount} data diperbarui, ${newCount} data baru ditambahkan, ${skippedCount} data tidak berubah (hemat kuota).`,
                  type: "success",
                });
                if (loadAllData) loadAllData();
              } catch (err) {
                console.error("Error batch upsert komputer:", err);
                setNotif({ show: true, message: `Gagal mengimpor data: ${err.message}`, type: "error" });
              }
            }}
          />

          {(userRole === "admin" || userRole === "officer" || userRole === "user") && (
            <button onClick={() => openAddModal({})} className="flex items-center gap-2 bg-[#00753A] hover:bg-[#006030] text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Tambah Komputer
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari model, S/N, IP, atau outlet..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-100 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200 text-xs bg-slate-700 hover:bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  title="Hapus Pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Status Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleFilterChange("Semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatusState === "Semua" ? "bg-slate-800 text-white font-bold shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
              >
                Semua Data
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("Sewa Berjalan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatusState === "Sewa Berjalan" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sewa Berjalan
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("warning")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatusState === "warning" || filterStatusState === "Sewa Habis" ? "bg-rose-950 text-rose-400 border border-rose-800/60 font-bold" : "text-slate-400 hover:text-rose-400"
                }`}
              >
                <span>⚠️ Sewa Habis</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Total Komputer: {filteredData.length}</span>
          </div>
        </div>

        <KomputerTable
          isLoading={false}
          paginatedData={paginatedData}
          filteredData={filteredData}
          userRole={userRole}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          onEdit={openEditModal}
          onDelete={(id, nama) => requestDelete(id, nama)}
          onQr={setQrModalData}
          inventoryList={inventory}
        />
      </div>

      <KomputerModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outlets}
        inventoryList={inventory}
        vendorsList={vendors}
        onClose={() => setIsModalOpen(false)}
        onSave={(e) => handleSave(e, addKomputer, updateKomputer, "Komputer")}
      />

      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.show}
        title="Hapus Data Komputer?"
        message={`Apakah Anda yakin ingin menghapus data komputer "${deleteConfirm.name}"? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={() => handleDeleteConfirm(deleteKomputer, "Data komputer")}
        onClose={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      <ToastNotif notif={notif} onClose={() => setNotif({ show: false, message: "", type: "success" })} />
    </div>
  );
}
