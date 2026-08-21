import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, LogIn, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ServerStatusPill from '../components/Notification/ServerStatusPill';

const sanitizeFrontendError = (msg) => {
  if (!msg || typeof msg !== "string") return "Gagal terhubung ke server database.";
  if (
    msg.includes("supabase") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("getaddrinfo") ||
    msg.includes("Sequelize")
  ) {
    return "Gagal terhubung ke Server Database Logistik. Silakan periksa jaringan koneksi Anda atau hubungi Administrator.";
  }
  return msg;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMsg(sanitizeFrontendError(result.message) || 'Login gagal, periksa email dan password Anda');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Decorators */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Right Controls (Server Status Pill + Theme Toggle) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Server Status Pill (matches user request) */}
        <ServerStatusPill />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          className={`px-3.5 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold ${
            theme === "dark"
              ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* Konten Utama */}
      <div className="relative z-10 w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-emerald-600 to-teal-500 p-4 rounded-3xl mb-4 shadow-xl shadow-emerald-600/20 ring-1 ring-emerald-400/30">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Logistik Pegadaian
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
            Sistem Informasi Manajemen Aset & Logistik
          </p>
        </div>

        {/* Kartu Form */}
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md py-8 px-6 shadow-xl dark:shadow-2xl dark:shadow-slate-950/80 border border-slate-200 dark:border-slate-800 sm:rounded-3xl sm:px-10 transition-colors">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/50 p-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Email
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Password
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
