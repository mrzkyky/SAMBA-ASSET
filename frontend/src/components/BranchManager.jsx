import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { createBranch, updateBranch, deleteBranch } from '../api';

const BranchManager = ({ branches, onRefresh }) => {
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = (branch = null) => {
    setError('');
    if (branch) {
      setEditingBranch(branch);
      setFormData({ code: branch.code, name: branch.name, province: branch.province });
    } else {
      setEditingBranch(null);
      setFormData({ code: '', name: '', province: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, formData);
      } else {
        await createBranch(formData);
      }
      onRefresh();
      setEditingBranch(null);
      setFormData({ code: '', name: '', province: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus cabang ini? Semua site dan aset terkait akan terhapus.')) return;
    try {
      await deleteBranch(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus cabang');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Kelola Cabang Daerah (Level 1)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tambah, edit, atau hapus data cabang nasional.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Cabang</span>
        </button>
      </div>

      {/* Branch Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Kode Cabang</th>
              <th className="py-3 px-4">Nama Cabang</th>
              <th className="py-3 px-4">Provinsi</th>
              <th className="py-3 px-4 text-center">Jumlah Site</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {branches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-cyan-400">{b.code}</td>
                <td className="py-3 px-4 font-semibold text-white">{b.name}</td>
                <td className="py-3 px-4 text-slate-400">{b.province}</td>
                <td className="py-3 px-4 text-center font-bold text-slate-300">
                  {b.sites ? b.sites.length : 0}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenModal(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
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

      {/* Form Modal / Inline Editor */}
      {(editingBranch !== null || formData.code !== '') && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400">
            {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
          </h3>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Kode Cabang (misal: BR-BRB)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Cabang</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Provinsi</label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => { setEditingBranch(null); setFormData({ code: '', name: '', province: '' }); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                {loading ? 'Menyimpan...' : 'Simpan Cabang'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BranchManager;
