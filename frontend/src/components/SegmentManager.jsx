import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, RefreshCw, Palette } from 'lucide-react';
import { getSegments, createSegment, updateSegment, deleteSegment } from '../api';

const SegmentManager = ({ segments: initialSegments, onRefresh }) => {
  const [segments, setSegments] = useState(initialSegments || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#06b6d4' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSegments = async () => {
    try {
      const data = await getSegments();
      setSegments(data || []);
    } catch (err) {
      console.error('Gagal mengambil data segmen:', err);
    }
  };

  useEffect(() => { loadSegments(); }, []);
  useEffect(() => { if (initialSegments?.length > 0) setSegments(initialSegments); }, [initialSegments]);

  const handleOpenForm = (seg = null) => {
    setError('');
    if (seg) {
      setEditingSegment(seg);
      setFormData({ name: seg.name, description: seg.description || '', color: seg.color || '#06b6d4' });
    } else {
      setEditingSegment(null);
      setFormData({ name: '', description: '', color: '#06b6d4' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => { setIsFormOpen(false); setEditingSegment(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, formData);
      } else {
        await createSegment(formData);
      }
      await loadSegments();
      if (onRefresh) onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan segmen.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus segmen ini?')) return;
    try {
      await deleteSegment(id);
      await loadSegments();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus segmen.');
    }
  };

  const presetColors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#3b82f6', '#f97316'];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>Kelola Segmen Layanan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Klasifikasi aset berdasarkan jenis layanan (Kemitraan, POP, Local Loop, Corporate, dll).</p>
        </div>
        <div className="flex items-center space-x-2">
          <button type="button" onClick={loadSegments} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => handleOpenForm(null)} className="px-3.5 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-violet-500/20 active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Tambah Segmen</span>
          </button>
        </div>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-sm">
            Belum ada data segmen. Klik "+ Tambah Segmen" untuk membuat segmen baru.
          </div>
        ) : (
          segments.map((seg) => (
            <div key={seg.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full ring-2 ring-offset-1 ring-offset-slate-950" style={{ backgroundColor: seg.color, ringColor: seg.color }} />
                  <span className="font-bold text-white text-sm">{seg.name}</span>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleOpenForm(seg)} className="p-1 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-slate-800">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(seg.id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{seg.description || 'Tidak ada deskripsi'}</p>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="p-5 rounded-xl bg-slate-950 border border-violet-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-violet-400">
              {editingSegment ? `Edit Segmen: ${editingSegment.name}` : 'Tambah Segmen Layanan Baru'}
            </h3>
            <button type="button" onClick={handleCloseForm} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nama Segmen *</label>
                <input type="text" required placeholder="misal: Kemitraan" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Deskripsi</label>
                <input type="text" placeholder="Deskripsi singkat segmen" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5 flex items-center space-x-1">
                <Palette className="w-3 h-3" /><span>Warna Badge</span>
              </label>
              <div className="flex items-center space-x-2">
                {presetColors.map((c) => (
                  <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${formData.color === c ? 'border-white scale-110 shadow-lg' : 'border-slate-700 hover:border-slate-500'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" title="Pilih warna kustom" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={handleCloseForm} className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700">Batal</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 active:scale-95">
                {loading ? 'Menyimpan...' : 'Simpan Segmen'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SegmentManager;
