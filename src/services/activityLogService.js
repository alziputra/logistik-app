import { fetchCollectionData, addDocumentData } from "./firestoreHelper";

const PATHS = ["logistik/operations/activity_logs", { parentCol: "logistik", parentDoc: "operations", subCol: "activity_logs" }];

export const getActivityLogs = async () => {
  const data = await fetchCollectionData(PATHS, []);
  return (data || []).sort((a, b) => {
    const timeA = new Date(a.timestamp || a.created_at || a.createdAt || 0).getTime();
    const timeB = new Date(b.timestamp || b.created_at || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

export const addActivityLog = async (logData) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      timestamp: now,
      created_at: now,
      createdAt: now,
      user: logData.user || logData.user_name || "Admin Logistik",
      user_name: logData.user_name || logData.user || "Admin Logistik",
      user_email: logData.user_email || logData.email || "",
      modul: logData.modul || "UMUM",
      aksi: logData.aksi || "INFO",
      keterangan: logData.keterangan || "",
      ...logData,
    };
    return await addDocumentData(PATHS[0], payload);
  } catch (err) {
    console.warn("Gagal mencatat log aktivitas:", err);
    return null;
  }
};
