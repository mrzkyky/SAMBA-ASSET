import React, { useState } from 'react';
import { Building2, MapPin, ChevronDown, ChevronRight, Server, Copy, Check, Edit2, Trash2, Tag, Box, QrCode, Lock, ArrowRightLeft, Layers, Gift } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
        Aktif
      </span>
    );
  }
  if (status === 'Nonaktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
        Nonaktif
      </span>
    );
  }
  if (status === 'Maintenance') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        Maintenance
      </span>
    );
  }
  if (status === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
        Rusak
      </span>
    );
  }
  if (status === 'Retired') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span>
        Retired
      </span>
    );
  }
  if (status === 'Hilang') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
        Hilang
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      {status || 'Aktif'}
    </span>
  );
};

export const ConditionBadge = ({ condition }) => {
  if (condition === 'Baik') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
        Baik
      </span>
    );
  }
  if (condition === 'Perlu Perbaikan') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        Perlu Perbaikan
      </span>
    );
  }
  if (condition === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
        Rusak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
      {condition || 'Baik'}
    </span>
  );
};

export const OwnershipBadge = ({ ownership }) => {
  if (ownership === 'Aset Hibah') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 shadow-sm" title="Aset Hibah ke Mitra/Instansi">
        <Gift className="w-3 h-3 mr-1 text-amber-400" />
        Hibah
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 shadow-sm" title="Aset Tetap Milik Perusahaan">
      <Building2 className="w-3 h-3 mr-1 text-blue-400" />
      Aset Tetap
    </span>
  );
};

export const parseSNList = (rawSN) => {
  if (!rawSN) return [];
  const replaced = rawSN.replace(/\r\n/g, ',').replace(/\n/g, ',').replace(/;/g, ',');
  return replaced.split(',').map((s) => s.trim()).filter(Boolean);
};

