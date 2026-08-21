import React from "react";
import { Users, Shield, UserCheck } from "lucide-react";
import ExcelActionButtons from "../Common/ExcelActionButtons";

export default function KelolaUser({ usersList = [], handleUpdateRole = () => {} }) {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Kelola Pengguna & Hak Akses</h2>
            <p className="text-xs text-slate-400">Atur hak akses akun pengguna sistem logistik.</p>
          </div>
        </div>

        <ExcelActionButtons
          data={usersList}
          fileName="Daftar_Pengguna_System"
          headersMap={{
            name: "Nama Pengguna",
            email: "Email",
            role: "Role",
          }}
          showImport={false}
        />
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role Saat Ini</th>
                <th className="px-6 py-4 text-center">Aksi Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data user terdaftar.
                  </td>
                </tr>
              ) : (
                usersList.map((usr, idx) => (
                  <tr key={usr.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{usr.name || usr.username || "User"}</td>
                    <td className="px-6 py-4 text-slate-300 font-mono">{usr.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${usr.role === "admin" ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/40" : "bg-slate-800 text-slate-300 border-slate-700"}`}>
                        {usr.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleUpdateRole(usr.id, usr.role === "admin" ? "user" : "admin")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Ubah ke {usr.role === "admin" ? "User" : "Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
