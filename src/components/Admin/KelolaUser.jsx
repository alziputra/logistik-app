import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2, Edit, X, Eye, EyeOff, Check, UserCheck } from "lucide-react";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import Pagination from "../Common/Pagination";
import { addUser, updateUser, deleteUser, getUsers } from "../../services/userService";

export default function KelolaUser({ usersList = [], handleUpdateRole }) {
  const [dataUsers, setDataUsers] = useState(usersList);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form for Add User
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User", // "Administrator" | "Logistik Officer" | "User"
  });

  // Form for Edit User
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "User",
  });

  useEffect(() => {
    if (usersList && usersList.length > 0) {
      setDataUsers(usersList);
    } else {
      fetchUsers();
    }
  }, [usersList]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (Array.isArray(res) && res.length > 0) {
        setDataUsers(res);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatRoleKey = (roleStr) => {
    if (roleStr === "Administrator") return "admin";
    if (roleStr === "Logistik Officer") return "officer";
    return "user";
  };

  const formatRoleLabel = (roleStr) => {
    const r = (roleStr || "").toLowerCase();
    if (r === "admin" || r === "administrator") return "Administrator";
    if (r === "officer" || r === "logistik officer" || r === "manager") return "Logistik Officer";
    return "User";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    setIsSubmitting(true);
    try {
      const newUserPayload = {
        name: form.name,
        nama: form.name,
        email: form.email,
        role: formatRoleKey(form.role),
      };

      const createdDoc = await addUser(newUserPayload);

      setDataUsers((prev) => [createdDoc, ...prev]);
      setIsModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "User" });
    } catch (err) {
      console.error("Gagal menambah user baru:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (usr) => {
    setEditingUser(usr);
    setEditForm({
      name: usr.name || usr.nama || "",
      email: usr.email || "",
      role: formatRoleLabel(usr.role),
    });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser || !editForm.name || !editForm.email) return;

    setIsSubmitting(true);
    try {
      const updatedRoleKey = formatRoleKey(editForm.role);
      const payload = {
        name: editForm.name,
        nama: editForm.name,
        email: editForm.email,
        role: updatedRoleKey,
      };

      await updateUser(editingUser.id, payload);

      setDataUsers((prev) =>
        prev.map((item) => (item.id === editingUser.id ? { ...item, ...payload } : item))
      );

      if (handleUpdateRole && editingUser.role !== updatedRoleKey) {
        handleUpdateRole(editingUser.id, updatedRoleKey);
      }

      setEditingUser(null);
    } catch (err) {
      console.error("Gagal memperbarui data user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setDataUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch (err) {
      console.error("Gagal menghapus user:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderRoleBadge = (roleStr) => {
    const label = formatRoleLabel(roleStr);
    if (label === "Administrator") {
      return (
        <span className="px-3 py-1 rounded-md text-[10px] font-bold border bg-emerald-950/80 text-emerald-400 border-emerald-800/40">
          Administrator
        </span>
      );
    }
    if (label === "Logistik Officer") {
      return (
        <span className="px-3 py-1 rounded-md text-[10px] font-bold border bg-blue-950/80 text-blue-400 border-blue-800/40">
          Logistik Officer
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-md text-[10px] font-bold border bg-slate-800 text-slate-300 border-slate-700">
        User
      </span>
    );
  };

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

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Tabel Data User */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">NO</th>
                <th className="px-6 py-4">NAMA USER</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">ROLE SAAT INI</th>
                <th className="px-6 py-4 text-center w-36">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dataUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data user terdaftar.
                  </td>
                </tr>
              ) : (
                dataUsers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((usr, idx) => (
                    <tr key={usr.id || idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-400 font-mono">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-slate-100">{usr.name || usr.nama || usr.username || "User"}</td>
                      <td className="px-6 py-4 text-slate-300 font-mono">{usr.email}</td>
                      <td className="px-6 py-4">
                        {renderRoleBadge(usr.role)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Edit User */}
                          <button
                            type="button"
                            onClick={() => openEditModal(usr)}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                            title="Edit Data User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Hapus User */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(usr)}
                            className="p-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(dataUsers.length / itemsPerPage) || 1}
          totalItems={dataUsers.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Form Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-950 p-2.5 rounded-xl border border-emerald-800/40">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Tambah User Pengguna Baru</h3>
                <p className="text-xs text-slate-400">Lengkapi data untuk mendaftarkan akun baru.</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ahmad Dendy"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Sistem <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="user@pegadaian.co.id"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Akun
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role / Hak Akses <span className="text-rose-400">*</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Logistik Officer">Logistik Officer</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Edit User */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-950 p-2.5 rounded-xl border border-blue-800/40">
                <Edit className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Edit Data Pengguna</h3>
                <p className="text-xs text-slate-400">Perbarui informasi pengguna sistem logistik.</p>
              </div>
            </div>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  placeholder="Contoh: Ahmad Dendy"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Sistem <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  placeholder="user@pegadaian.co.id"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role / Hak Akses <span className="text-rose-400">*</span>
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditInputChange}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Logistik Officer">Logistik Officer</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun user "${deleteTarget?.name || deleteTarget?.email || ""}"?`}
      />
    </div>
  );
}
