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
  if (role === 'Super User') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm">
        Super User (Owner / Pembuat)
      </span>
    );
  }
  if (role === 'Super Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDF3EC] dark:bg-[#31584C]/40 text-[#0F766E] dark:text-[#8DD6BB] border border-[#BBE5D7] dark:border-[#0F766E]/20">
        Super Admin (Nasional)
      </span>
    );
  }
  if (role === 'Branch Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
        Branch Admin (Khusus Cabang)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
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

  const handleDelete = async (id, uname, role) => {
    if (uname === 'admin' || role === 'Super User') {
      alert('Akun Super User (Pembuat Sistem) dilindungi dan tidak dapat dihapus.');
      return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${uname}"?`)) return;
    try {
      await deleteUser(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#1D332E] border border-slate-200 dark:border-[#355047] shadow-sm space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F2] flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#0F766E] dark:text-[#8DD6BB]" />
            <span>Kelola Hak Akses & Pengguna (User Management RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#829A8F] mt-0.5">
            Atur pembatasan hak akses per pengguna, aktivasi akun, dan kirim undangan akun resmi ke email via Google SMTP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-cyan-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Undang / Tambah User Baru</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Dialog Panel */}
      {isFormOpen && (
        <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#142522] border border-[#0F766E]/30 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#355047] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F766E] dark:text-[#8DD6BB] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{editingUser ? `Ubah Hak Akses: ${editingUser.username}` : 'Undang / Buat Akun Pengguna Baru'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {!editingUser ? 'Sistem akan otomatis mengirimkan email resmi berisi kredensial dan hak akses ke email bersangkutan.' : 'Perubahan role akan langsung aktif saat pengguna melakukan aksi berikutnya.'}
              </p>
            </div>
            <button type="button" onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2B4840]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingUser && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#B8CCC3] block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: bima_semarang"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#B8CCC3] block mb-1">Alamat Email (Gmail) *</label>
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#B8CCC3] block mb-1">
                {editingUser ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password Masuk *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#B8CCC3] block mb-1">Tingkat Hak Akses (Role RBAC) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-[#0F766E] focus:outline-none"
              >
                <option value="Auditor">Auditor (Akses Terbatas - Hanya Lihat / Read-Only)</option>
                <option value="Branch Admin">Branch Admin (Akses Penuh Khusus 1 Cabang Terikat)</option>
                <option value="Super Admin">Super Admin (Akses Penuh Nasional Seluruh Cabang - Tanpa Akses Kelola User)</option>
                {formData.role === 'Super User' && (
                  <option value="Super User">Super User (Akses Penuh Seluruh Sistem + User Management RBAC)</option>
                )}
              </select>
            </div>

            {formData.role === 'Branch Admin' && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#B8CCC3] block mb-1">Cakupan Cabang Yang Diizinkan *</label>
                <select
                  required
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-[#0F766E] focus:outline-none"
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

            <div className="md:col-span-2 flex justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-[#355047]">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1D332E] dark:hover:bg-[#2B4840] dark:text-[#B8CCC3] text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Memproses...' : editingUser ? 'Simpan Perubahan' : 'Kirim Undangan & Simpan User'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#355047]">
        <table className="w-full text-left text-xs text-slate-700 dark:text-[#B8CCC3]">
          <thead className="bg-slate-50 dark:bg-[#142522] text-slate-600 dark:text-[#829A8F] uppercase font-semibold border-b border-slate-200 dark:border-[#355047]">
            <tr>
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Email Terdaftar</th>
              <th className="py-3 px-4 text-center">Tingkat Akses (Role)</th>
              <th className="py-3 px-4">Cakupan Cabang</th>
              <th className="py-3 px-4 text-center">Status Akun</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#355047] bg-white dark:bg-[#1D332E]">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-[#829A8F]">
                  Tidak ada data pengguna atau sedang memuat...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#2B4840]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#F1F5F2]">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#DDF3EC] dark:bg-[#31584C]/40 border border-[#BBE5D7] dark:border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] dark:text-[#8DD6BB] font-mono font-bold text-xs uppercase">
                        {u.username.charAt(0)}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-[#B8CCC3]">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0F766E] dark:text-[#8DD6BB]">
                    {u.branch ? `${u.branch.name} (${u.branch.code})` : 'Seluruh Indonesia (Nasional)'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.is_verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F766E] dark:hover:text-[#8DD6BB] hover:bg-slate-100 dark:hover:bg-[#2B4840] transition-colors"
                        title="Ubah Hak Akses / Password"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.role === 'Super User' || u.username === 'admin' ? (
                        <span
                          className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-500/20 shrink-0"
                          title="Akun Pembuat Sistem dilindungi secara permanen"
                        >
                          Terproteksi (Owner)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.username, u.role)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#2B4840] transition-colors"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
