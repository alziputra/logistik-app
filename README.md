# 📦 LogistikKu — Sistem Manajemen Logistik & Inventaris

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)  
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**LogistikKu** adalah aplikasi web berbasis dashboard untuk memantau, mencatat, dan mengelola aset logistik secara efisien.  
Aplikasi ini tidak hanya melacak arus barang masuk/keluar, tetapi juga menyediakan fitur pemantauan masa sewa perangkat (_hardware_) secara real-time.

---

## 📸 Tampilan Aplikasi

![Dashboard LogistikKu](./public/dashboard.png)
Atau ingin melihat langsung versi live?  
👉 Kunjungi: https://logistik-app-sigma.vercel.app/

### 🔐 Demo Akun
Gunakan akun berikut untuk mencoba aplikasi:

- **Email:** user@logistik.co.id  
- **Password:** user12345
---

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif**  
    Ringkasan transaksi barang masuk dan keluar pada bulan berjalan.
- 🖨️ **Manajemen Masa Sewa Perangkat**  
    Monitoring status perangkat (Sewa Berjalan, Sewa Habis, Inventaris).
- ⚠️ **Notifikasi Otomatis**  
    Peringatan untuk perangkat dengan masa sewa < 3 bulan.
- 📦 **Visualisasi Stok**  
    Grafik dinamis untuk memantau ketersediaan barang.
- 📝 **Log Aktivitas**  
    Menampilkan aktivitas transaksi terbaru secara real-time.
- 📑 **Export Laporan**  
    Unduh data transaksi dalam format Excel/CSV.

---

## 🚀 Getting Started

Proyek ini menggunakan:

- [Next.js](https://nextjs.org/)
- Firebase (Authentication & Database)

---

## 📋 Persyaratan

Pastikan Anda telah menginstal:

- Node.js ≥ 18.x
- Package Manager (npm / yarn / pnpm / bun)
- Akun Firebase

---

## ⚙️ Instalasi

Clone repository dan install dependencies:

git clone https://github.com/alziputra/logistik-app.git  
cd logistik-app  
npm install

---

## 🔐 Konfigurasi Environment

Buat file `.env.local` di root project, lalu isi dengan konfigurasi Firebase:

# Firebase Config  
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key  
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id  
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com  
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id  
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id  
  
# App Config  
NEXT_PUBLIC_APP_ID=logistikku_app_01

> ⚠️ **Penting:**  
> Jangan pernah commit file `.env.local` ke repository publik.

---

## ▶️ Menjalankan Aplikasi

Jalankan development server:

npm run dev

Buka di browser:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 📚 Dokumentasi

Pelajari lebih lanjut teknologi yang digunakan:

- Next.js → [https://nextjs.org/docs](https://nextjs.org/docs)
- Tailwind CSS → [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- Firebase → [https://firebase.google.com/docs](https://firebase.google.com/docs)

---

## ☁️ Deployment

Deploy dengan mudah menggunakan **Vercel**:

1. Import repository ke Vercel
2. Tambahkan environment variables dari `.env.local`
3. Deploy

📖 Detail: [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## 👨‍💻 Author

Dikembangkan oleh **Alzi Rahmana Putra**