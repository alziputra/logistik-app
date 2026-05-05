// src/hooks/komputer/useKomputerCRUD.js
import { useState } from "react";
import { addKomputer, updateKomputer, deleteKomputer } from "../../services/komputerService";
import { emptyFormKomputer as emptyForm } from "../../utils/deviceUtils";
import { syncKomputerToSheet } from "../../lib/syncToSheets";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "logistikku_app_01";

export function useKomputerCRUD({ computerData, setComputerData, showNotif }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [isSaving, setIsSaving]       = useState(false);

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); };

  const openModalForAdd  = () => { resetForm(); setIsModalOpen(true); };
  const openModalForEdit = (comp) => {
    setEditingId(comp.id);
    setFormData({ ...comp });
    setIsModalOpen(true);
  };

  const syncToSheet = async (data) => {
    try { await syncKomputerToSheet(data); }
    catch (err) { console.warn("Sync Sheet gagal:", err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let updatedData;
      if (editingId) {
        await updateKomputer(APP_ID, editingId, formData);
        updatedData = computerData.map((item) =>
          item.id === editingId ? { id: editingId, ...formData } : item
        );
        showNotif("Perubahan data komputer berhasil disimpan!");
      } else {
        const newItem = await addKomputer(APP_ID, formData);
        updatedData = [newItem, ...computerData];
        showNotif("Data komputer baru berhasil ditambahkan!");
      }
      setComputerData(updatedData);
      await syncToSheet(updatedData);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showNotif("Gagal menyimpan data ke server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data komputer ini?")) return;
    try {
      await deleteKomputer(APP_ID, id);
      const updatedData = computerData.filter((p) => p.id !== id);
      setComputerData(updatedData);
      await syncToSheet(updatedData);
      showNotif("Data komputer berhasil dihapus.");
    } catch (err) {
      console.error(err);
      showNotif("Gagal menghapus data.", "error");
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    editingId, formData, setFormData,
    isSaving, setIsSaving,
    openModalForAdd, openModalForEdit,
    handleSave, handleDelete,
  };
}