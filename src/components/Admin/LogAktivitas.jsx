import React, { useState, useMemo } from "react";
import { Activity, Clock, Search, Filter, User, LogIn, LogOut, Plus, Edit3, Trash2, FileCheck, Package, Building2, Shield, ShieldCheck, Laptop, CheckCircle2, Calendar } from "lucide-react";
import Pagination from "../Common/Pagination";

export default function LogAktivitas({ logs = [], currentUser = null, usersList = [], transactions = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAksi, setFilterAksi] = useState("ALL");
  const [filterModul, setFilterModul] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Resolusi Identitas Pengguna yang Login & Melakukan Aksi
  const resolveUser = (log) => {
    // 1. Email dari log
    const email = log.user_email || log.userEmail || log.email || (log.user && log.user.includes("@") ? log.user : "") || (log.username && log.username.includes("@") ? log.username : "");

    // 2. Nama langsung jika ada dan bukan literal "System"
    const directName = log.user_name || log.userName || log.nama || log.name;
    if (directName && directName.toLowerCase() !== "system") {
      return {
        name: directName,
        email: email || (directName.includes("Alzi") ? "admin@logistik.com" : directName.includes("Dio") ? "officer@gmail.com" : ""),
        avatar: directName.charAt(0).toUpperCase(),
      };
    }

    // 3. Cari berdasarkan email di master usersList atau mapping akun resmi
    if (email) {
      const found = (usersList || []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found?.name || found?.nama) {
        const n = found.name || found.nama;
        return { name: n, email, avatar: n.charAt(0).toUpperCase() };
      }
      const e = email.toLowerCase();
      if (e === "admin@logistik.com" || e === "admin@logistik.co.id" || e.includes("admin")) {
        return { name: "Alzi Rahmana Putra", email, avatar: "A" };
      }
      if (e === "officer@gmail.com" || e.includes("officer") || e.includes("dio")) {
        return { name: "Dio Haris Kurniawan", email, avatar: "D" };
      }
      const part = email.split("@")[0];
      const nameFromEmail = part.charAt(0).toUpperCase() + part.slice(1);
      return { name: nameFromEmail, email, avatar: nameFromEmail.charAt(0).toUpperCase() };
    }

    // 4. Jika log.user ada dan bukan "System"
    if (log.user && log.user.toLowerCase() !== "system") {
      return { name: log.user, email: "", avatar: log.user.charAt(0).toUpperCase() };
    }

    // 5. Cek apakah ada nomor transaksi di keterangan log untuk menarik nama pembuat surat
    if (log.keterangan && Array.isArray(transactions) && transactions.length > 0) {
      const match = log.keterangan.match(/No:\s*([^\s,]+)/i);
      if (match && match[1]) {
        const noSurat = match[1].trim();
        const foundTrx = transactions.find((t) => (t.nomorSurat || "").trim() === noSurat);
        if (foundTrx) {
          const trxUser = foundTrx.pengirimNama || foundTrx.pihak1Nama || foundTrx.creator || foundTrx.user;
          if (trxUser && trxUser.toLowerCase() !== "system") {
            return {
              name: trxUser,
              email: foundTrx.user_email || (trxUser.includes("Alzi") ? "admin@logistik.com" : "officer@gmail.com"),
              avatar: trxUser.charAt(0).toUpperCase(),
            };
          }
        }
      }
    }

    // 6. Fallback ke user yang sedang login saat ini di sistem
    if (currentUser?.name && currentUser.name.toLowerCase() !== "system") {
      return {
        name: currentUser.name,
        email: currentUser.email || "",
        avatar: currentUser.name.charAt(0).toUpperCase(),
      };
    }
    if (currentUser?.email) {
      const e = currentUser.email.toLowerCase();
      if (e.includes("admin")) return { name: "Alzi Rahmana Putra", email: currentUser.email, avatar: "A" };
      if (e.includes("officer")) return { name: "Dio Haris Kurniawan", email: currentUser.email, avatar: "D" };
      const part = currentUser.email.split("@")[0];
      const nameStr = part.charAt(0).toUpperCase() + part.slice(1);
      return { name: nameStr, email: currentUser.email, avatar: nameStr.charAt(0).toUpperCase() };
    }

    return { name: "Alzi Rahmana Putra", email: "admin@logistik.com", avatar: "A" };
  };

  // Format Waktu Indonesia Ramah Pembaca
  const formatTimestamp = (raw) => {
    if (!raw) return { date: "-", time: "-", full: "-" };
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return { date: String(raw), time: "", full: String(raw) };

      const dateStr = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const timeStr =
        d.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB";

      return { date: dateStr, time: timeStr, full: `${dateStr} • ${timeStr}` };
    } catch {
      return { date: String(raw), time: "", full: String(raw) };
    }
  };

  // Filter & Search Log
  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log) => {
      const userObj = resolveUser(log);
      const timeObj = formatTimestamp(log.timestamp || log.created_at || log.createdAt);
      const q = searchQuery.toLowerCase();

      const matchSearch =
        !q ||
        userObj.name.toLowerCase().includes(q) ||
        userObj.email.toLowerCase().includes(q) ||
        (log.aksi || "").toLowerCase().includes(q) ||
        (log.modul || "").toLowerCase().includes(q) ||
        (log.keterangan || "").toLowerCase().includes(q) ||
        timeObj.full.toLowerCase().includes(q);

      const aksi = (log.aksi || log.action || "").toUpperCase();
      const matchAksi =
        filterAksi === "ALL" ||
        (filterAksi === "BUAT" && (aksi === "BUAT" || aksi === "TAMBAH")) ||
        (filterAksi === "EDIT" && (aksi === "EDIT" || aksi === "UBAH")) ||
        (filterAksi === "HAPUS" && aksi === "HAPUS") ||
        (filterAksi === "LOGIN" && (aksi === "LOGIN" || aksi === "MASUK")) ||
        (filterAksi === "LOGOUT" && (aksi === "LOGOUT" || aksi === "KELUAR"));

      const modul = (log.modul || log.module || "").toUpperCase();
      const matchModul = filterModul === "ALL" || modul.includes(filterModul);

      return matchSearch && matchAksi && matchModul;
    });
  }, [logs, searchQuery, filterAksi, filterModul, currentUser, usersList, transactions]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Badge Aksi Styling
  const renderAksiBadge = (aksiRaw = "") => {
    const a = (aksiRaw || "LOG").toUpperCase();
    if (a === "BUAT" || a === "TAMBAH") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
          <Plus className="w-3 h-3" />
          <span>BUAT</span>
        </span>
      );
    }
    if (a === "EDIT" || a === "UBAH") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shadow-2xs">
          <Edit3 className="w-3 h-3" />
          <span>EDIT</span>
        </span>
      );
    }
    if (a === "HAPUS") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-2xs">
          <Trash2 className="w-3 h-3" />
          <span>HAPUS</span>
        </span>
      );
    }
    if (a === "LOGIN" || a === "MASUK") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 shadow-2xs">
          <LogIn className="w-3 h-3" />
          <span>LOGIN</span>
        </span>
      );
    }
    if (a === "LOGOUT" || a === "KELUAR") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-2xs">
          <LogOut className="w-3 h-3" />
          <span>LOGOUT</span>
        </span>
      );
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">{a}</span>;
  };

  // Badge Modul Styling & Ikon
  const renderModulBadge = (modulRaw = "") => {
    const m = (modulRaw || "UMUM").toUpperCase();
    let Icon = Activity;
    let colorCls = "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";

    if (m.includes("TRANSAKSI") || m.includes("SURAT")) {
      Icon = FileCheck;
      colorCls = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (m.includes("AUTENTIKASI") || m.includes("LOGIN") || m.includes("AUTH")) {
      Icon = ShieldCheck;
      colorCls = "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20";
    } else if (m.includes("BARANG") || m.includes("INVENTARIS")) {
      Icon = Package;
      colorCls = "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (m.includes("OUTLET") || m.includes("INSTANSI")) {
      Icon = Building2;
      colorCls = "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    } else if (m.includes("PERANGKAT") || m.includes("KOMPUTER") || m.includes("PRINTER") || m.includes("LAPTOP")) {
      Icon = Laptop;
      colorCls = "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${colorCls}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{m}</span>
      </div>
    );
  };

  // Statistik Ringkas
  const totalTransaksiCount = logs.filter((l) => (l.modul || "").toUpperCase().includes("TRANSAKSI")).length;
  const totalLoginCount = logs.filter((l) => (l.aksi || "").toUpperCase().includes("LOGIN") || (l.modul || "").toUpperCase().includes("AUTENTIKASI")).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300 space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#00753A] p-2.5 rounded-2xl text-white shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Log Aktivitas Sistem</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Riwayat audit jejak aktivitas pengguna, transaksi surat, dan autentikasi login secara transparan.</p>
          </div>
        </div>

        {/* Current Active User Status Pill */}
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">User Login:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name || currentUser.email}</span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Aktivitas</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{logs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Aktivitas Transaksi</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{totalTransaksiCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Sesi Login / Auth</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">{totalLoginCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Data Terfilter</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">{filteredLogs.length}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search and Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari user, nomor surat, aksi, atau keterangan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00753A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Aksi */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Aksi:</span>
              <select
                value={filterAksi}
                onChange={(e) => {
                  setFilterAksi(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#00753A]"
              >
                <option value="ALL">Semua Aksi</option>
                <option value="BUAT">Buat / Tambah</option>
                <option value="EDIT">Ubah / Edit</option>
                <option value="HAPUS">Hapus</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            {/* Filter Modul */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Modul:</span>
              <select
                value={filterModul}
                onChange={(e) => {
                  setFilterModul(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#00753A]"
              >
                <option value="ALL">Semua Modul</option>
                <option value="TRANSAKSI">Transaksi BAST</option>
                <option value="AUTENTIKASI">Autentikasi User</option>
                <option value="BARANG">Master Barang</option>
                <option value="INSTANSI">Master Instansi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5 w-44">Waktu (WIB)</th>
                <th className="px-5 py-3.5 w-56">User Pelaku</th>
                <th className="px-5 py-3.5 w-40">Modul</th>
                <th className="px-5 py-3.5 w-28 text-center">Aksi</th>
                <th className="px-5 py-3.5">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada log aktivitas yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const userObj = resolveUser(log);
                  const timeObj = formatTimestamp(log.timestamp || log.created_at || log.createdAt);

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* WAKTU: Format Tanggal & Jam WIB Bersih */}
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{timeObj.date}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{timeObj.time}</p>
                          </div>
                        </div>
                      </td>

                      {/* USER: Menampilkan Nama & Email Pengguna yang Login */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#00753A]/10 text-[#00753A] dark:text-emerald-400 border border-[#00753A]/20 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">{userObj.avatar}</div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{userObj.name}</p>
                            {userObj.email && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono mt-0.5">{userObj.email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* MODUL */}
                      <td className="px-5 py-3.5">{renderModulBadge(log.modul || log.module)}</td>

                      {/* AKSI */}
                      <td className="px-5 py-3.5 text-center">{renderAksiBadge(log.aksi || log.action)}</td>

                      {/* KETERANGAN */}
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{log.keterangan || log.details || "-"}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredLogs.length} startIndex={startIndex} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
