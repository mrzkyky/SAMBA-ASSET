import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../api';

const CategoryManager = ({ categories, onRefresh }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = (cat = null) => {
    setError('');
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
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
      setEditingCategory(null);
      setFormData({ name: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
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
      alert('Gagal menghapus kategori. Pastikan tidak ada aset terkait.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <span>Kelola Kategori Perangkat (Level 3)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tambah, edit, atau hapus kategori perangkat IT.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

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
                      onClick={() => handleOpenModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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

      {(editingCategory !== null || formData.name !== '') && (
        <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-4">
          <h3 className="text-sm font-bold text-purple-400">
            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h3>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              required
              placeholder="Nama Kategori (misal: Firewall)"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => { setEditingCategory(null); setFormData({ name: '' }); }}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-500 text-slate-950 font-bold text-xs"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
