import React, { useState, useEffect } from 'react';
import { X, Server, Save, Plus, Tag, Check } from 'lucide-react';
import { createAsset, updateAsset, createCategory, getCategories, createSegment, getSegments, getSites } from '../api';
import SearchableSelect from './SearchableSelect';

export const CATEGORY_NOTES_SUGGESTIONS = {
  'access point': 'Wireless Network Access Device',
  'aoc': 'Active Optical Cable Interconnect',
  'akses kontrol': 'Access Control & Security System',
  'atn': 'Access Transport Network Device',
  'baterai': 'Backup Power Energy Storage',
  'crs': 'Cloud Router Switch Device',
  'dcdu': 'DC Power Distribution Unit',
  'firewall': 'Network Security & Traffic Filtering Device',
  'inline atenuator': 'Optical Signal Attenuation Component',
  'inverter': 'DC to AC Power Conversion Device',
  'kipas mini': 'Equipment Cooling & Ventilation Component',
  'lhg': 'Wireless Point-to-Point Radio Device',
  'mc': 'Ethernet & Fiber Media Conversion Device',
  'microwave': 'Microwave Radio Transmission System',
  'microwave (odu, idu, kabel)': 'Microwave Radio Transmission System',
  'mikrotik': 'Network Routing & Management Device',
  'olt': 'Optical Line Terminal Device',
  'ont': 'Optical Network Terminal Device',
  'otb': 'Fiber Optic Termination & Distribution Box',
  'patch cord': 'Network Interconnection Cable',
  'patchcore': 'Fiber Optic Patch & Interconnection System',
  'psu': 'Power Supply & Conversion Unit',
  'rack server': 'Rack-Mount Computing Server',
  'rectifier': 'AC to DC Power Conversion System',
  'rtn': 'Radio Transmission Network Device',
  'router': 'Network Routing & Gateway Device',
  'kabel utp': 'Ethernet Network Transmission Cable',
  'rosset': 'Network Termination & Outlet Point',
  'rosset indoor': 'Indoor Network Termination Point',
  'adaptor': 'AC to DC Power Adapter',
  'dac': 'Direct Attach Copper Interconnect',
  'sfp': 'Optical & Ethernet Network Transceiver',
  'server': 'Computing & Network Service Platform',
  'step down / step up': 'DC Voltage Conversion Unit',
  'step down': 'DC Voltage Conversion Unit',
  'step up': 'DC Voltage Conversion Unit',
  'switch': 'Network Switching & Connectivity Device',
  'ups': 'Uninterruptible Backup Power System',
  'qsfp': 'High-Speed Optical & Ethernet Network Transceiver',
};

export const TEMPLATE_OPTIONS = [
  { category: 'Access Point', note: 'Wireless Network Access Device' },
  { category: 'AOC', note: 'Active Optical Cable Interconnect' },
  { category: 'Akses Kontrol', note: 'Access Control & Security System' },
  { category: 'ATN', note: 'Access Transport Network Device' },
  { category: 'Baterai', note: 'Backup Power Energy Storage' },
  { category: 'CRS', note: 'Cloud Router Switch Device' },
  { category: 'DCDU', note: 'DC Power Distribution Unit' },
  { category: 'Firewall', note: 'Network Security & Traffic Filtering Device' },
  { category: 'Inline Atenuator', note: 'Optical Signal Attenuation Component' },
  { category: 'Inverter', note: 'DC to AC Power Conversion Device' },
  { category: 'Kipas Mini', note: 'Equipment Cooling & Ventilation Component' },
  { category: 'LHG', note: 'Wireless Point-to-Point Radio Device' },
  { category: 'MC', note: 'Ethernet & Fiber Media Conversion Device' },
  { category: 'Microwave (ODU, IDU, Kabel)', note: 'Microwave Radio Transmission System' },
  { category: 'MikroTik', note: 'Network Routing & Management Device' },
  { category: 'OLT', note: 'Optical Line Terminal Device' },
  { category: 'ONT', note: 'Optical Network Terminal Device' },
  { category: 'OTB', note: 'Fiber Optic Termination & Distribution Box' },
  { category: 'Patch Cord', note: 'Network Interconnection Cable' },
  { category: 'PatchCore', note: 'Fiber Optic Patch & Interconnection System' },
  { category: 'PSU', note: 'Power Supply & Conversion Unit' },
  { category: 'Rack Server', note: 'Rack-Mount Computing Server' },
  { category: 'Rectifier', note: 'AC to DC Power Conversion System' },
  { category: 'RTN', note: 'Radio Transmission Network Device' },
  { category: 'Router', note: 'Network Routing & Gateway Device' },
  { category: 'Kabel UTP', note: 'Ethernet Network Transmission Cable' },
  { category: 'Rosset', note: 'Network Termination & Outlet Point' },
  { category: 'Rosset Indoor', note: 'Indoor Network Termination Point' },
  { category: 'Adaptor', note: 'AC to DC Power Adapter' },
  { category: 'DAC', note: 'Direct Attach Copper Interconnect' },
  { category: 'SFP', note: 'Optical & Ethernet Network Transceiver' },
  { category: 'Server', note: 'Computing & Network Service Platform' },
  { category: 'Step Down / Step Up', note: 'DC Voltage Conversion Unit' },
  { category: 'Switch', note: 'Network Switching & Connectivity Device' },
  { category: 'UPS', note: 'Uninterruptible Backup Power System' },
  { category: 'QSFP', note: 'High-Speed Optical & Ethernet Network Transceiver' },
];

