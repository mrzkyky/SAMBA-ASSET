import React, { useState, useEffect } from 'react';
import {
  Building,
  Server,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  QrCode,
  MapPin,
  Tag,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Network,
  Laptop,
  Zap,
} from 'lucide-react';
import {
  getOfficeUnits,
  createOfficeUnit,
  updateOfficeUnit,
  deleteOfficeUnit,
  getOfficeAssets,
  createOfficeAsset,
  updateOfficeAsset,
  deleteOfficeAsset,
  getOfficeStats,
  getOfficeHierarchy,
} from '../api';

const ASSET_TYPE_OPTIONS = [
  'Server & Komputasi',
  'Jaringan Kantor',
  'Power & UPS',
  'Workstation/PC',
  'Aktif',
  'Pasif',
  'Fasilitas & Rak',
];

const STATUS_OPTIONS = ['Aktif', 'Nonaktif', 'Maintenance', 'Rusak', 'Cadangan / Spare'];
const CONDITION_OPTIONS = ['Baik', 'Perlu Perbaikan', 'Rusak'];
const UNIT_TYPE_OPTIONS = ['Pusat', 'Cabang Utama', 'Kantor Unit / Sub-Branch', 'Gudang Cabang', 'NOC'];

const OfficeAssetManager = ({ user, branches = [], onOpenQRCodeModal }) => {
  const [activeSubTab, setActiveSubTab] = useState('hierarchy'); // 'hierarchy' or 'table'
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [assetsData, setAssetsData] = useState({ data: [], total: 0, page: 1, limit: 10, total_pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Expand/Collapse state for hierarchy view
  const [expandedNodes, setExpandedNodes] = useState({});

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetFormData, setAssetFormData] = useState({
    office_unit_id: '',
    asset_type: 'Server & Komputasi',
    brand: '',
    model: '',
    serial_number: '',
    location_detail: 'Ruang Server - Rack 1',
    unit_count: 1,
    ip_address: '',
    mac_address: '',
    status: 'Aktif',
    condition: 'Baik',
    ownership: 'Aset Perusahaan',
    notes: '',
  });

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitFormData, setUnitFormData] = useState({
    branch_id: '',
    unit_name: '',
    unit_type: 'Cabang Utama',
    code: '',
    address: '',
    pic_name: '',
    pic_phone: '',
  });

  const [copiedIP, setCopiedIP] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const isSuperAdmin = user?.role === 'Super Admin';
  const isBranchAdmin = user?.role === 'Branch Admin';
  const canEdit = isSuperAdmin || isBranchAdmin;

  // Load initial data
  const loadAllData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const [statsRes, unitsRes, hierRes] = await Promise.all([
        getOfficeStats({ branch_id: selectedBranchId, office_unit_id: selectedUnitId }).catch(() => ({ data: null })),
        getOfficeUnits({ branch_id: selectedBranchId }).catch(() => ({ data: [] })),
        getOfficeHierarchy().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data || null);
      setUnitsList(unitsRes.data || []);
      setHierarchyData(hierRes.data || []);

      // Auto-expand first few nodes in hierarchy
      if (hierRes.data && hierRes.data.length > 0) {
        const initialExpanded = {};
        hierRes.data.forEach((group, gIdx) => {
          initialExpanded[`branch_${gIdx}`] = true;
          if (group.units) {
            group.units.forEach((u) => {
              initialExpanded[`unit_${u.unit.id}`] = true;
            });
          }
        });
        setExpandedNodes(initialExpanded);
      }
    } catch (err) {
      console.error('Gagal mengambil data aset internal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load table paginated assets
  const loadTableAssets = async () => {
    try {
      const res = await getOfficeAssets({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        branch_id: selectedBranchId,
        office_unit_id: selectedUnitId,
        asset_type: selectedAssetType,
        status: selectedStatus,
      });
      setAssetsData(res);
    } catch (err) {
      console.error('Gagal memuat tabel aset kantor:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedBranchId, selectedUnitId]);

  useEffect(() => {
    if (activeSubTab === 'table') {
      loadTableAssets();
    }
  }, [activeSubTab, currentPage, searchQuery, selectedBranchId, selectedUnitId, selectedAssetType, selectedStatus]);

  const toggleNode = (nodeKey) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const handleCopyIP = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIP(ip);
    setTimeout(() => setCopiedIP(null), 2000);
  };

  // -------------------------------------------------------------
  // Office Asset Form Handlers
  // -------------------------------------------------------------
  const handleOpenCreateAsset = (defaultUnitId = '') => {
    setEditingAsset(null);
    setAssetFormData({
      office_unit_id: defaultUnitId || (unitsList[0]?.id ? String(unitsList[0].id) : ''),
      asset_type: 'Server & Komputasi',
      brand: '',
      model: '',
      serial_number: '',
      location_detail: 'Ruang Server - Rack 1',
      unit_count: 1,
      ip_address: '',
      mac_address: '',
      status: 'Aktif',
      condition: 'Baik',
      ownership: 'Aset Perusahaan',
      notes: '',
    });
    setActionError('');
    setIsAssetModalOpen(true);
  };

  const handleOpenEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetFormData({
      office_unit_id: String(asset.office_unit_id || ''),
      asset_type: asset.asset_type || 'Server & Komputasi',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      location_detail: asset.location_detail || 'Ruang Server',
      unit_count: asset.unit_count || 1,
      ip_address: asset.ip_address || '',
      mac_address: asset.mac_address || '',
      status: asset.status || 'Aktif',
      condition: asset.condition || 'Baik',
      ownership: asset.ownership || 'Aset Perusahaan',
      notes: asset.notes || '',
    });
    setActionError('');
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        ...assetFormData,
        office_unit_id: parseInt(assetFormData.office_unit_id, 10),
        unit_count: parseInt(assetFormData.unit_count, 10) || 1,
      };

      if (editingAsset) {
        await updateOfficeAsset(editingAsset.id, payload);
        setActionSuccess('Perangkat internal kantor berhasil diperbarui!');
      } else {
        await createOfficeAsset(payload);
        setActionSuccess('Perangkat internal kantor berhasil ditambahkan!');
      }

      setIsAssetModalOpen(false);
      loadAllData();
      if (activeSubTab === 'table') loadTableAssets();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Gagal menyimpan perangkat kantor');
    }
  };

  const handleDeleteAsset = async (assetId, assetName) => {
    if (!window.confirm(`Yakin ingin menghapus perangkat "${assetName}" dari inventaris internal kantor?`)) return;
    try {
      await deleteOfficeAsset(assetId);
      setActionSuccess('Perangkat berhasil dihapus');
      loadAllData();
      if (activeSubTab === 'table') loadTableAssets();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus perangkat kantor');
    }
  };

  // -------------------------------------------------------------
  // Office Unit Form Handlers
  // -------------------------------------------------------------
  const handleOpenCreateUnit = () => {
    setEditingUnit(null);
    setUnitFormData({
      branch_id: selectedBranchId && selectedBranchId !== 'pusat' ? selectedBranchId : '',
      unit_name: '',
      unit_type: 'Cabang Utama',
      code: '',
      address: '',
      pic_name: '',
      pic_phone: '',
    });
    setActionError('');
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      branch_id: unit.branch_id ? String(unit.branch_id) : '',
      unit_name: unit.unit_name || '',
      unit_type: unit.unit_type || 'Cabang Utama',
      code: unit.code || '',
      address: unit.address || '',
      pic_name: unit.pic_name || '',
      pic_phone: unit.pic_phone || '',
    });
    setActionError('');
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        ...unitFormData,
        branch_id: unitFormData.branch_id ? parseInt(unitFormData.branch_id, 10) : null,
      };

      if (editingUnit) {
        await updateOfficeUnit(editingUnit.id, payload);
        setActionSuccess('Unit kantor berhasil diperbarui!');
      } else {
        await createOfficeUnit(payload);
        setActionSuccess('Unit kantor baru berhasil ditambahkan!');
      }

      setIsUnitModalOpen(false);
      loadAllData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Gagal menyimpan unit kantor');
    }
  };

  const handleDeleteUnit = async (unitId, unitName) => {
    if (!window.confirm(`Yakin ingin menghapus unit kantor "${unitName}"? Unit yang masih memiliki perangkat tidak dapat dihapus.`)) return;
    try {
      await deleteOfficeUnit(unitId);
      setActionSuccess('Unit kantor berhasil dihapus');
      loadAllData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus unit kantor');
    }
  };

  // Convert an office asset to synthetic asset object for QRCodeModal
  const handlePrintQRCode = (officeAsset) => {
    if (!onOpenQRCodeModal) return;
    const syntheticAsset = {
      id: officeAsset.id,
      brand: officeAsset.brand,
      model: officeAsset.model,
      serial_number: officeAsset.serial_number,
      location_detail: officeAsset.location_detail || 'Ruang Server',
      created_at: officeAsset.created_at,
      ownership: officeAsset.ownership || 'Aset Perusahaan',
      category: {
        name: officeAsset.asset_type || 'Server & Komputasi',
      },
      site: {
        id: officeAsset.office_unit?.id || 1,
        site_name: officeAsset.office_unit?.unit_name || 'Kantor Cabang',
        partner_name: 'Rapid Network Internal',
        address: officeAsset.office_unit?.address || '',
        branch: officeAsset.office_unit?.branch || {
          name: officeAsset.office_unit?.unit_name?.includes('Pusat') ? 'Pusat' : 'Cabang',
        },
      },
    };
    onOpenQRCodeModal(syntheticAsset);
  };

  // Export Internal CSV
  const handleExportCSV = () => {
    const data = assetsData.data || [];
    if (data.length === 0) {
      alert('Tidak ada data aset kantor untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Unit Kantor', 'Cabang', 'Tipe Perangkat', 'Brand', 'Model', 'Serial Number', 'IP Address', 'Lokasi/Ruang', 'Status', 'Kondisi', 'Jumlah', 'Catatan'];
    const rows = data.map((a) => [
      a.id,
      `"${a.office_unit?.unit_name || '-'}"`,
      `"${a.office_unit?.branch?.name || 'Pusat'}"`,
      `"${a.asset_type}"`,
      `"${a.brand}"`,
      `"${a.model}"`,
      `"${a.serial_number}"`,
      `"${a.ip_address || '-'}"`,
      `"${a.location_detail || '-'}"`,
      `"${a.status}"`,
      `"${a.condition}"`,
      a.unit_count || 1,
      `"${a.notes || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aset_Internal_Perusahaan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Icon for Asset Type
  const renderAssetTypeIcon = (type) => {
    if (type?.toLowerCase().includes('server')) {
      return <Server className="w-4 h-4 text-cyan-500" />;
    }
    if (type?.toLowerCase().includes('jaringan') || type?.toLowerCase().includes('switch') || type?.toLowerCase().includes('router')) {
      return <Network className="w-4 h-4 text-blue-500" />;
    }
    if (type?.toLowerCase().includes('pc') || type?.toLowerCase().includes('workstation') || type?.toLowerCase().includes('laptop')) {
      return <Laptop className="w-4 h-4 text-emerald-500" />;
    }
    if (type?.toLowerCase().includes('power') || type?.toLowerCase().includes('ups')) {
      return <Zap className="w-4 h-4 text-amber-500" />;
    }
    return <Cpu className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess('')} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner & Title */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 dark:from-blue-950/60 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-blue-500/20 dark:border-blue-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Aset Internal Perusahaan
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Infrastruktur Kantor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inventaris perangkat server, jaringan, dan workstation di Kantor Pusat, Cabang Utama, dan Unit Kantor
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {canEdit && (
            <>
              <button
                type="button"
                onClick={handleOpenCreateUnit}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 transition-all active:scale-95 shadow-xs"
              >
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>+ Unit Kantor</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreateAsset()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Perangkat</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all active:scale-95"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* METRIC CARDS (ISOLATED STATS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Aset Internal */}
        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Aset Internal
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.total_office_assets || 0}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">Unit</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span>Tersebar di</span>
            <strong className="text-slate-700 dark:text-slate-200">{stats?.total_office_units || 0} Kantor Unit</strong>
          </div>
        </div>

        {/* Card 2: Perangkat Server & Komputasi */}
        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Server & Komputasi
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.server_assets || 0}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">Unit</span>
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1">
            Server Fisik & Node Cabang
          </div>
        </div>

        {/* Card 3: Jaringan Kantor */}
        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jaringan Kantor
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.network_assets || 0}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">Unit</span>
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Switch Core, Router & AP
          </div>
        </div>

        {/* Card 4: Status Operasional */}
        <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status Perangkat
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats?.active_assets || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Aktif</span>
            <span className="text-slate-400">•</span>
            <span className="text-base font-bold text-amber-500">{stats?.spare_assets || 0}</span>
            <span className="text-[11px] text-slate-500">Spare</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
            <span>Maintenance: <strong className="text-amber-500">{stats?.maintenance_assets || 0}</strong></span>
            <span>•</span>
            <span>Rusak: <strong className="text-rose-500">{stats?.damaged_assets || 0}</strong></span>
          </div>
        </div>

      </div>

      {/* FILTER & VIEW SELECTOR BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: View Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('hierarchy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'hierarchy'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pohon Hirarki Kantor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Tabel Master Aset</span>
          </button>
        </div>

        {/* Right: Branch & Unit Filter */}
        <div className="flex items-center space-x-2 flex-wrap gap-2 text-xs">
          {/* Branch Filter */}
          <select
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedUnitId('');
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="">Semua Cabang & Pusat</option>
            <option value="pusat">🏢 Kantor Pusat (Head Office)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 Branch {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Unit Filter */}
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="">Semua Unit Kantor</option>
            {unitsList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unit_name} ({u.unit_type})
              </option>
            ))}
          </select>

          {activeSubTab === 'table' && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1.5 transition-all"
              title="Unduh CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: POHON HIRARKI KANTOR (PUSAT -> CABANG -> UNIT -> PERANGKAT)       */}
      {/* ========================================================================= */}
      {activeSubTab === 'hierarchy' && (
        <div className="space-y-4">
          {hierarchyData.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Building className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-500" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada data unit kantor atau perangkat tercatat.</p>
              <p className="text-xs mt-1">Mulai dengan menambahkan Unit Kantor atau klik tombol "+ Unit Kantor" di atas.</p>
            </div>
          ) : (
            hierarchyData.map((branchGroup, gIdx) => {
              const branchKey = `branch_${gIdx}`;
              const isBranchExpanded = expandedNodes[branchKey] !== false;

              return (
                <div
                  key={gIdx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Branch Level Header */}
                  <div
                    onClick={() => toggleNode(branchKey)}
                    className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <button type="button" className="text-slate-400">
                        {isBranchExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {branchGroup.branch_name}
                          </h3>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {branchGroup.branch_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {branchGroup.units?.length || 0} Unit Kantor Tercatat
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {branchGroup.units?.reduce((acc, u) => acc + (u.assets?.length || 0), 0)} Perangkat
                      </span>
                    </div>
                  </div>

                  {/* Office Units Container */}
                  {isBranchExpanded && (
                    <div className="p-4 space-y-4">
                      {branchGroup.units?.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">Belum ada unit kantor di cabang ini.</p>
                      ) : (
                        branchGroup.units.map((unitItem) => {
                          const unit = unitItem.unit;
                          const assets = unitItem.assets || [];
                          const unitKey = `unit_${unit.id}`;
                          const isUnitExpanded = expandedNodes[unitKey] !== false;

                          return (
                            <div
                              key={unit.id}
                              className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden"
                            >
                              {/* Office Unit Header */}
                              <div
                                onClick={() => toggleNode(unitKey)}
                                className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
                              >
                                <div className="flex items-center space-x-2.5">
                                  <button type="button" className="text-slate-400">
                                    {isUnitExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                    {unit.unit_type}
                                  </span>
                                  <div>
                                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                      {unit.unit_name}
                                    </h4>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                                      {unit.code && <span>Kode: <strong className="font-mono">{unit.code}</strong></span>}
                                      {unit.address && <span>• {unit.address}</span>}
                                      {unit.pic_name && <span>• PIC: {unit.pic_name}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {assets.length} Perangkat
                                  </span>
                                  {canEdit && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenCreateAsset(String(unit.id))}
                                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                                        title="Tambah Perangkat di Kantor Ini"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditUnit(unit)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Edit Unit Kantor"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteUnit(unit.id, unit.unit_name)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                        title="Hapus Unit Kantor"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Assets List Inside Unit */}
                              {isUnitExpanded && (
                                <div className="p-3">
                                  {assets.length === 0 ? (
                                    <div className="p-4 text-center text-[11px] text-slate-500">
                                      Belum ada perangkat di unit kantor ini.
                                      {canEdit && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenCreateAsset(String(unit.id))}
                                          className="text-blue-500 font-bold ml-1 hover:underline"
                                        >
                                          + Tambah Perangkat Pertama
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                      {assets.map((asset) => (
                                        <div
                                          key={asset.id}
                                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2 hover:border-blue-500/30 transition-colors"
                                        >
                                          <div className="flex items-start space-x-2.5 min-w-0">
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                                              {renderAssetTypeIcon(asset.asset_type)}
                                            </div>
                                            <div className="min-w-0">
                                              <div className="flex items-center space-x-1.5 truncate">
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                  {asset.brand} - {asset.model}
                                                </h5>
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                  {asset.asset_type}
                                                </span>
                                              </div>
                                              
                                              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5 flex-wrap">
                                                <span>SN: <strong className="font-mono text-slate-700 dark:text-slate-300">{asset.serial_number}</strong></span>
                                                {asset.location_detail && <span>• 📍 {asset.location_detail}</span>}
                                              </div>

                                              {/* Optional IP & VLAN note badge */}
                                              {asset.ip_address && (
                                                <div className="flex items-center space-x-1.5 mt-1">
                                                  <span className="font-mono text-[9px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                                                    IP: {asset.ip_address}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleCopyIP(asset.ip_address)}
                                                    className="text-slate-400 hover:text-cyan-400 text-[10px]"
                                                    title="Salin IP"
                                                  >
                                                    {copiedIP === asset.ip_address ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Status & Actions */}
                                          <div className="flex items-center space-x-1.5 shrink-0">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                                asset.status === 'Aktif'
                                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                  : asset.status === 'Maintenance'
                                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                  : asset.status === 'Spare' || asset.status?.includes('Spare')
                                                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                              }`}
                                            >
                                              {asset.status}
                                            </span>

                                            <button
                                              type="button"
                                              onClick={() => handlePrintQRCode({ ...asset, office_unit: unit })}
                                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                                              title="Cetak Stiker QR Code"
                                            >
                                              <QrCode className="w-3.5 h-3.5" />
                                            </button>

                                            {canEdit && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => handleOpenEditAsset(asset)}
                                                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                                  title="Edit Perangkat"
                                                >
                                                  <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteAsset(asset.id, `${asset.brand} ${asset.model}`)}
                                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                                  title="Hapus Perangkat"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TABEL MASTER ASET KANTOR                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Table Filters Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari brand, model, SN, IP Address, lokasi..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedAssetType}
                onChange={(e) => {
                  setSelectedAssetType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
              >
                <option value="">Semua Tipe Perangkat</option>
                {ASSET_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
              >
                <option value="">Semua Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Unit Kantor</th>
                  <th className="py-3 px-4">Perangkat & Tipe</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">IP Address / Lokasi</th>
                  <th className="py-3 px-4">Status & Kondisi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {assetsData.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data perangkat yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  assetsData.data?.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {asset.office_unit?.unit_name || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <span>{asset.office_unit?.branch?.name || 'Pusat'}</span>
                          <span>•</span>
                          <span className="font-mono">{asset.office_unit?.unit_type}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                            {renderAssetTypeIcon(asset.asset_type)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white">
                              {asset.brand} - {asset.model}
                            </div>
                            <div className="text-[10px] text-slate-500">{asset.asset_type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {asset.serial_number}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {asset.unit_count || 1} Unit
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {asset.ip_address ? (
                          <div className="flex items-center space-x-1">
                            <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                              {asset.ip_address}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyIP(asset.ip_address)}
                              className="text-slate-400 hover:text-cyan-400"
                              title="Salin IP"
                            >
                              {copiedIP === asset.ip_address ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          📍 {asset.location_detail || 'Ruang Server'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              asset.status === 'Aktif'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : asset.status === 'Maintenance'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : asset.status === 'Spare' || asset.status?.includes('Spare')
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {asset.status}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({asset.condition})
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintQRCode(asset)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Cetak Stiker QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditAsset(asset)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Perangkat"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAsset(asset.id, `${asset.brand} ${asset.model}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Hapus Perangkat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {assetsData.total_pages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Halaman {assetsData.page} dari {assetsData.total_pages} (Total {assetsData.total} perangkat)
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={currentPage >= assetsData.total_pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM TAMBAH / EDIT PERANGKAT KANTOR                               */}
      {/* ========================================================================= */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingAsset ? `Edit Perangkat: ${editingAsset.brand} - ${editingAsset.model}` : 'Tambah Perangkat Internal Kantor'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aset perangkat internal perusahaan untuk operasional kantor cabang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold">
                {actionError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveAsset} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Office Unit */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Lokasi Unit Kantor *
                  </label>
                  <select
                    required
                    value={assetFormData.office_unit_id}
                    onChange={(e) => setAssetFormData({ ...assetFormData, office_unit_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    <option value="">-- Pilih Unit Kantor --</option>
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.id}>
                        [{u.branch?.name || 'Pusat'}] {u.unit_name} ({u.unit_type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Type */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tipe Perangkat *
                  </label>
                  <select
                    required
                    value={assetFormData.asset_type}
                    onChange={(e) => setAssetFormData({ ...assetFormData, asset_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    {ASSET_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Merek / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Dell, HP, MikroTik, Cisco, APC"
                    value={assetFormData.brand}
                    onChange={(e) => setAssetFormData({ ...assetFormData, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Model Perangkat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: PowerEdge R740, CCR1036, Catalyst 2960"
                    value={assetFormData.model}
                    onChange={(e) => setAssetFormData({ ...assetFormData, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Serial Number (SN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nomor Seri Perangkat"
                    value={assetFormData.serial_number}
                    onChange={(e) => setAssetFormData({ ...assetFormData, serial_number: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>

                {/* IP Address / VLAN (Optional) */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
                    <span>IP Address / VLAN (Opsional)</span>
                    <span className="text-[10px] text-cyan-500 font-normal">Catatan Teknis</span>
                  </label>
                  <input
                    type="text"
                    placeholder="misal: 192.168.10.2 / VLAN 10"
                    value={assetFormData.ip_address}
                    onChange={(e) => setAssetFormData({ ...assetFormData, ip_address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Location Detail */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Lokasi Ruangan / Rak
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Ruang Server Lt. 2 - Rack A, NOC"
                    value={assetFormData.location_detail}
                    onChange={(e) => setAssetFormData({ ...assetFormData, location_detail: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={assetFormData.status}
                    onChange={(e) => setAssetFormData({ ...assetFormData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Kondisi Fisik
                  </label>
                  <select
                    value={assetFormData.condition}
                    onChange={(e) => setAssetFormData({ ...assetFormData, condition: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Catatan Perangkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan tambahan spesifikasi atau peruntukan perangkat..."
                    value={assetFormData.notes}
                    onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  {editingAsset ? 'Simpan Perubahan' : 'Tambahkan Perangkat'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KELOLA & TAMBAH UNIT KANTOR                                      */}
      {/* ========================================================================= */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingUnit ? `Edit Unit: ${editingUnit.unit_name}` : 'Tambah Unit Kantor Cabang / Pusat'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Struktur lokasi kantor operasional internal perusahaan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold">
                {actionError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveUnit} className="p-4 sm:p-6 space-y-3.5 text-xs">
              
              {/* Branch Association */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Induk Cabang (Branch)
                </label>
                <select
                  value={unitFormData.branch_id}
                  onChange={(e) => setUnitFormData({ ...unitFormData, branch_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                >
                  <option value="">🏢 Kantor Pusat (Head Office / Tanpa Induk Cabang)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Branch {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Type */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Tipe Unit Kantor *
                </label>
                <select
                  required
                  value={unitFormData.unit_type}
                  onChange={(e) => setUnitFormData({ ...unitFormData, unit_type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none"
                >
                  {UNIT_TYPE_OPTIONS.map((ut) => (
                    <option key={ut} value={ut}>
                      {ut}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Name */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nama Unit Kantor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Kantor Cabang Brebes, Kantor Unit Jatibarang"
                  value={unitFormData.unit_name}
                  onChange={(e) => setUnitFormData({ ...unitFormData, unit_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Kode Singkatan Unit (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="misal: KTR-BRB, UNT-JTB, HO-JKT"
                  value={unitFormData.code}
                  onChange={(e) => setUnitFormData({ ...unitFormData, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Alamat Lengkap Kantor
                </label>
                <input
                  type="text"
                  placeholder="Alamat kantor..."
                  value={unitFormData.address}
                  onChange={(e) => setUnitFormData({ ...unitFormData, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* PIC Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama PIC Kantor
                  </label>
                  <input
                    type="text"
                    placeholder="Nama PIC"
                    value={unitFormData.pic_name}
                    onChange={(e) => setUnitFormData({ ...unitFormData, pic_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    No. Kontak PIC
                  </label>
                  <input
                    type="text"
                    placeholder="No. Telp/WA"
                    value={unitFormData.pic_phone}
                    onChange={(e) => setUnitFormData({ ...unitFormData, pic_phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  {editingUnit ? 'Simpan Unit' : 'Tambahkan Unit Kantor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default OfficeAssetManager;
