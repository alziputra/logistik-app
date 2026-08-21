import { useNotification } from "../context/NotificationContext";

export function useNotif() {
  const { showSuccess, showError, showConfirmDelete } = useNotification();

  const showNotif = (message, type = "success") => {
    if (type === "error") {
      showError("Gagal Memproses Data", message);
    } else {
      showSuccess("Berhasil Memproses Data", message);
    }
  };

  return { notif: { show: false }, showNotif, showSuccess, showError, showConfirmDelete };
}
