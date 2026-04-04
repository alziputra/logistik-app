"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Package, Lock, Mail, LogIn } from "lucide-react";

export default function LoginView({ showNotif }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotif("Login berhasil! Selamat datang.", "success");
    } catch (error) {
      console.error(error);
      showNotif("Login gagal. Periksa kembali email & password Anda.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-gray-50">
      
      {/* 1. KUNCI NYA DISINI: Background Image dengan Opacity Rendah & Blur Tinggi */}
      <div 
        className="absolute inset-0 z-0 scale-110" // scale agar pinggiran blur tidak putih
        style={{
          backgroundImage: "url('/Jakoneberjaya.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15, // Opacity sangat rendah agar tidak mencolok
          filter: "blur(20px)" // Blur tinggi untuk menyamarkan detail foto
        }}
      ></div>

      {/* Konten Utama */}
      <div className="relative z-10 w-full sm:max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex bg-blue-600 p-3.5 rounded-3xl mb-4 shadow-lg shadow-blue-200">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            LogistikKu
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Sistem Informasi Manajemen Barang
          </p>
        </div>

        {/* Kartu Form: Sangat bersih, putih, dengan shadow lembut */}
        <div className="bg-white/90 backdrop-blur-sm py-10 px-6 shadow-2xl shadow-gray-200/70 border border-gray-100 sm:rounded-3xl sm:px-12">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Masuk ke Sistem
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} Alzi Rahmana Putra. All rights reserved.
        </p>
      </div>
    </div>
  );
}