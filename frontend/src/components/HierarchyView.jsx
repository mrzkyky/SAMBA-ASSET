import React, { useState } from 'react';
import { Building2, MapPin, ChevronDown, ChevronRight, Server, Copy, Check, Edit2, Trash2, Tag, Box, QrCode, Lock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
        Aktif
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
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
      Cadangan
    </span>
  );
};

const HierarchyView = ({
  user,
  hierarchy,
  branches,
  selectedBranch,
  setSelectedBranch,
  onEditAsset,
  onDeleteAsset,
  onOpenQRCodeModal,
  searchQuery,
}) => {
  const [openSites, setOpenSites] = useState({});
  const [copiedSN, setCopiedSN] = useState(null);

  const isAuditor = user?.role === 'Auditor';
  const isBranchAdmin = user?.role === 'Branch Admin';

  const toggleSite = (siteId) => {
    setOpenSites((prev) => ({
      ...prev,
      [siteId]: !prev[siteId],
    }));
  };

  const handleCopySN = (sn) => {
    navigator.clipboard.writeText(sn);
    setCopiedSN(sn);
    setTimeout(() => setCopiedSN(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* LEVEL 1: Branch Navigation & Filter */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Level 1: Branch / Cabang Daerah</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Pilih Cabang Utama</h2>
          </div>

          {/* Branch Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {!isBranchAdmin && (
              <button
                onClick={() => setSelectedBranch('')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedBranch === ''
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                Semua Branch
              </button>
            )}
            {branches.map((b) => {
              if (isBranchAdmin && String(user?.branch_id) !== String(b.id)) return null;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(String(b.id))}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    String(selectedBranch) === String(b.id)
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                  }`}
                >
                  {b.name} ({b.code})
                </button>
              );
            })}
          </div>
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
      {hierarchy.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-semibold">Tidak Ada Data Aset Ditemukan</h3>
          <p className="text-slate-500 text-xs mt-1">Coba sesuaikan filter branch atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        hierarchy.map((branchGroup) => {
          const { branch, site_groups } = branchGroup;

          return (
            <div key={branch.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              
              {/* BRANCH HEADER (Level 1 Header) */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{branch.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {branch.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Provinsi: {branch.province} • {site_groups.length} Site Spesifik</p>
                  </div>
                </div>
              </div>

              {/* LEVEL 2: Mitra & Site Spesifik Accordions */}
              <div className="p-4 sm:p-6 space-y-4">
                {site_groups.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">Belum ada site/mitra terdaftar di cabang ini.</p>
                ) : (
                  site_groups.map((siteGroup) => {
                    const { site, category_groups } = siteGroup;
                    const isOpen = openSites[site.id] !== false; // Open by default

                    const totalSiteAssets = category_groups.reduce(
                      (acc, cat) => acc + cat.assets.reduce((sum, a) => sum + a.unit_count, 0),
                      0
                    );

                    return (
                      <div key={site.id} className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
                        
                        {/* SITE ACCORDION HEADER (Level 2) */}
                        <button
                          onClick={() => toggleSite(site.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3">
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-cyan-400">{site.partner_name}</span>
                                <span className="text-slate-600">•</span>
                                <h4 className="text-sm font-semibold text-slate-200">{site.site_name}</h4>
                              </div>
                              {site.address && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{site.address}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {totalSiteAssets} Unit Perangkat
                            </span>
                          </div>
                        </button>

                        {/* ACCORDION CONTENT (Level 3 Category & Level 4 Assets) */}
                        {isOpen && (
                          <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 space-y-5">
                            {category_groups.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">Belum ada aset terdaftar pada site ini.</p>
                            ) : (
                              category_groups.map((catGroup) => {
                                const { category, assets } = catGroup;

                                const filteredAssets = assets.filter((a) => {
                                  if (!searchQuery) return true;
                                  const q = searchQuery.toLowerCase();
                                  return (
                                    a.serial_number.toLowerCase().includes(q) ||
                                    a.brand.toLowerCase().includes(q) ||
                                    a.model.toLowerCase().includes(q) ||
                                    (a.notes && a.notes.toLowerCase().includes(q))
                                  );
                                });

                                if (filteredAssets.length === 0) return null;

                                return (
                                  <div key={category.id} className="space-y-3">
                                    
                                    {/* LEVEL 3: Category Badge Header */}
                                    <div className="flex items-center space-x-2">
                                      <Tag className="w-3.5 h-3.5 text-purple-400" />
                                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                        Level 3: Kategori {category.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        ({filteredAssets.length} tipe model)
                                      </span>
                                    </div>

                                    {/* LEVEL 4: Asset Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {filteredAssets.map((asset) => (
                                        <div
                                          key={asset.id}
                                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative group shadow-sm"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-cyan-400">{asset.brand}</span>
                                                <span className="text-slate-600">/</span>
                                                <span className="text-xs font-semibold text-slate-200">{asset.model}</span>
                                              </div>
                                              <p className="text-[11px] text-slate-400 mt-1 flex items-center">
                                                <Box className="w-3 h-3 mr-1 text-slate-500" />
                                                Rak: <span className="text-slate-300 ml-1 font-medium">{asset.location_detail}</span>
                                              </p>
                                            </div>
                                            <StatusBadge status={asset.status} />
                                          </div>

                                          {/* Serial Number & Copy Button */}
                                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                            <div className="font-mono text-slate-300 text-[11px] truncate">
                                              SN: <strong className="text-white">{asset.serial_number}</strong>
                                            </div>
                                            <button
                                              onClick={() => handleCopySN(asset.serial_number)}
                                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                                              title="Salin Serial Number"
                                            >
                                              {copiedSN === asset.serial_number ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                          </div>

                                          {/* Actions: QR Button + Edit/Delete */}
                                          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                                            <span className="text-[11px] text-slate-500">
                                              Jumlah: <strong className="text-slate-300">{asset.unit_count} Unit</strong>
                                            </span>

                                            <div className="flex items-center space-x-1">
                                              {/* QR Sticker Print Button */}
                                              <button
                                                onClick={() => onOpenQRCodeModal(asset)}
                                                className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                                                title="Cetak Stiker QR Code"
                                              >
                                                <QrCode className="w-3.5 h-3.5" />
                                                <span>Cetak QR</span>
                                              </button>

                                              {!isAuditor && (
                                                <>
                                                  <button
                                                    onClick={() => onEditAsset(asset)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                                                    title="Edit Aset"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => onDeleteAsset(asset.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
                                                    title="Hapus Aset"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>

                                          {asset.notes && (
                                            <p className="text-[11px] text-slate-500 italic line-clamp-1 bg-slate-900/40 px-2 py-1 rounded">
                                              "{asset.notes}"
                                            </p>
                                          )}
                                        </div>
                                      ))}
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
