#!/usr/bin/env node
/**
 * Database Seeder CLI untuk LogistikKu
 * Dijalankan dengan perintah: npm run seed
 * Membaca konfigurasi Firestore dari file .env (acuan .env.example)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { SEED_CATALOG } from "./seedCatalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

console.log("\n==================================================================");
console.log(" 🚀 LogistikKu - Firestore Database Seeder CLI");
console.log("==================================================================");

// 1. Validasi keberadaan file .env
if (!fs.existsSync(envPath)) {
  console.error("\n❌ ERROR: File .env tidak ditemukan!");
  console.error("Untuk pengguna baru, silakan salin .env.example menjadi .env:");
  console.error("  cp .env.example .env");
  console.error("Kemudian isi variabel konfigurasi dengan project Firebase Firestore Anda.\n");
  process.exit(1);
}

// 2. Baca dan parse isi file .env
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const apiKey = envVars.VITE_FIREBASE_API_KEY;
const projectId = envVars.VITE_FIREBASE_PROJECT_ID;

// 3. Validasi isi kredensial bukan placeholder
if (!apiKey || apiKey === "your_api_key" || !projectId || projectId === "your_project_id") {
  console.error("\n❌ ERROR: Konfigurasi Firebase di file .env belum valid!");
  console.error("Nilai masih menggunakan placeholder default dari .env.example.");
  console.error("Silakan buka file .env dan isi kredensial Firestore dari Firebase Console Anda.\n");
  process.exit(1);
}

console.log(`\n📡 Menghubungkan ke Firebase Project: [${projectId}]...`);

// 4. Inisialisasi Firebase SDK
const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
  measurementId: envVars.VITE_FIREBASE_MEASUREMENT_ID,
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log(" Connected ke Firestore SDK.");
} catch (err) {
  console.error("❌ Gagal menginisialisasi Firebase:", err.message);
  process.exit(1);
}

// 5. Eksekusi Seeding ke seluruh koleksi
async function runSeeder() {
  console.log("\n📦 Memulai proses seeding data katalog ke Firestore...\n");

  let totalCollections = 0;
  let totalDocs = 0;

  for (const group of SEED_CATALOG) {
    const items = group.items || [];
    const paths = group.paths || [];

    for (const pathStr of paths) {
      totalCollections++;
      process.stdout.write(`  ➜ Seeding ${pathStr} (${items.length} dokumen)... `);

      try {
        for (const item of items) {
          const { id, ...itemData } = item;
          const docId = String(id || `item_${Date.now()}`);
          const docRef = doc(db, pathStr, docId);
          await setDoc(
            docRef,
            {
              ...itemData,
              updated_at: new Date().toISOString(),
            },
            { merge: true },
          );
          totalDocs++;
        }
        console.log("BERHASIL ✓");
      } catch (err) {
        console.log("GAGAL ✕");
        console.error(`    ⚠️ Error detail pada ${pathStr}:`, err.message);
      }
    }
  }

  console.log("\n==================================================================");
  console.log(" 🎉 SEEDING FIRESTORE SELESAI DENGAN SUKSES!");
  console.log("==================================================================");
  console.log(` Target Project Firestore : ${projectId}`);
  console.log(` Total Koleksi Di-Seed    : ${totalCollections}`);
  console.log(` Total Dokumen Di-Seed    : ${totalDocs}`);
  console.log("------------------------------------------------------------------");
  console.log(" Langkah Selanjutnya:");
  console.log(" 1. Jalankan development server aplikasi:");
  console.log("    npm run dev");
  console.log(" 2. Buka di browser (http://localhost:5173)");
  console.log(" 3. Masuk dengan akun siap pakai (Demo Authentication):");
  console.log("    • Administrator : admin@logistik.com (atau admin@logistik.co.id)");
  console.log("    • Officer       : officer@gmail.com  (atau user@logistik.co.id)");
  console.log("    • Password      : Bebas (demo fallback aktif)");
  console.log("==================================================================\n");

  process.exit(0);
}

runSeeder().catch((err) => {
  console.error("\n❌ Terjadi kesalahan fatal saat seeding:", err);
  process.exit(1);
});
