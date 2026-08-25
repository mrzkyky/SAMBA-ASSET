import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { createBranch, updateBranch, deleteBranch, getBranches } from '../api';

const BranchManager = ({ branches: initialBranches, onRefresh }) => {
  const [branches, setBranches] = useState(initialBranches || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(data || []);
    } catch (err) {
      console.error('Gagal mengambil data cabang:', err);
    }
  };

  useEffect(() => {
    loadBranches();
    if (onRefresh) onRefresh();
  }, []);

  useEffect(() => {
    if (initialBranches && initialBranches.length > 0) {
      setBranches(initialBranches);
    }
  }, [initialBranches]);

  const handleOpenForm = (branch = null) => {
    setError('');
    if (branch) {
      setEditingBranch(branch);
      setFormData({ code: branch.code, name: branch.name, province: branch.province });
    } else {
      setEditingBranch(null);
      setFormData({ code: '', name: '', province: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBranch(null);
    setFormData({ code: '', name: '', province: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-check for duplicate code
    const duplicate = branches.find(
      (b) => b.code.toLowerCase() === formData.code.trim().toLowerCase() && (!editingBranch || b.id !== editingBranch.id)
    );
    if (duplicate) {
      setError(`Kode cabang "${formData.code}" sudah digunakan oleh ${duplicate.name}. Gunakan kode lain.`);
      setLoading(false);
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, formData);
      } else {
        await createBranch(formData);
      }
      await loadBranches();
      if (onRefresh) onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan cabang. Pastikan kode cabang unik.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus cabang ini? Semua site dan aset di bawahnya akan terhapus.')) return;
    try {
      await deleteBranch(id);
      await loadBranches();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus cabang.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Kelola Cabang Daerah (Level 1)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tambah, edit, atau hapus data cabang nasional.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadBranches}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Cabang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenForm(null)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang</span>
          </button>
        </div>
      </div>

      {/* Form Editor Panel (Rendered on TOP) */}
      {isFormOpen && (
        <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-cyan-400">
              {editingBranch ? `Edit Cabang: ${editingBranch.name}` : 'Tambah Cabang Daerah Baru'}
            </h3>
            <button type="button" onClick={handleCloseForm} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Kode Cabang * (misal: BR-BDG)</label>
              <input
                type="text"
                required
                placeholder="misal: BR-BDG"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Cabang *</label>
              <input
                type="text"
                required
                placeholder="misal: Branch Bandung"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Provinsi *</label>
              <input
                type="text"
                required
                placeholder="misal: Jawa Barat"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                {loading ? 'Menyimpan...' : 'Simpan Cabang'}
              </button>
            </div>
          </form>
        </div>
      )}

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
            {branches.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  Belum ada data cabang. Klik "+ Tambah Cabang" untuk membuat cabang baru.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
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
                        type="button"
                        onClick={() => handleOpenForm(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 active:scale-95"
                        title="Edit Cabang"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95"
                        title="Hapus Cabang"
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
    </div>
  );
};

export default BranchManager;
