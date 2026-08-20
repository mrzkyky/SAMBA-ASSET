import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createSite, updateSite, deleteSite } from '../api';

const SiteManager = ({ sites, branches, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({ branch_id: '', partner_name: '', site_name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenForm = (site = null) => {
    setError('');
    if (site) {
      setEditingSite(site);
      setFormData({
        branch_id: String(site.branch_id),
        partner_name: site.partner_name,
        site_name: site.site_name,
        address: site.address || '',
      });
    } else {
      setEditingSite(null);
      setFormData({ branch_id: branches[0]?.id ? String(branches[0].id) : '', partner_name: '', site_name: '', address: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSite(null);
    setFormData({ branch_id: '', partner_name: '', site_name: '', address: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, branch_id: parseInt(formData.branch_id, 10) };
      if (editingSite) {
        await updateSite(editingSite.id, payload);
      } else {
        await createSite(payload);
      }
      onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat menyimpan site.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus site ini? Semua aset di site ini akan ikut terhapus.')) return;
    try {
      await deleteSite(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus site.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            <span>Kelola Mitra & Site Spesifik (Level 2)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tambah, edit, atau hapus site tempat perangkat berada.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Site</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Induk Branch</th>
              <th className="py-3 px-4">Nama Mitra / Partner</th>
              <th className="py-3 px-4">Nama Site Spesifik</th>
              <th className="py-3 px-4">Alamat / Lokasi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sites.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-cyan-400 font-semibold">{s.branch?.name || '-'}</td>
                <td className="py-3 px-4 font-bold text-white">{s.partner_name}</td>
                <td className="py-3 px-4 text-slate-200">{s.site_name}</td>
                <td className="py-3 px-4 text-slate-400">{s.address || '-'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenForm(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 active:scale-95"
                      title="Edit Site"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95"
                      title="Hapus Site"
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

      {/* Form Editor Panel */}
      {isFormOpen && (
        <div className="p-5 rounded-xl bg-slate-950 border border-teal-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-teal-400">
              {editingSite ? `Edit Site: ${editingSite.site_name}` : 'Tambah Site / Mitra Baru'}
            </h3>
            <button type="button" onClick={handleCloseForm} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Induk Cabang / Branch *</label>
              <select
                required
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">Pilih Cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Mitra / Partner * (misal: Mitra Telkom)</label>
              <input
                type="text"
                required
                placeholder="misal: Mitra Telkom"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Site Spesifik * (misal: Site Brebes Kota)</label>
              <input
                type="text"
                required
                placeholder="misal: Site Brebes Kota"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Alamat Site</label>
              <input
                type="text"
                placeholder="Jl. Sudirman No. 45, Brebes"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
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
                className="px-4 py-2 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95"
              >
                {loading ? 'Menyimpan...' : 'Simpan Site'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SiteManager;