export const DEFAULT_ASSET_TYPES = [
  'Aktif',
  'Pasif',
  'Interconnect',
  'Power',
  'Kelistrikan',
  'Radio & Transmisi',
  'Optical & Fiber',
  'Server & Komputasi',
  'Security & CCTV',
  'Tools & Instrument',
  'Aksesoris & Rack',
];

export const getSuggestedNoteForCategory = (categoryName) => {
  if (!categoryName) return '';
  const clean = categoryName.trim().toLowerCase();
  if (CATEGORY_NOTES_SUGGESTIONS[clean]) {
    return CATEGORY_NOTES_SUGGESTIONS[clean];
  }
  for (const [key, value] of Object.entries(CATEGORY_NOTES_SUGGESTIONS)) {
    if (clean === key || clean.startsWith(key) || clean.includes(key)) {
      return value;
    }
  }
  return '';
};

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
    asset_type: 'Aktif',
    brand: '',
    model: '',
    serial_number: '',
    location_detail: 'Main Rack',
    status: 'Aktif',
    unit_count: 1,
    condition: 'Baik',
    ownership: 'Aset Tetap',
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

  // Custom Asset Type State
  const [customAssetTypes, setCustomAssetTypes] = useState(() => {
    try {
      const saved = localStorage.getItem('samba_custom_asset_types');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddingNewAssetType, setIsAddingNewAssetType] = useState(false);
  const [newAssetTypeName, setNewAssetTypeName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddNewAssetType = (e) => {
    if (e) e.preventDefault();
    const trimmed = newAssetTypeName.trim();
    if (!trimmed) return;

    if (!DEFAULT_ASSET_TYPES.includes(trimmed) && !customAssetTypes.includes(trimmed)) {
      const updated = [...customAssetTypes, trimmed];
      setCustomAssetTypes(updated);
      try {
        localStorage.setItem('samba_custom_asset_types', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom asset type:', err);
      }
    }

    setFormData((prev) => ({ ...prev, asset_type: trimmed }));
    setIsAddingNewAssetType(false);
    setNewAssetTypeName('');
  };

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
        asset_type: asset.asset_type || 'Aktif',
        brand: asset.brand || '',
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        location_detail: asset.location_detail || 'Main Rack',
        status: asset.status || 'Aktif',
        unit_count: asset.unit_count || 1,
        condition: asset.condition || 'Baik',
        ownership: asset.ownership || 'Aset Tetap',
        notes: asset.notes || '',
      });
    } else {
      const defaultCatId = categories[0]?.id ? String(categories[0].id) : (initialCategories?.[0]?.id ? String(initialCategories[0].id) : '');
      const defaultCat = categories.find(c => String(c.id) === defaultCatId) || initialCategories?.find(c => String(c.id) === defaultCatId);
      const defaultSuggested = defaultCat ? getSuggestedNoteForCategory(defaultCat.name) : '';

      setFormData({
        site_id: sitesList[0]?.id ? String(sitesList[0].id) : (initialSites?.[0]?.id ? String(initialSites[0].id) : ''),
        category_id: defaultCatId,
        segment_id: segmentsList[0]?.id ? String(segmentsList[0].id) : '',
        asset_type: 'Aktif',
        brand: '',
        model: '',
        serial_number: '',
        location_detail: 'Main Rack',
        status: 'Aktif',
        unit_count: 1,
        condition: 'Baik',
        ownership: 'Aset Tetap',
        notes: defaultSuggested,
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

  const handleInlineCreateCategory = async (e) => {
    e.preventDefault();
    const nameToCreate = newCategoryName.trim();
    if (!nameToCreate) return;

    const existing = categories.find(c => c.name.toLowerCase() === nameToCreate.toLowerCase());
    if (existing) {
      const suggested = getSuggestedNoteForCategory(existing.name);
      setFormData((prev) => {
        const isPreviousTemplate = Object.values(CATEGORY_NOTES_SUGGESTIONS).includes(prev.notes);
        return {
          ...prev,
          category_id: String(existing.id),
          notes: (!prev.notes || isPreviousTemplate) && suggested ? suggested : prev.notes,
        };
      });
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

      const updatedCategories = await getCategories();
      setCategories(updatedCategories);

      const suggested = getSuggestedNoteForCategory(newCat.name);
      setFormData((prev) => {
        const isPreviousTemplate = Object.values(CATEGORY_NOTES_SUGGESTIONS).includes(prev.notes);
        return {
          ...prev,
          category_id: String(newCat.id),
          notes: (!prev.notes || isPreviousTemplate) && suggested ? suggested : prev.notes,
        };
      });
      setIsAddingNewCategory(false);
      setNewCategoryName('');
    } catch (err) {
      const updatedCategories = await getCategories().catch(() => []);
      if (updatedCategories.length > 0) setCategories(updatedCategories);
      const match = updatedCategories.find(c => c.name.toLowerCase() === nameToCreate.toLowerCase());
      if (match) {
        const suggested = getSuggestedNoteForCategory(match.name);
        setFormData((prev) => {
          const isPreviousTemplate = Object.values(CATEGORY_NOTES_SUGGESTIONS).includes(prev.notes);
          return {
            ...prev,
            category_id: String(match.id),
            notes: (!prev.notes || isPreviousTemplate) && suggested ? suggested : prev.notes,
          };
        });
        setIsAddingNewCategory(false);
        setNewCategoryName('');
        setCategoryError('');
      } else {
        setCategoryError(err.response?.data?.error || 'Gagal menambahkan kategori.');
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleInlineCreateSegment = async (e) => {
    e.preventDefault();
    const nameToCreate = newSegmentName.trim();
    if (!nameToCreate) return;

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

      const updatedSegments = await getSegments();
      setSegmentsList(updatedSegments);

      setFormData((prev) => ({ ...prev, segment_id: String(newSeg.id) }));
      setIsAddingNewSegment(false);
      setNewSegmentName('');
    } catch (err) {
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
        asset_type: formData.asset_type || 'Aktif',
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        serial_number: formData.serial_number.trim(),
        location_detail: formData.location_detail || 'Main Rack',
        status: formData.status || 'Aktif',
        unit_count: parseInt(formData.unit_count, 10) || 1,
        condition: formData.condition || 'Baik',
        ownership: formData.ownership || 'Aset Tetap',
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

  const detectedSNCount = parseSNCount(formData.serial_number);
  const selectedCat = categories.find((c) => String(c.id) === String(formData.category_id));
  const currentCategoryName = selectedCat?.name || '';
  const currentCategorySuggestedNote = getSuggestedNoteForCategory(currentCategoryName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Row 1 - Left: Lokasi Site & Mitra */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lokasi Site & Mitra *
              </label>
              <SearchableSelect
                required
                value={formData.site_id}
                onChange={(val) => setFormData({ ...formData, site_id: val })}
                placeholder="Pilih Site & Mitra..."
                searchPlaceholder="Ketik untuk mencari site (misal: Brebes, MAN 1, Pop)..."
                options={sitesList.map((s) => ({
                  value: String(s.id),
                  label: `[${s.branch?.name || 'Branch'}] ${s.partner_name} - ${s.site_name}`,
                  sublabel: s.address,
                  searchKeywords: `${s.branch?.name || ''} ${s.partner_name || ''} ${s.site_name || ''} ${s.address || ''}`,
                }))}
              />
            </div>

            {/* Row 1 - Right: Kategori */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Kategori *
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
                <SearchableSelect
                  required
                  value={formData.category_id}
                  onChange={(val) => {
                    if (val === 'NEW') {
                      setIsAddingNewCategory(true);
                    } else {
                      const selectedCat = categories.find((c) => String(c.id) === String(val));
                      const suggested = selectedCat ? getSuggestedNoteForCategory(selectedCat.name) : '';
                      setFormData((prev) => {
                        const isPreviousTemplate = Object.values(CATEGORY_NOTES_SUGGESTIONS).includes(prev.notes);
                        return {
                          ...prev,
                          category_id: val,
                          notes: (!prev.notes || isPreviousTemplate) && suggested ? suggested : prev.notes,
                        };
                      });
                    }
                  }}
                  placeholder="Pilih Kategori Perangkat..."
                  searchPlaceholder="Ketik untuk mencari kategori (misal: Access, Switch, SFP)..."
                  options={categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  onAddNew={() => setIsAddingNewCategory(true)}
                  addNewLabel="+ Tambah Kategori Baru..."
                />
              )}
            </div>

            {/* Row 2 - Left: Segmen Layanan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Segmen Layanan
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
                <SearchableSelect
                  value={formData.segment_id || ''}
                  onChange={(val) => {
                    if (val === 'NEW') {
                      setIsAddingNewSegment(true);
                    } else {
                      setFormData({ ...formData, segment_id: val });
                    }
                  }}
                  placeholder="-- Tanpa Segmen (Umum) --"
                  searchPlaceholder="Ketik untuk mencari segmen (misal: Corporate, POP, Kemitraan)..."
                  options={[
                    { value: '', label: '-- Tanpa Segmen (Umum) --' },
                    ...segmentsList.map((seg) => ({
                      value: String(seg.id),
                      label: seg.name,
                      sublabel: seg.description,
                    })),
                  ]}
                  onAddNew={() => setIsAddingNewSegment(true)}
                  addNewLabel="+ Tambah Segmen Baru..."
                />
              )}
            </div>

            {/* Row 2 - Right: Jenis Asset * */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Jenis Asset *
                </label>
                {!isAddingNewAssetType ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAssetType(true)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                  >
                    <span>+ Jenis Baru</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAssetType(false);
                      setNewAssetTypeName('');
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>

              {isAddingNewAssetType ? (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nama jenis asset (misal: Kelistrikan, CCTV, Radio)..."
                      value={newAssetTypeName}
                      onChange={(e) => setNewAssetTypeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewAssetType(e);
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewAssetType}
                      disabled={!newAssetTypeName.trim()}
                      className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 disabled:opacity-50"
                    >
                      Gunakan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAssetType(false);
                        setNewAssetTypeName('');
                      }}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white shrink-0 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <SearchableSelect
                  required
                  value={formData.asset_type || 'Aktif'}
                  onChange={(val) => {
                    if (val === 'NEW') {
                      setIsAddingNewAssetType(true);
                    } else {
                      setFormData({ ...formData, asset_type: val });
                    }
                  }}
                  placeholder="Pilih Jenis Asset..."
                  searchPlaceholder="Ketik untuk mencari jenis (misal: Aktif, Pasif, Kelistrikan)..."
                  options={[
                    ...Array.from(
                      new Set([
                        ...DEFAULT_ASSET_TYPES,
                        ...customAssetTypes,
                        ...(formData.asset_type ? [formData.asset_type] : []),
                      ])
                    ).map((t) => ({
                      value: t,
                      label: t,
                      sublabel: ['Aktif', 'Pasif', 'Interconnect', 'Power'].includes(t) ? 'Kategori Standar' : 'Kustom / Tambahan',
                    })),
                  ]}
                  onAddNew={() => setIsAddingNewAssetType(true)}
                  addNewLabel="+ Tambah Jenis Asset Baru..."
                />
              )}
            </div>

            {/* Row 3 - Left: Merek / Brand * */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Merek / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="misal: Rapid, TP-Link, Cisco"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Row 3 - Right: Tipe / Model * */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tipe / Model *
              </label>
              <input
                type="text"
                required
                placeholder="misal: SFP Rapid-1,25G-20KM"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Row 4 - Left: Lokasi Detail / Rack */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lokasi Detail / Rack
              </label>
              <input
                type="text"
                placeholder="misal: Main Rack / Sub Rack 01"
                value={formData.location_detail}
                onChange={(e) => setFormData({ ...formData, location_detail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Row 4 - Right: Status * */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Rusak">Rusak</option>
                <option value="Retired">Retired</option>
                <option value="Hilang">Hilang</option>
              </select>
            </div>
          </div>

          {/* Serial Number (Dukungan Multi-SN) * */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Serial Number *
              </label>
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Detected: {detectedSNCount} Serial Number
              </span>
            </div>
            <textarea
              rows="3"
              required
              placeholder={`Masukkan 1 atau lebih Serial Number (pisahkan dengan koma atau tekan Enter)\nContoh:\nEW3BU4542, EW3BU4543`}
              value={formData.serial_number}
              onChange={handleSNChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] text-slate-500 mt-1">
              * Anda bisa menyalin-menempel (*paste*) Serial Number sekaligus (pisahkan dengan koma atau Enter).
            </p>
          </div>

          {/* Grid 3 Kolom: Jumlah Unit, Kondisi Perangkat, Status Kepemilikan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Jumlah Unit Terpasang */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Jumlah Unit Terpasang *
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

            {/* Kondisi Perangkat */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Kondisi Perangkat *
              </label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>

            {/* Status Kepemilikan Aset */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Status Kepemilikan *
              </label>
              <select
                required
                value={formData.ownership}
                onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-medium"
              >
                <option value="Aset Tetap">🏢 Aset Tetap (Perusahaan)</option>
                <option value="Aset Hibah">🎁 Aset Hibah (Mitra)</option>
              </select>
            </div>
          </div>

          {/* Catatan / Keterangan Spesifik */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Catatan / Keterangan Spesifik
              </label>

              {/* Template Dropdown Quick Selector */}
              <div className="flex items-center space-x-1.5">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({ ...prev, notes: e.target.value }));
                    }
                  }}
                  className="text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-400 focus:border-cyan-500 focus:outline-none cursor-pointer"
                  title="Pilih dari daftar template deskripsi otomatis"
                >
                  <option value="">📋 Pilih Template Keterangan...</option>
                  {TEMPLATE_OPTIONS.map((item, idx) => (
                    <option key={idx} value={item.note}>
                      {item.category} — {item.note}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suggested Template Banner / Quick Apply Button */}
            {currentCategorySuggestedNote && formData.notes !== currentCategorySuggestedNote && (
              <div className="mb-2 flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg text-xs">
                <span className="text-cyan-300 text-[11px] truncate mr-2">
                  💡 Saran ({currentCategoryName}): <em className="text-white font-medium">"{currentCategorySuggestedNote}"</em>
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, notes: currentCategorySuggestedNote }))}
                  className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] shrink-0 transition-all active:scale-95 shadow-sm"
                >
                  Gunakan Template
                </button>
              </div>
            )}

            <textarea
              rows="3"
              placeholder={currentCategorySuggestedNote ? `misal: ${currentCategorySuggestedNote}...` : "misal: Optical & Ethernet Network Transceiver Link to Trayeman..."}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] text-slate-500 mt-1">
              * Keterangan otomatis terisi saat memilih kategori perangkat, dan Anda tetap bebas mengetik/menyesuaikan isinya.
            </p>
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
