import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, Lock, Mail, LogIn, AlertCircle, Sun, Moon, ShieldAlert, User, UserPlus, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ServerStatusPill from "../components/Notification/ServerStatusPill";

const sanitizeFrontendError = (msg) => {
  if (!msg || typeof msg !== "string") return "Gagal terhubung ke server database.";
  if (msg.includes("supabase") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("getaddrinfo") || msg.includes("Sequelize")) {
    return "Gagal terhubung ke Server Database Logistik. Silakan periksa jaringan koneksi Anda atau hubungi Administrator.";
  }
  return msg;
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Status & Feedback States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSessionTimeout = searchParams.get("reason") === "session_timeout";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setErrorMsg(sanitizeFrontendError(result.message) || "Login gagal, periksa email dan password Anda");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(`Pendaftaran akun "${regName}" berhasil! Anda terdaftar dengan Role: USER. Mengalihkan ke sistem...`);
      // Auto login setelah register berhasil
      setTimeout(async () => {
        const autoLog = await login(regEmail, regPassword);
        if (autoLog.success) {
          navigate("/dashboard", { replace: true });
        } else {
          setActiveTab("login");
          setEmail(regEmail);
          setPassword("");
        }
      }, 1200);
    } else {
      setErrorMsg(result.message || "Gagal melakukan registrasi.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Decorators */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Right Controls (Server Status Pill + Theme Toggle) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <ServerStatusPill />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          className={`px-3.5 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold ${
            theme === "dark" ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
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
        <div className="text-center mb-6">
          <div className="inline-flex bg-linear-to-tr from-emerald-600 to-teal-500 p-3.5 rounded-2xl mb-3 shadow-xl shadow-emerald-600/20 ring-1 ring-emerald-400/30">
            <Package className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Logistik Pegadaian</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Sistem Informasi Manajemen Aset & Logistik</p>
        </div>

        {/* Kartu Form */}
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md py-7 px-6 shadow-xl dark:shadow-2xl dark:shadow-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl sm:px-8 transition-colors">
          {/* Tabs Switcher: Masuk vs Daftar Akun */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "login"
                  ? "bg-white dark:bg-slate-900 text-[#00753A] dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "register"
                  ? "bg-white dark:bg-slate-900 text-[#00753A] dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {isSessionTimeout && !errorMsg && !successMsg && (
            <div className="mb-5 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/60 p-3.5 rounded-2xl shadow-xs animate-in fade-in duration-300">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sesi Berakhir</p>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">Demi keamanan, Anda telah dikeluarkan otomatis karena tidak ada aktivitas. Silakan masuk kembali.</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/50 p-3.5 rounded-2xl animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 p-3.5 rounded-2xl animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: FORM LOGIN */}
          {activeTab === "login" && (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Email</label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A] transition-colors"
                    placeholder="nama@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Password</label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 ${errorMsg && errorMsg.includes("Password") ? "text-rose-500" : "text-slate-400"}`} />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors ${
                      errorMsg && errorMsg.includes("Password")
                        ? "border-2 border-rose-500 ring-2 ring-rose-500/20"
                        : "border border-slate-300 dark:border-slate-700/80 focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A]"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorMsg && errorMsg.includes("Password") && (
                  <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    Periksa kembali huruf besar/kecil (Caps Lock) atau spasi. Pastikan sesuai dengan password sementara dari Admin.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-[#00753A]/20 text-xs font-bold text-white bg-[#00753A] hover:bg-[#006030] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00753A] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: FORM REGISTER (DAFTAR AKUN BARU) */}
          {activeTab === "register" && (
            <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Nama Lengkap *</label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A] transition-colors"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Alamat Email *</label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A] transition-colors"
                    placeholder="budi@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Password *</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A] transition-colors"
                      placeholder="Min. 6 digit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Ulangi Password *</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00753A]/20 focus:border-[#00753A] transition-colors"
                      placeholder="Ulangi sandi"
                    />
                  </div>
                </div>
              </div>

              {/* Info Hak Akses User Baru */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-[11px] text-slate-700 dark:text-emerald-300 leading-relaxed">
                <span className="font-bold text-[#00753A] dark:text-emerald-400">Hak Akses: USER</span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  Akun yang baru terdaftar memiliki izin kelola operasional pada menu <strong>Manajemen Aset IT & Sewa</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-[#00753A]/20 text-xs font-bold text-white bg-[#00753A] hover:bg-[#006030] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00753A] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Sekarang</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

