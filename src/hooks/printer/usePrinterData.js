// src/hooks/printer/usePrinterData.js
// Orkestrator: menggabungkan usePrinterCRUD, usePrinterFilter, dan usePrinterActions.
// Dipecah dari God Hook sebelumnya agar setiap tanggung jawab terpisah.
"use client";

import { useState, useEffect } from "react";
import { fetchPrinter, fetchDropdowns } from "../../services/printerService";
import { calculateAutoStatus } from "../../utils/deviceUtils";
import { usePrinterCRUD }    from "./usePrinterCRUD";
import { usePrinterFilter }  from "./usePrinterFilter";
import { usePrinterActions } from "./usePrinterActions";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function usePrinterData() {
  const [printerData, setPrinterData]     = useState([]);
  const [outletsList, setOutletsList]     = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [snList, setSnList]               = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData]     = useState(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setKoneksiError(false);
      try {
        const [data, dropdowns] = await Promise.all([
          fetchPrinter(APP_ID),
          fetchDropdowns(APP_ID),
        ]);
        setPrinterData(data);
        setOutletsList(dropdowns.outlets);
        setInventoryList(dropdowns.inventory);
        setSnList(dropdowns.snList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setKoneksiError(true);
        setPrinterData([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Sub-hooks
  const crud    = usePrinterCRUD({ printerData, setPrinterData, showNotif, outletsList, inventoryList });
  const filter  = usePrinterFilter(printerData);
  const actions = usePrinterActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

  // Form handlers dengan logika domain
  const handleOutletChange = (e) => {
    const selectedOutlet = outletsList.find((o) => o.nama === e.target.value);
    crud.setFormData((prev) => ({
      ...prev,
      outlet:   e.target.value,
      idOutlet: selectedOutlet ? selectedOutlet.kode : "",
    }));
  };

  const handleProdukChange = (e) => {
    const itemMaster = inventoryList.find((inv) => inv.nama === e.target.value);
    crud.setFormData((prev) => {
      const updated = { ...prev, produk: e.target.value };
      if (itemMaster) {
        updated.penyedia       = itemMaster.vendor_nama     || "";
        updated.tanggalMulai   = itemMaster.tanggal_mulai   || "";
        updated.tanggalSelesai = itemMaster.tanggal_selesai || "";
        updated.status         = calculateAutoStatus(itemMaster.tanggal_mulai, itemMaster.tanggal_selesai);
      } else {
        updated.penyedia = updated.tanggalMulai = updated.tanggalSelesai = "";
        updated.status   = "Inventaris";
      }
      return updated;
    });
  };

  const handleDateChange = (field, value) => {
    crud.setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      updated.status = calculateAutoStatus(updated.tanggalMulai, updated.tanggalSelesai);
      return updated;
    });
  };

  return {
    printerData, outletsList, inventoryList, snList,
    isLoading, koneksiError, notif, setNotif,
    qrModalData, setQrModalData,
    ...crud,
    ...filter,
    ...actions,
    handleOutletChange, handleProdukChange, handleDateChange,
  };
}
