// src/lib/syncToSheets.js

const PROXY_URL = "/api/sync-sheets"; // ← lewat Next.js, tidak ada CORS

async function postToSheet(payload) {
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    console.log("Sync result:", result);
    return result;
  } catch (err) {
    console.warn("Sync gagal:", err);
  }
}

export async function syncKomputerToSheet(data) {
  const rows = data.map((item) => [
    item.idOutlet   || "",
    item.outlet     || "",
    item.ipAddress  || "",
    item.produk     || "",
    item.sn         || "",
    item.tanggalMulai && item.tanggalSelesai
      ? `${item.tanggalMulai} - ${item.tanggalSelesai}`
      : "",
    item.penyedia   || "",
    item.status     || "",
    item.deskripsi  || "",
    item.macAddress || "",
  ]);

  return postToSheet({ action: "sync", sheetName: "Komputer", rows });
}

export async function syncPrinterToSheet(data) {
  const rows = data.map((item) => [
    item.idOutlet   || "",
    item.outlet     || "",
    item.produk     || "",
    item.sn         || "",
    item.tanggalMulai && item.tanggalSelesai
      ? `${item.tanggalMulai} - ${item.tanggalSelesai}`
      : "",
    item.penyedia   || "",
    item.status     || "",
    item.kondisi    || "",
    item.deskripsi  || "",
  ]);

  return postToSheet({ action: "sync", sheetName: "Printer", rows });
}