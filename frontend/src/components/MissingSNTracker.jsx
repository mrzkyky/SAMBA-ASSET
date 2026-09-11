import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  MapPin,
  Building2,
  Search,
  Download,
  Edit2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Tag,
  Layers,
  Box,
  ExternalLink,
} from 'lucide-react';
import { getMissingSNSites } from '../api';

export const isMissingSN = (sn) => {
  if (!sn) return true;
  const cleaned = sn.trim().toLowerCase();
  if (cleaned === '' || cleaned === '-' || cleaned === '--' || cleaned === '---') return true;
  if (
    cleaned === 'none' ||
    cleaned === 'null' ||
    cleaned === 'n/a' ||
    cleaned === 'na' ||
    cleaned === 'tidak ada' ||
    cleaned === 'tdk ada' ||
    cleaned === 'belum ada'
  ) {
    return true;
  }
  const parts = cleaned.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return true;
  return parts.every(
    (p) =>
      p === 'none' ||
      p === '-' ||
      p === '--' ||
      p === 'null' ||
      p === 'n/a' ||
      p === 'na' ||
      p === 'tidak ada' ||
      p === 'tdk ada'
  );
};

const MissingSNTracker = ({
  user,
  branches = [],
  selectedBranch = '',
  setSelectedBranch,
  onEditAsset,
  onOpenSpreadsheet,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSites, setOpenSites] = useState({});

  const isAuditor = user?.role === 'Auditor';
  const isBranchScoped = user?.role === 'Branch Admin' || (user?.role !== 'Super Admin' && Boolean(user?.branch_id));
  const currentBranch = branches?.find((b) => String(b.id) === String(selectedBranch));

  const fetchTrackerData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMissingSNSites({
        branch_id: selectedBranch || undefined,
        q: searchQuery.trim() || undefined,
      });
      setData(res.data || []);
      // Default: open all sites so user can see them immediately
      const initialOpen = {};
      (res.data || []).forEach((item) => {
        initialOpen[item.site.id] = true;
      });
      setOpenSites(initialOpen);
    } catch (err) {
      console.error('Gagal mengambil data pelacak SN:', err);
      setError(err.response?.data?.error || 'Gagal memuat data pelacak SN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, [selectedBranch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrackerData();
  };

  const toggleSite = (siteId) => {
    setOpenSites((prev) => ({
      ...prev,
      [siteId]: !prev[siteId],
    }));
  };

  const expandAll = () => {
    const all = {};
    data.forEach((item) => {
      all[item.site.id] = true;
    });
    setOpenSites(all);
  };

  const collapseAll = () => {
    setOpenSites({});
  };

  // Stats calculation
  const totalSites = data.length;
  const totalMissingAssets = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.assets?.length || 0), 0);
  }, [data]);

  // Export CSV of missing SN list for field technicians
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    const headers = [
      'Cabang',
      'Kode Cabang',
      'Nama Site',
      'Mitra / Partner',
      'Alamat Site',
      'ID Aset',
      'Merek',
      'Model / Tipe',
      'Kategori',
      'Segmen Layanan',
      'Serial Number Saat Ini',
      'Lokasi Detail / Rak',
      'Unit',
      'Status',
      'Kondisi',
      'Catatan',
    ];

    const rows = [];
    data.forEach((item) => {
      const branchName = item.branch?.name || '-';
      const branchCode = item.branch?.code || '-';
      const siteName = item.site?.site_name || '-';
      const partnerName = item.site?.partner_name || '-';
      const address = item.site?.address || '-';

      (item.assets || []).forEach((asset) => {
        rows.push([
          `"${branchName.replace(/"/g, '""')}"`,
          `"${branchCode.replace(/"/g, '""')}"`,
          `"${siteName.replace(/"/g, '""')}"`,
          `"${partnerName.replace(/"/g, '""')}"`,
          `"${address.replace(/"/g, '""')}"`,
          asset.id,
          `"${(asset.brand || '').replace(/"/g, '""')}"`,
          `"${(asset.model || '').replace(/"/g, '""')}"`,
          `"${(asset.category?.name || '').replace(/"/g, '""')}"`,
          `"${(asset.segment?.name || '').replace(/"/g, '""')}"`,
          `"${(asset.serial_number || '').replace(/"/g, '""')}"`,
          `"${(asset.location_detail || '').replace(/"/g, '""')}"`,
          asset.unit_count || 1,
          `"${(asset.status || '').replace(/"/g, '""')}"`,
          `"${(asset.condition || '').replace(/"/g, '""')}"`,
          `"${(asset.notes || '').replace(/"/g, '""')}"`,
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = `Laporan_Audit_SN_Kosong_${currentBranch ? currentBranch.name.replace(/\s+/g, '_') : 'Nasional'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Sites Affected */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-slate-900/90 dark:to-amber-950/30 border border-amber-200 dark:border-amber-500/30 shadow-sm dark:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Site & Mitra Belum Lengkap</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-2">
                {totalSites}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Site Terdeteksi</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Memiliki perangkat ber-SN <code className="bg-amber-100/70 dark:bg-transparent text-amber-800 dark:text-amber-300 font-mono text-[11px] px-1 py-0.5 rounded">None</code>,{' '}
                <code className="bg-amber-100/70 dark:bg-transparent text-amber-800 dark:text-amber-300 font-mono text-[11px] px-1 py-0.5 rounded">none</code>, atau{' '}
                <code className="bg-amber-100/70 dark:bg-transparent text-amber-800 dark:text-amber-300 font-mono text-[11px] px-1 py-0.5 rounded">-</code>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Assets Missing SN */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 dark:from-slate-900/90 dark:to-rose-950/30 border border-rose-200 dark:border-rose-500/30 shadow-sm dark:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Perangkat Perlu Serial Number</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-2">
                {totalMissingAssets}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Unit Perangkat</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perlu disurvei & dilengkapi nomor serial fisiknya</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Scope Info & Quick Actions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Cakupan Wilayah</p>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {currentBranch ? `Cabang ${currentBranch.name} (${currentBranch.code})` : 'Seluruh Wilayah (Nasional)'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentBranch?.province ? `Provinsi: ${currentBranch.province}` : 'Mencakup seluruh site aktif'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={totalSites === 0}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              title="Unduh Lembar Kerja Audit Lapangan CSV"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Audit CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchTrackerData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-xs font-semibold transition-all"
              title="Muat Ulang Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar: Branch Filter & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama site, mitra, merek, atau tipe perangkat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-24 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Branch Filter */}
          <select
            disabled={isBranchScoped}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-60 flex-1 sm:flex-initial"
          >
            <option value="">Semua Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Toggle Expand / Collapse */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
              title="Buka Semua Site"
            >
              Buka Semua
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
              title="Tutup Semua Site"
            >
              Tutup Semua
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Site List */}
      {loading ? (
        <div className="py-20 text-center rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sedang memindai perangkat tanpa Serial Number...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={fetchTrackerData}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all shadow-sm"
          >
            Coba Lagi
          </button>
        </div>
      ) : data.length === 0 ? (
        /* Empty State: All devices have valid SNs! */
        <div className="p-12 rounded-2xl bg-emerald-50/50 dark:bg-gradient-to-b dark:from-emerald-950/20 dark:to-slate-900/90 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Semua Perangkat Sudah Ber-Serial Number!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan site atau mitra dengan Serial Number bernilai <code className="text-emerald-600 dark:text-emerald-400 font-semibold">None</code>,{' '}
              <code className="text-emerald-600 dark:text-emerald-400 font-semibold">none</code>, atau <code className="text-emerald-600 dark:text-emerald-400 font-semibold">-</code>{' '}
              {currentBranch ? `di Cabang ${currentBranch.name}` : 'di seluruh wilayah'}.
            </p>
          </div>
        </div>
      ) : (
        /* Site Cards Accordion */
        <div className="space-y-4">
          {data.map((item) => {
            const site = item.site;
            const branch = item.branch;
            const assets = item.assets || [];
            const isOpen = Boolean(openSites[site.id]);

            return (
              <div
                key={site.id}
                className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Site Header Accordion Bar */}
                <div
                  onClick={() => toggleSite(site.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {site.site_name}
                        </h3>
                        {site.partner_name && site.partner_name !== site.site_name && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            ({site.partner_name})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 shrink-0">
                          {branch.name} ({branch.code})
                        </span>
                      </div>
                      {site.address && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{site.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{assets.length} Perlu SN</span>
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      aria-label="Toggle Detail"
                    >
                      {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Device Table */}
                {isOpen && (
                  <div className="border-t border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 bg-slate-50/40 dark:bg-slate-950/20 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Daftar Perangkat di {site.site_name} yang Belum Ada SN:
                      </span>
                      <span className="text-[11px]">
                        Klik tombol <strong>"Lengkapi SN"</strong> untuk mengisi nomor seri
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
                      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Merek & Tipe</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Segmen</th>
                            <th className="py-2.5 px-3">Status SN Saat Ini</th>
                            <th className="py-2.5 px-3">Lokasi / Rak</th>
                            <th className="py-2.5 px-3 text-center">Unit</th>
                            <th className="py-2.5 px-3 text-center">Kondisi</th>
                            {!isAuditor && <th className="py-2.5 px-3 text-right">Aksi</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                                #{asset.id}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">{asset.brand}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">{asset.model}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                                {asset.category?.name || '-'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                                  style={{
                                    backgroundColor: (asset.segment?.color || '#06b6d4') + '20',
                                    color: asset.segment?.color || '#06b6d4',
                                  }}
                                >
                                  {asset.segment?.name || 'Umum'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {asset.serial_number || '(Kosong)'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                                {asset.location_detail || 'Main Rack'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                                {asset.unit_count || 1}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    asset.condition === 'Baik'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                  }`}
                                >
                                  {asset.condition || 'Baik'}
                                </span>
                              </td>
                              {!isAuditor && (
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => onEditAsset(asset)}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 dark:text-cyan-400 dark:border-cyan-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
                                    title="Isi atau Perbarui Serial Number"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Lengkapi SN</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MissingSNTracker;
