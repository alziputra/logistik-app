import React, { createContext, useContext, useState, useCallback } from "react";
import GlobalModal from "../components/Modal/GlobalModal";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "success", // "success" | "error" | "confirm_delete"
    title: "",
    message: "",
    itemName: "",
    isProcessing: false,
    onConfirm: null,
    autoCloseDuration: 3500,
  });

  const showSuccess = useCallback((title, message, autoCloseDuration = 3500) => {
    setModalState({
      isOpen: true,
      type: "success",
      title: message ? title : "Berhasil!",
      message: message || title || "Operasi berhasil dilaksanakan.",
      itemName: "",
      isProcessing: false,
      onConfirm: null,
      autoCloseDuration,
    });
  }, []);

  const showError = useCallback((title, message, autoCloseDuration = 4000) => {
    setModalState({
      isOpen: true,
      type: "error",
      title: message ? title : "Gagal!",
      message: message || title || "Terjadi kesalahan saat memproses data.",
      itemName: "",
      isProcessing: false,
      onConfirm: null,
      autoCloseDuration,
    });
  }, []);

  const showConfirmDelete = useCallback(({ title, message, itemName, onConfirm }) => {
    setModalState({
      isOpen: true,
      type: "confirm_delete",
      title: title || "Konfirmasi Hapus Data",
      message: message || "Apakah Anda yakin ingin menghapus data ini dari sistem?",
      itemName: itemName || "",
      isProcessing: false,
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, isProcessing: true }));
        try {
          if (onConfirm) await onConfirm();
          setModalState((prev) => ({ ...prev, isOpen: false, isProcessing: false }));
        } catch (err) {
          showError("Gagal Menghapus!", err.message || "Terjadi kesalahan saat menghapus.");
        }
      },
      autoCloseDuration: 0,
    });
  }, [showError]);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showConfirmDelete,
        hideModal,
      }}
    >
      {children}

      <GlobalModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        itemName={modalState.itemName}
        isProcessing={modalState.isProcessing}
        onClose={hideModal}
        onConfirm={modalState.onConfirm}
        autoCloseDuration={modalState.autoCloseDuration}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
