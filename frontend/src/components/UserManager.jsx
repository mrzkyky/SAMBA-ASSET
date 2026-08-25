import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../api';

const RoleBadge = ({ role }) => {
  if (role === 'Super Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        Super Admin (Nasional)
      </span>
    );
  }
  if (role === 'Branch Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
        Branch Admin (Khusus Cabang)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
      Auditor (Read-Only)
    </span>
  );
};

const UserManager = ({ users = [], branches = [], onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Auditor',
    branch_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenForm = (u = null) => {
    setError('');
    setSuccessMessage('');
    if (u) {
      setEditingUser(u);
      setFormData({
        username: u.username,
        email: u.email,
        password: '',
        role: u.role,
        branch_id: u.branch_id ? String(u.branch_id) : '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'Branch Admin',
        branch_id: branches.length > 0 ? String(branches[0].id) : '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'Auditor', branch_id: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        branch_id: formData.role === 'Branch Admin' && formData.branch_id ? parseInt(formData.branch_id, 10) : null,
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        setSuccessMessage(`Hak akses pengguna ${editingUser.username} berhasil diperbarui.`);
      } else {
        const res = await createUser(payload);
        setSuccessMessage(res.message || `Pengguna baru berhasil dibuat dan email resmi telah dikirim ke ${formData.email}.`);
      }

      onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, uname) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${uname}"?`)) return;
    try {
      await deleteUser(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Kelola Hak Akses & Pengguna (User Management RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur pembatasan hak akses per pengguna, aktivasi akun, dan kirim undangan akun resmi ke email via Google SMTP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Undang / Tambah User Baru</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Dialog Panel (Rendered on TOP) */}
      {isFormOpen && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{editingUser ? `Ubah Hak Akses: ${editingUser.username}` : 'Undang / Buat Akun Pengguna Baru'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {!editingUser ? 'Sistem akan otomatis mengirimkan email resmi berisi kredensial dan hak akses ke email bersangkutan.' : 'Perubahan role akan langsung aktif saat pengguna melakukan aksi berikutnya.'}
              </p>
            </div>
            <button type="button" onClick={handleCloseForm} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingUser && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: bima_semarang"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Email (Gmail) *</label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {editingUser ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password Masuk *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tingkat Hak Akses (Role RBAC) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Auditor">Auditor (Akses Terbatas - Hanya Lihat / Read-Only)</option>
                <option value="Branch Admin">Branch Admin (Akses Penuh Khusus 1 Cabang Terikat)</option>
                <option value="Super Admin">Super Admin (Akses Penuh Nasional Seluruh Cabang & User)</option>
              </select>
            </div>

            {formData.role === 'Branch Admin' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cakupan Cabang Yang Diizinkan *</label>
                <select
                  required
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Branch Admin hanya dapat melihat dan mengelola aset pada cabang ini.</p>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Memproses...' : editingUser ? 'Simpan Perubahan' : 'Kirim Undangan & Simpan User'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Email Terdaftar</th>
              <th className="py-3 px-4 text-center">Tingkat Akses (Role)</th>
              <th className="py-3 px-4">Cakupan Cabang</th>
              <th className="py-3 px-4 text-center">Status Akun</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  Tidak ada data pengguna atau sedang memuat...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs uppercase">
                        {u.username.charAt(0)}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 px-4 font-semibold text-cyan-400">
                    {u.branch ? `${u.branch.name} (${u.branch.code})` : 'Seluruh Indonesia (Nasional)'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.is_verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        Menunggu OTP
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenForm(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Ubah Hak Akses / Password"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.username)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Hapus Akun Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
