import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Key } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../api';

const RoleBadge = ({ role }) => {
  if (role === 'Super Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        Super Admin
      </span>
    );
  }
  if (role === 'Branch Admin') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
        Branch Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
      Auditor (Read-Only)
    </span>
  );
};

const UserManager = ({ users, branches, onRefresh }) => {
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

  const handleOpenModal = (u = null) => {
    setError('');
    if (u) {
      setEditingUser(u);
      setFormData({
        username: u.username,
        email: u.email,
        password: '', // Blank unless changing
        role: u.role,
        branch_id: u.branch_id ? String(u.branch_id) : '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'Auditor',
        branch_id: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        branch_id: formData.branch_id ? parseInt(formData.branch_id, 10) : null,
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload);
      }

      onRefresh();
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'Auditor', branch_id: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      await deleteUser(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Kelola Hak Akses & Pengguna (User Management)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tambah pengguna baru, atur peran RBAC (Super Admin, Branch Admin, Auditor), dan penugasan cabang.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-center">Peran (Role RBAC)</th>
              <th className="py-3 px-4">Cabang Terikat</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                  <span>{u.username}</span>
                </td>
                <td className="py-3 px-4 text-slate-400">{u.email}</td>
                <td className="py-3 px-4 text-center">
                  <RoleBadge role={u.role} />
                </td>
                <td className="py-3 px-4 font-semibold text-cyan-400">
                  {u.branch ? `${u.branch.name} (${u.branch.code})` : 'Seluruh Indonesia (Nasional)'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                      title="Edit User"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Hapus User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Panel */}
      {(editingUser !== null || formData.username !== '') && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400">
            {editingUser ? `Edit Pengguna: ${editingUser.username}` : 'Tambah Pengguna Sistem Baru'}
          </h3>
          {error && <p className="text-xs text-rose-400">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {!editingUser && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Peran (Role RBAC) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Super Admin">Super Admin (Nasional)</option>
                <option value="Branch Admin">Branch Admin (Khusus Cabang)</option>
                <option value="Auditor">Auditor (Read-Only)</option>
              </select>
            </div>

            {formData.role === 'Branch Admin' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Penugasan Cabang *</label>
                <select
                  required
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({ username: '', email: '', password: '', role: 'Auditor', branch_id: '' });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                {loading ? 'Menyimpan...' : 'Simpan User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;