const HierarchyView = ({
  user,
  hierarchy,
  branches,
  segments,
  selectedBranch,
  setSelectedBranch,
  selectedSegment,
  setSelectedSegment,
  selectedOwnership,
  setSelectedOwnership,
  onEditAsset,
  onDeleteAsset,
  onOpenQRCodeModal,
  onOpenTransferModal,
  searchQuery,
}) => {
  const [openSites, setOpenSites] = useState({});
  const [copiedSN, setCopiedSN] = useState(null);
  const [expandedSNs, setExpandedSNs] = useState({});

  const isAuditor = user?.role === 'Auditor';
  const isBranchAdmin = user?.role === 'Branch Admin';
  const isBranchScoped = isBranchAdmin || (user?.role !== 'Super Admin' && Boolean(user?.branch_id));

  const toggleSite = (siteId) => {
    setOpenSites((prev) => ({
      ...prev,
      [siteId]: !prev[siteId],
    }));
  };

  const toggleExpandSN = (assetId) => {
    setExpandedSNs((prev) => ({
      ...prev,
      [assetId]: !prev[assetId],
    }));
  };

  const handleCopySN = (e, sn) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sn);
    setCopiedSN(sn);
    setTimeout(() => setCopiedSN(null), 2000);
  };

  const availableBranches = (branches && branches.length > 0)
    ? branches
    : (hierarchy ? hierarchy.map((h) => h.branch).filter(Boolean) : []);

  // Filter hierarchy tree reactively based on selectedSegment and searchQuery
  const filteredHierarchy = (hierarchy || []).map((branchGroup) => {
    const { branch, site_groups } = branchGroup;

    const filteredSiteGroups = (site_groups || []).map((siteGroup) => {
      const { site, category_groups } = siteGroup;

      const filteredCategoryGroups = (category_groups || []).map((catGroup) => {
        const { category, assets } = catGroup;

        const matchingAssets = (assets || []).filter((asset) => {
          // Filter by Segment
          if (selectedSegment && String(asset.segment_id) !== String(selectedSegment)) {
            return false;
          }

          // Filter by Ownership (Aset Tetap vs Aset Hibah)
          if (selectedOwnership && (asset.ownership || 'Aset Tetap') !== selectedOwnership) {
            return false;
          }

          // Global Multi-field Search Filter
          if (!searchQuery || !searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase().trim();

          const matchSN = asset.serial_number && asset.serial_number.toLowerCase().includes(q);
          const matchBrand = asset.brand && asset.brand.toLowerCase().includes(q);
          const matchModel = asset.model && asset.model.toLowerCase().includes(q);
          const matchLocation = asset.location_detail && asset.location_detail.toLowerCase().includes(q);
          const matchNotes = asset.notes && asset.notes.toLowerCase().includes(q);
          const matchStatus = asset.status && asset.status.toLowerCase().includes(q);
          const matchOwnership = (asset.ownership || 'Aset Tetap').toLowerCase().includes(q);
          const matchSegment = asset.segment?.name && asset.segment.name.toLowerCase().includes(q);
          const matchSiteName = site?.site_name && site.site_name.toLowerCase().includes(q);
          const matchPartner = site?.partner_name && site.partner_name.toLowerCase().includes(q);
          const matchAddress = site?.address && site.address.toLowerCase().includes(q);
          const matchCategory = category?.name && category.name.toLowerCase().includes(q);
          const matchBranchName = branch?.name && branch.name.toLowerCase().includes(q);
          const matchBranchCode = branch?.code && branch.code.toLowerCase().includes(q);

          return (
            matchSN ||
            matchBrand ||
            matchModel ||
            matchLocation ||
            matchNotes ||
            matchStatus ||
            matchOwnership ||
            matchSegment ||
            matchSiteName ||
            matchPartner ||
            matchAddress ||
            matchCategory ||
            matchBranchName ||
            matchBranchCode
          );
        });

        return {
          ...catGroup,
          assets: matchingAssets,
        };
      }).filter((catGroup) => catGroup.assets.length > 0);

      const totalMatchingUnits = filteredCategoryGroups.reduce((acc, cat) => {
        return acc + cat.assets.reduce((sum, a) => sum + a.unit_count, 0);
      }, 0);

      return {
        ...siteGroup,
        category_groups: filteredCategoryGroups,
        totalMatchingUnits,
      };
    }).filter((siteGroup) => {
      // If there is an active search, segment filter, or ownership filter, only keep sites with matching devices
      if (searchQuery || selectedSegment || selectedOwnership) {
        return siteGroup.category_groups.length > 0;
      }
      return true;
    });

    return {
      ...branchGroup,
      site_groups: filteredSiteGroups,
    };
  }).filter((branchGroup) => {
    // If there is an active search or segment filter, only keep branches with matching sites
    if (searchQuery || selectedSegment) {
      return branchGroup.site_groups.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* LEVEL 1: Branch & Segment Navigation & Filter */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-cyan-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Level 1: Branch / Cabang Daerah</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 sm:mt-1">Pilih Cabang Utama</h2>
          </div>

          {/* Branch Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {!isBranchScoped && (
              <button
                type="button"
                onClick={() => setSelectedBranch('')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  selectedBranch === ''
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semua Cabang
              </button>
            )}

            {availableBranches.map((b) => (
              <button
                key={b.id}
                type="button"
                disabled={isBranchScoped && String(b.id) !== selectedBranch}
                onClick={() => setSelectedBranch(String(b.id))}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                  selectedBranch === String(b.id)
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {b.name} ({b.code})
              </button>
            ))}
          </div>
        </div>

        {/* Segment Filter Header Tabs */}
        {segments && segments.length > 0 && (
          <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 mr-1 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Filter Segmen:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedSegment('')}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                selectedSegment === ''
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua Segmen
            </button>
            {segments.map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setSelectedSegment(String(seg.id))}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  selectedSegment === String(seg.id)
                    ? 'text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
                style={
                  selectedSegment === String(seg.id)
                    ? { backgroundColor: seg.color || '#8b5cf6', borderColor: seg.color || '#8b5cf6' }
                    : {}
                }
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color || '#8b5cf6' }} />
                <span>{seg.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Ownership Filter Header Tabs */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 mr-1 flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Status Kepemilikan:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedOwnership && setSelectedOwnership('')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              !selectedOwnership
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Kepemilikan
          </button>
          <button
            type="button"
            onClick={() => setSelectedOwnership && setSelectedOwnership('Aset Tetap')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center space-x-1 ${
              selectedOwnership === 'Aset Tetap'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3 h-3 mr-1 text-blue-400" />
            <span>Aset Tetap</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedOwnership && setSelectedOwnership('Aset Hibah')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center space-x-1 ${
              selectedOwnership === 'Aset Hibah'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Gift className="w-3 h-3 mr-1 text-amber-400" />
            <span>Aset Hibah</span>
          </button>
        </div>
      </div>

      {/* Auditor Banner Notification */}
      {isAuditor && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center space-x-2">
          <Lock className="w-4 h-4 shrink-0 text-purple-400" />
          <span>Anda masuk sebagai <strong>Auditor (Read-Only Mode)</strong>. Tombol tambah, edit, dan hapus disembunyikan.</span>
        </div>
      )}

      {/* HIRARKI CONTENT (Level 1 -> Level 2 -> Level 3 -> Level 4) */}
      {filteredHierarchy.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Server className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 text-sm sm:text-base font-semibold">
            {searchQuery ? `Tidak Ada Aset Ditemukan untuk "${searchQuery}"` : 'Tidak Ada Data Aset Ditemukan'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">Coba sesuaikan filter branch atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        filteredHierarchy.map((branchGroup) => {
          const { branch, site_groups } = branchGroup;

          return (
            <div key={branch.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              
              {/* BRANCH HEADER (Level 1 Header) */}
              <div className="p-3.5 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{branch.name}</h3>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {branch.code}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">Provinsi: {branch.province} • {site_groups.length} Site Aktif</p>
                  </div>
                </div>

                {/* Branch-level Expand All / Collapse All Buttons */}
                {site_groups.length > 0 && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const newOpen = { ...openSites };
                        site_groups.forEach((sg) => {
                          newOpen[sg.site.id] = true;
                        });
                        setOpenSites(newOpen);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
                      title="Buka semua dropdown site di cabang ini"
                    >
                      Buka Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newOpen = { ...openSites };
                        site_groups.forEach((sg) => {
                          newOpen[sg.site.id] = false;
                        });
                        setOpenSites(newOpen);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
                      title="Tutup semua dropdown site di cabang ini"
                    >
                      Tutup Semua
                    </button>
                  </div>
                )}
              </div>

              {/* LEVEL 2: Mitra & Site Spesifik Accordions */}
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {site_groups.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">Belum ada site/mitra terdaftar di cabang ini.</p>
                ) : (
                  site_groups.map((siteGroup) => {
                    const { site, category_groups, totalMatchingUnits } = siteGroup;
                    const isOpen = Boolean(openSites[site.id]) || Boolean(searchQuery);

                    return (
                      <div key={site.id} className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
                        
                        {/* SITE ACCORDION HEADER (Level 2) */}
                        <div
                          onClick={() => toggleSite(site.id)}
                          className="w-full p-3 sm:p-4 flex items-center justify-between gap-2 hover:bg-slate-900/60 cursor-pointer transition-colors text-left select-none"
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <div className="shrink-0 text-cyan-400">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="p-1.5 sm:p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                <span className="text-xs font-bold text-cyan-400 break-words">{site.partner_name}</span>
                                <span className="text-slate-600 hidden sm:inline">•</span>
                                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 break-words">{site.site_name}</h4>
                              </div>
                              {site.address && (
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 break-words line-clamp-1">{site.address}</p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                              {totalMatchingUnits} Unit
                            </span>
                          </div>
                        </div>

                        {/* ACCORDION CONTENT (Level 3 Category & Level 4 Assets) */}
                        {isOpen && (
                          <div className="p-3 sm:p-4 border-t border-slate-800/60 bg-slate-900/30 space-y-4 sm:space-y-5">
                            {category_groups.length === 0 ? (
                              <p className="text-xs text-slate-500 italic p-2">
                                Belum ada aset terdaftar pada site ini.
                              </p>
                            ) : (
                              category_groups.map((catGroup) => {
                                const { category, assets: filteredAssets } = catGroup;

                                if (filteredAssets.length === 0) return null;

                                return (
                                  <div key={category.id} className="space-y-2.5 sm:space-y-3">
                                    
                                    {/* LEVEL 3: Category Badge Header */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                        Level 3: Kategori {category.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        ({filteredAssets.length} tipe model)
                                      </span>
                                    </div>

                                    {/* LEVEL 4: Asset Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                      {filteredAssets.map((asset) => {
                                        const snList = parseSNList(asset.serial_number);
                                        const isExpanded = expandedSNs[asset.id];
                                        const displaySNs = isExpanded ? snList : snList.slice(0, 3);
                                        const segmentName = asset.segment?.name || 'Umum';
                                        const segmentColor = asset.segment?.color || '#64748b';

                                        return (
                                          <div
                                            key={asset.id}
                                            className="p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 relative group shadow-sm"
                                          >
                                            {/* Card Top: Brand/Model on left & Status/Condition on right */}
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1">
                                                  <span className="text-xs font-bold text-cyan-400 break-words">{asset.brand}</span>
                                                  <span className="text-slate-600">/</span>
                                                  <span className="text-xs font-semibold text-slate-200 break-words">{asset.model}</span>
                                                </div>
                                              </div>
                                              <div className="flex flex-wrap items-center gap-1 justify-end shrink-0 max-w-[50%]">
                                                <StatusBadge status={asset.status} />
                                                <ConditionBadge condition={asset.condition} />
                                              </div>
                                            </div>

                                            {/* Badges: Ownership, Segment, Asset Type */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <OwnershipBadge ownership={asset.ownership} />
                                              <span
                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                                                style={{
                                                  backgroundColor: `${segmentColor}18`,
                                                  color: segmentColor,
                                                  border: `1px solid ${segmentColor}35`,
                                                }}
                                              >
                                                <span
                                                  className="w-1.5 h-1.5 rounded-full mr-1"
                                                  style={{ backgroundColor: segmentColor }}
                                                />
                                                {segmentName}
                                              </span>
                                              {asset.asset_type && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                                                  {asset.asset_type}
                                                </span>
                                              )}
                                            </div>

                                            {/* Location Detail on its own clear line */}
                                            <div className="flex items-start text-[11px] text-slate-400">
                                              <Box className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0 mt-0.5" />
                                              <span className="text-slate-300 font-medium break-words leading-snug">
                                                {asset.location_detail || 'Main Rack'}
                                              </span>
                                            </div>

                                            {/* Multi-SN List Display */}
                                            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 pb-1">
                                                <span>Daftar Serial Number ({snList.length}):</span>
                                                {snList.length > 3 && (
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleExpandSN(asset.id)}
                                                    className="text-cyan-400 hover:underline text-[10px]"
                                                  >
                                                    {isExpanded ? 'Sembunyikan' : `+${snList.length - 3} lainnya`}
                                                  </button>
                                                )}
                                              </div>

                                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {displaySNs.map((sn, idx) => (
                                                  <div key={idx} className="flex items-center justify-between font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60">
                                                    <span className="text-cyan-400 font-semibold truncate max-w-[170px] sm:max-w-[180px]">{sn}</span>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => handleCopySN(e, sn)}
                                                      className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
                                                      title="Copy SN ini"
                                                    >
                                                      {copiedSN === sn ? (
                                                        <Check className="w-3 h-3 text-emerald-400" />
                                                      ) : (
                                                        <Copy className="w-3 h-3" />
                                                      )}
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Actions: QR, Mutasi, Edit/Delete */}
                                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-900 text-xs">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-[11px] text-slate-400">
                                                  Jumlah: <strong className="text-slate-200">{asset.unit_count} Unit</strong>
                                                </span>
                                                {asset.updated_at && (
                                                  <span className="text-[10px] text-slate-500 hidden sm:inline" title={`Terakhir diupdate: ${new Date(asset.updated_at).toLocaleString('id-ID')}`}>
                                                    • Update: {new Date(asset.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex items-center space-x-1 shrink-0">
                                                {/* QR Print Button */}
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenQRCodeModal(asset);
                                                  }}
                                                  className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 text-[11px] font-semibold flex items-center space-x-1 transition-all active:scale-95 shadow-sm"
                                                  title="Cetak Stiker QR Code"
                                                >
                                                  <QrCode className="w-3.5 h-3.5" />
                                                  <span>Cetak QR</span>
                                                </button>

                                                {!isAuditor && (
                                                  <>
                                                    {/* Mutasi Asset Button */}
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenTransferModal(asset);
                                                      }}
                                                      className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95"
                                                      title="Mutasi / Pindahkan Perangkat"
                                                    >
                                                      <ArrowRightLeft className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditAsset(asset);
                                                      }}
                                                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all active:scale-95"
                                                      title="Edit Aset"
                                                    >
                                                      <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteAsset(asset.id);
                                                      }}
                                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all active:scale-95"
                                                      title="Hapus Aset"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            </div>

                                            {asset.notes && (
                                              <div className="text-[11px] text-slate-400 italic bg-slate-950/70 border border-slate-800/80 p-2 rounded-lg whitespace-pre-wrap break-words leading-relaxed">
                                                "{asset.notes}"
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
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
            </div>
          );
        })
      )}
    </div>
  );
};

export default HierarchyView;
