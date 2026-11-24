import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../api';

const CategoryManager = ({ categories = [], user, onRefresh }) => {
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
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#1D332E] border border-slate-200 dark:border-[#355047] shadow-sm space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F2] flex items-center space-x-2">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Kelola Kategori Perangkat (Level 3)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#829A8F] mt-0.5">Tambah, edit, atau hapus kategori perangkat IT.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Form Editor Panel */}
      {isFormOpen && (
        <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#142522] border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#355047] pb-2">
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Perangkat Baru'}
            </h3>
            <button type="button" onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2B4840]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              placeholder="Nama Kategori (misal: Firewall)"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="w-full sm:flex-1 bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-[#F1F5F2] focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1D332E] dark:hover:bg-[#2B4840] dark:text-[#B8CCC3] text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#355047]">
        <table className="w-full text-left text-xs text-slate-700 dark:text-[#B8CCC3]">
          <thead className="bg-slate-50 dark:bg-[#142522] text-slate-600 dark:text-[#829A8F] uppercase font-semibold border-b border-slate-200 dark:border-[#355047]">
            <tr>
              <th className="py-3 px-4">ID Kategori</th>
              <th className="py-3 px-4">Nama Kategori Perangkat</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#355047] bg-white dark:bg-[#1D332E]">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#2B4840]/40 transition-colors">
                <td className="py-3 px-4 text-slate-400 dark:text-[#829A8F] font-mono">#{c.id}</td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#F1F5F2]">
                  <span className="inline-flex px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    {c.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenForm(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#2B4840] active:scale-95"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#2B4840] active:scale-95"
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
