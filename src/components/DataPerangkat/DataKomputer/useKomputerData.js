// src/components/DataPerangkat/DataKomputer/useKomputerData.js
"use client";

import { useState, useEffect } from "react";
import { fetchKomputer, fetchDropdowns } from "./komputerService";
import { calculateAutoStatus } from "./komputerUtils";
import { useKomputerCRUD }    from "./useKomputerCRUD";
import { useKomputerFilter }  from "./useKomputerFilter";
import { useKomputerActions } from "./useKomputerActions";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function useKomputerData() {
  const [computerData, setComputerData]   = useState([]);
  const [outletsList, setOutletsList]     = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [koneksiError, setKoneksiError]   = useState(false);
  const [notif, setNotif]                 = useState({ show: false, message: "", type: "" });
  const [qrModalData, setQrModalData]     = useState(null);

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setKoneksiError(false);
      try {
        const [data, dropdowns] = await Promise.all([
          fetchKomputer(APP_ID),
          fetchDropdowns(APP_ID),
        ]);
        setComputerData(data);
        setOutletsList(dropdowns.outlets);
        setInventoryList(dropdowns.inventory);
      } catch (err) {
        console.error(err);
        setKoneksiError(true);
        setComputerData([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const crud    = useKomputerCRUD({ computerData, setComputerData, showNotif });
  const filter  = useKomputerFilter(computerData);
  const actions = useKomputerActions({
    filteredData: filter.filteredData,
    setIsSaving:  crud.setIsSaving,
    showNotif,
  });

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
    // data
    computerData, outletsList, inventoryList,
    // ui
    isLoading, koneksiError, notif, setNotif,
    qrModalData, setQrModalData,
    // crud
    ...crud,
    // filter & pagination
    ...filter,
    // actions (csv, excel, sync)
    ...actions,
    // form handlers
    handleOutletChange, handleProdukChange, handleDateChange,
  };
}