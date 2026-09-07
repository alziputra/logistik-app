import { useState, useEffect, useMemo } from "react";

export function useDeviceTableState({ data = [], filterFn, externalSearch = "", onExternalSearchChange, externalFilter, onExternalFilterChange, initialFilter = "Semua", loadAllData, defaultFormData = {} }) {
  const [searchQuery, setSearchQuery] = useState(externalSearch || "");
  const [filterStatusState, setFilterStatusState] = useState(externalFilter || initialFilter || "Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  const [qrModalData, setQrModalData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (typeof externalSearch === "string") {
      setSearchQuery(externalSearch);
      setCurrentPage(1);
    }
  }, [externalSearch]);

  useEffect(() => {
    if (externalFilter) {
      setFilterStatusState(externalFilter);
    } else if (initialFilter) {
      setFilterStatusState(initialFilter);
    }
  }, [externalFilter, initialFilter]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (onExternalSearchChange) onExternalSearchChange(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatusState(newStatus);
    if (onExternalFilterChange) onExternalFilterChange(newStatus);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (filterFn) {
      return data.filter((item) => filterFn(item, searchQuery, filterStatusState));
    }
    return data;
  }, [data, filterFn, searchQuery, filterStatusState]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const openAddModal = (customDefaults = {}) => {
    setEditingId(null);
    setFormData({ ...defaultFormData, ...customDefaults });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSave = async (e, onAdd, onUpdate, entityName = "Data") => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        if (onUpdate) await onUpdate(editingId, formData);
        setNotif({ show: true, message: `${entityName} berhasil diupdate!`, type: "success" });
      } else {
        if (onAdd) await onAdd(formData);
        setNotif({ show: true, message: `${entityName} baru berhasil ditambahkan!`, type: "success" });
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error(`Gagal menyimpan ${entityName}:`, err);
      setNotif({ show: true, message: `Gagal menyimpan ${entityName}.`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (id, name = "") => {
    setDeleteConfirm({ show: true, id, name });
  };

  const handleDeleteConfirm = async (onDelete, entityName = "Data") => {
    if (!deleteConfirm.id) return;
    setIsSaving(true);
    try {
      if (onDelete) await onDelete(deleteConfirm.id);
      setNotif({ show: true, message: `${entityName} berhasil dihapus!`, type: "success" });
      setDeleteConfirm({ show: false, id: null, name: "" });
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error(`Gagal menghapus ${entityName}:`, err);
      setNotif({ show: true, message: `Gagal menghapus ${entityName}.`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    filterStatusState,
    setFilterStatusState,
    handleFilterChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
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
    closeModal,
    handleSave,
    qrModalData,
    setQrModalData,
    deleteConfirm,
    setDeleteConfirm,
    requestDelete,
    handleDeleteConfirm,
    notif,
    setNotif,
  };
}
