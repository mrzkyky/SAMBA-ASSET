import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../api';

const CategoryManager = ({ categories, user, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenForm = (cat = null) => {
    setError('');
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan kategori. Pastikan nama kategori unik.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus kategori. Pastikan tidak ada aset terkait.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span>Kelola Kategori Perangkat (Level 3)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tambah, edit, atau hapus kategori perangkat IT.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Form Editor Panel (Rendered on TOP) */}
      {isFormOpen && (
        <div className="p-5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-purple-400">
              {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Perangkat Baru'}
            </h3>
            <button type="button" onClick={handleCloseForm} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              placeholder="Nama Kategori (misal: Firewall)"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
            <div className="flex items-center space-x-2 self-end sm:self-auto">
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
                className="px-4 py-2 rounded-lg bg-purple-500 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 active:scale-95"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">ID Kategori</th>
              <th className="py-3 px-4">Nama Kategori Perangkat</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-500 font-mono">#{c.id}</td>
                <td className="py-3 px-4 font-bold text-white">
                  <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {c.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenForm(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 active:scale-95"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95"
                      title="Hapus Kategori"
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
    </div>
  );
};

export default CategoryManager;
