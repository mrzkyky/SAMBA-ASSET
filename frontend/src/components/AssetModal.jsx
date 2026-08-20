import React, { useState, useEffect } from 'react';
import { X, Server, Save } from 'lucide-react';
import { createAsset, updateAsset } from '../api';

const AssetModal = ({ isOpen, onClose, asset, sites, categories, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    site_id: '',
    category_id: '',
    brand: '',
    model: '',
    serial_number: '',
    location_detail: 'Main Rack',
    unit_count: 1,
    status: 'Aktif',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setFormData({
        site_id: asset.site_id,
        category_id: asset.category_id,
        brand: asset.brand,
        model: asset.model,
        serial_number: asset.serial_number,
        location_detail: asset.location_detail || 'Main Rack',
        unit_count: asset.unit_count || 1,
        status: asset.status || 'Aktif',
        notes: asset.notes || '',
      });
    } else {
      setFormData({
        site_id: sites[0]?.id || '',
        category_id: categories[0]?.id || '',
        brand: '',
        model: '',
        serial_number: '',
        location_detail: 'Main Rack',
        unit_count: 1,
        status: 'Aktif',
        notes: '',
      });
    }
    setError('');
  }, [asset, sites, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        site_id: parseInt(formData.site_id, 10),
        category_id: parseInt(formData.category_id, 10),
        unit_count: parseInt(formData.unit_count, 10),
      };

      if (asset) {
        await updateAsset(asset.id, payload);
      } else {
        await createAsset(payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data aset. Pastikan serial number valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {asset ? 'Edit Detail Aset Perangkat' : 'Tambah Aset Perangkat Baru'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isi data teknis dan lokasi spesifik perangkat di site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Site Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lokasi Site & Mitra (Level 2) *
              </label>
              <select
                required
                value={formData.site_id}
                onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Pilih Site</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch?.name}] {s.partner_name} - {s.site_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Kategori Perangkat (Level 3) *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Merek / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="misal: Cisco, MikroTik, Dell"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tipe / Model *
              </label>
              <input
                type="text"
                required
                placeholder="misal: CCR2004-16G-2S+ / Catalyst 2960X"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Serial Number *
              </label>
              <input
                type="text"
                required
                placeholder="misal: SN-MT-2004-BRB01"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Location Detail / Rack */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lokasi Detail / Rak
              </label>
              <input
                type="text"
                placeholder="misal: Rack 01 - U12"
                value={formData.location_detail}
                onChange={(e) => setFormData({ ...formData, location_detail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Unit Count */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Jumlah Unit
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.unit_count}
                onChange={(e) => setFormData({ ...formData, unit_count: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Status Perangkat *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Cadangan">Cadangan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Catatan / Keterangan Spesifik
            </label>
            <textarea
              rows="2"
              placeholder="Catatan kondisi teknis, lisensi, atau riwayat perbaikan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Data Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
