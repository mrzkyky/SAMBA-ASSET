import React, { useState, useEffect } from 'react';
import { X, Server, Save, Plus, Tag, Check } from 'lucide-react';
import { createAsset, updateAsset, createCategory, getCategories, createSegment, getSegments, getSites } from '../api';

const parseSNCount = (rawSN) => {
  if (!rawSN) return 0;
  const replaced = rawSN.replace(/\r\n/g, ',').replace(/\n/g, ',').replace(/;/g, ',');
  const parts = replaced.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length;
};

const AssetModal = ({ isOpen, onClose, asset, sites: initialSites, categories: initialCategories, segments: initialSegments, onSaveSuccess }) => {
  const [sitesList, setSitesList] = useState(initialSites || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [segmentsList, setSegmentsList] = useState(initialSegments || []);
  const [formData, setFormData] = useState({
    site_id: '',
    category_id: '',
    segment_id: '',
    brand: '',
    model: '',
    serial_number: '',
    location_detail: 'Main Rack',
    unit_count: 1,
    status: 'Aktif',
    notes: '',
  });

  // Inline Category Creation State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Inline Segment Creation State
  const [isAddingNewSegment, setIsAddingNewSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [creatingSegment, setCreatingSegment] = useState(false);
  const [segmentError, setSegmentError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync props or dynamically fetch if empty
  useEffect(() => {
    if (initialSites && initialSites.length > 0) {
      setSitesList(initialSites);
    } else if (isOpen) {
      getSites().then((data) => data && setSitesList(data)).catch(() => {});
    }
  }, [initialSites, isOpen]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    } else if (isOpen) {
      getCategories().then((data) => data && setCategories(data)).catch(() => {});
    }
  }, [initialCategories, isOpen]);

  useEffect(() => {
    if (initialSegments && initialSegments.length > 0) {
      setSegmentsList(initialSegments);
    } else if (isOpen) {
      getSegments().then((data) => data && setSegmentsList(data)).catch(() => {});
    }
  }, [initialSegments, isOpen]);

  useEffect(() => {
    if (asset) {
      setFormData({
        site_id: String(asset.site_id || ''),
        category_id: String(asset.category_id || ''),
        segment_id: asset.segment_id ? String(asset.segment_id) : '',
        brand: asset.brand || '',
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        location_detail: asset.location_detail || 'Main Rack',
        unit_count: asset.unit_count || 1,
        status: asset.status || 'Aktif',
        notes: asset.notes || '',
      });
    } else {
      setFormData({
        site_id: sitesList[0]?.id ? String(sitesList[0].id) : (initialSites?.[0]?.id ? String(initialSites[0].id) : ''),
        category_id: categories[0]?.id ? String(categories[0].id) : (initialCategories?.[0]?.id ? String(initialCategories[0].id) : ''),
        segment_id: segmentsList[0]?.id ? String(segmentsList[0].id) : '',
        brand: '',
        model: '',
        serial_number: '',
        location_detail: 'Main Rack',
        unit_count: 1,
        status: 'Aktif',
        notes: '',
      });
    }
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setIsAddingNewSegment(false);
    setNewSegmentName('');
    setError('');
    setCategoryError('');
    setSegmentError('');
  }, [asset, initialSites, isOpen]);

  if (!isOpen) return null;

  const handleSNChange = (e) => {
    const val = e.target.value;
    const count = parseSNCount(val);
    setFormData((prev) => ({
      ...prev,
      serial_number: val,
      unit_count: count > 1 ? count : (prev.unit_count > 1 && count === 1 ? 1 : prev.unit_count),
    }));
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      setIsAddingNewCategory(true);
    } else {
      setFormData({ ...formData, category_id: val });
    }
  };

  const handleInlineCreateCategory = async (e) => {
    e.preventDefault();
    const nameToCreate = newCategoryName.trim();
    if (!nameToCreate) return;

    // Check if category already exists in current list
    const existing = categories.find(c => c.name.toLowerCase() === nameToCreate.toLowerCase());
    if (existing) {
      setFormData((prev) => ({ ...prev, category_id: String(existing.id) }));
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      setCategoryError('');
      return;
    }

    setCreatingCategory(true);
    setCategoryError('');

    try {
      const res = await createCategory({ name: nameToCreate });
      const newCat = res.data;

      // Refresh categories list
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);

      // Auto select newly created category
      setFormData((prev) => ({ ...prev, category_id: String(newCat.id) }));
      setIsAddingNewCategory(false);
      setNewCategoryName('');
    } catch (err) {
      // If error (e.g. backend duplicate), refresh & match
      const updatedCategories = await getCategories().catch(() => []);
      if (updatedCategories.length > 0) setCategories(updatedCategories);
      const match = updatedCategories.find(c => c.name.toLowerCase() === nameToCreate.toLowerCase());
      if (match) {
        setFormData((prev) => ({ ...prev, category_id: String(match.id) }));
        setIsAddingNewCategory(false);
        setNewCategoryName('');
        setCategoryError('');
      } else {
        setCategoryError(err.response?.data?.error || 'Gagal membuat kategori baru.');
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSegmentSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      setIsAddingNewSegment(true);
    } else {
      setFormData({ ...formData, segment_id: val });
    }
  };

  const handleInlineCreateSegment = async (e) => {
    e.preventDefault();
    const nameToCreate = newSegmentName.trim();
    if (!nameToCreate) return;

    // Check if segment already exists in current list
    const existing = segmentsList.find(s => s.name.toLowerCase() === nameToCreate.toLowerCase());
    if (existing) {
      setFormData((prev) => ({ ...prev, segment_id: String(existing.id) }));
      setIsAddingNewSegment(false);
      setNewSegmentName('');
      setSegmentError('');
      return;
    }

    setCreatingSegment(true);
    setSegmentError('');

    try {
      const res = await createSegment({ name: nameToCreate });
      const newSeg = res.data;

      // Refresh segments list
      const updatedSegments = await getSegments();
      setSegmentsList(updatedSegments);

      // Auto select newly created segment
      setFormData((prev) => ({ ...prev, segment_id: String(newSeg.id) }));
      setIsAddingNewSegment(false);
      setNewSegmentName('');
    } catch (err) {
      // If error (e.g. backend duplicate), refresh & match
      const updatedSegments = await getSegments().catch(() => []);
      if (updatedSegments.length > 0) setSegmentsList(updatedSegments);
      const match = updatedSegments.find(s => s.name.toLowerCase() === nameToCreate.toLowerCase());
      if (match) {
        setFormData((prev) => ({ ...prev, segment_id: String(match.id) }));
        setIsAddingNewSegment(false);
        setNewSegmentName('');
        setSegmentError('');
      } else {
        setSegmentError(err.response?.data?.error || 'Gagal membuat segmen baru.');
      }
    } finally {
      setCreatingSegment(false);
    }
  };

  const detectedSNCount = parseSNCount(formData.serial_number);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalCategoryId = formData.category_id ? parseInt(formData.category_id, 10) : null;
      let finalSegmentId = formData.segment_id ? parseInt(formData.segment_id, 10) : null;

      // Auto-save category if user typed in inline input without clicking Simpan button
      if (isAddingNewCategory && newCategoryName.trim()) {
        const existing = categories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
        if (existing) {
          finalCategoryId = existing.id;
        } else {
          try {
            const res = await createCategory({ name: newCategoryName.trim() });
            if (res.data?.id) finalCategoryId = res.data.id;
          } catch {
            const updatedCategories = await getCategories().catch(() => []);
            const match = updatedCategories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
            if (match) finalCategoryId = match.id;
          }
        }
      }

      // Auto-save segment if user typed in inline input without clicking Simpan button
      if (isAddingNewSegment && newSegmentName.trim()) {
        const existing = segmentsList.find(s => s.name.toLowerCase() === newSegmentName.trim().toLowerCase());
        if (existing) {
          finalSegmentId = existing.id;
        } else {
          try {
            const res = await createSegment({ name: newSegmentName.trim() });
            if (res.data?.id) finalSegmentId = res.data.id;
          } catch {
            const updatedSegments = await getSegments().catch(() => []);
            const match = updatedSegments.find(s => s.name.toLowerCase() === newSegmentName.trim().toLowerCase());
            if (match) finalSegmentId = match.id;
          }
        }
      }

      if (!formData.site_id) {
        setError('Silakan pilih lokasi Site & Mitra.');
        setLoading(false);
        return;
      }

      if (!finalCategoryId) {
        setError('Silakan pilih atau tambahkan Kategori Perangkat.');
        setLoading(false);
        return;
      }

      const payload = {
        site_id: parseInt(formData.site_id, 10),
        category_id: finalCategoryId,
        segment_id: finalSegmentId,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        serial_number: formData.serial_number.trim(),
        location_detail: formData.location_detail || 'Main Rack',
        unit_count: parseInt(formData.unit_count, 10) || 1,
        status: formData.status || 'Aktif',
        notes: formData.notes || '',
      };

      if (asset) {
        await updateAsset(asset.id, payload);
      } else {
        await createAsset(payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data aset. Periksa kembali format input.');
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
                Dukungan 29+ Kategori & Multi-SN otomatis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
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
                {sitesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch?.name}] {s.partner_name} - {s.site_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown & Quick Add Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Kategori Perangkat (Level 3) *
                </label>
                {!isAddingNewCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(true)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Kategori Baru</span>
                  </button>
                )}
              </div>

              {isAddingNewCategory ? (
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nama Kategori Baru (misal: SFP+)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleInlineCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0"
                    >
                      {creatingCategory ? 'Simpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName('');
                      }}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white shrink-0 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {categoryError && <p className="text-[10px] text-rose-400">{categoryError}</p>}
                </div>
              ) : (
                <select
                  required
                  value={formData.category_id}
                  onChange={handleCategorySelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="NEW" className="text-cyan-400 font-bold">
                    + Tambah Kategori Baru...
                  </option>
                </select>
              )}
            </div>

            {/* Segment Layanan Dropdown & Quick Add */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Segmen Layanan (Jenis Aset)
                </label>
                {!isAddingNewSegment && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewSegment(true)}
                    className="text-[11px] text-violet-400 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Segmen Baru</span>
                  </button>
                )}
              </div>

              {isAddingNewSegment ? (
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="misal: Kemitraan / POP / Corporate"
                      value={newSegmentName}
                      onChange={(e) => setNewSegmentName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-violet-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleInlineCreateSegment}
                      disabled={creatingSegment || !newSegmentName.trim()}
                      className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs shrink-0"
                    >
                      {creatingSegment ? 'Simpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewSegment(false);
                        setNewSegmentName('');
                      }}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white shrink-0 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {segmentError && <p className="text-[10px] text-rose-400">{segmentError}</p>}
                </div>
              ) : (
                <select
                  value={formData.segment_id}
                  onChange={handleSegmentSelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="">-- Tanpa Segmen (Umum) --</option>
                  {segmentsList.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} {seg.description ? `(${seg.description})` : ''}
                    </option>
                  ))}
                  <option value="NEW" className="text-violet-400 font-bold">
                    + Tambah Segmen Baru...
                  </option>
                </select>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Merek / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="misal: TP-Link, Cisco, MikroTik"
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
                placeholder="misal: TP-Link ES210GMP / Catalyst 2960X"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Location Detail / Rack */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lokasi Detail / Rak
              </label>
              <input
                type="text"
                placeholder="misal: Sub Rack / Rack 01 - U12"
                value={formData.location_detail}
                onChange={(e) => setFormData({ ...formData, location_detail: e.target.value })}
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
                <option value="Pasif">Pasif</option>
                <option value="Cadangan">Cadangan / Spare</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>

          {/* Smart Multi-SN Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Serial Number (Dukungan Multi-SN) *
              </label>
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Dideteksi: {detectedSNCount} Serial Number
              </span>
            </div>
            <textarea
              rows="3"
              required
              placeholder={`Masukkan 1 atau lebih Serial Number (pisahkan dengan koma atau tekan Enter)\nContoh:\n22640H5003558, 22640H5003559, 22640H5003560`}
              value={formData.serial_number}
              onChange={handleSNChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] text-slate-500 mt-1">
              * Anda bisa menyalin-menempel (*paste*) 9 Serial Number sekaligus (pisahkan dengan koma atau Enter).
            </p>
          </div>

          {/* Unit Count */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Jumlah Unit Terpasang
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.unit_count}
              onChange={(e) => setFormData({ ...formData, unit_count: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Catatan / Keterangan Spesifik
            </label>
            <textarea
              rows="2"
              placeholder="misal: Switch Distribusi AP di Lantai 1 s/d 3..."
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
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
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
