import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, Copy, Check, QrCode, ArrowRightLeft, Building2, Gift, AlertTriangle } from 'lucide-react';
import { parseSNList } from './HierarchyView';
import { isMissingSN } from './MissingSNTracker';

export const StatusBadge = ({ status }) => {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5 animate-pulse"></span>
        Aktif
      </span>
    );
  }
  if (status === 'Nonaktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-[#829A8F] border border-slate-200 dark:border-slate-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
        Nonaktif
      </span>
    );
  }
  if (status === 'Maintenance') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5"></span>
        Maintenance
      </span>
    );
  }
  if (status === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mr-1.5"></span>
        Rusak
      </span>
    );
  }
  if (status === 'Retired') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 mr-1.5"></span>
        Retired
      </span>
    );
  }
  if (status === 'Hilang') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 mr-1.5"></span>
        Hilang
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#1D332E] text-slate-700 dark:text-[#B8CCC3] border border-slate-200 dark:border-[#355047]">
      {status || 'Aktif'}
    </span>
  );
};

export const ConditionBadge = ({ condition }) => {
  if (condition === 'Baik') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5"></span>
        Baik
      </span>
    );
  }
  if (condition === 'Perlu Perbaikan') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5"></span>
        Perlu Perbaikan
      </span>
    );
  }
  if (condition === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mr-1.5"></span>
        Rusak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#1D332E] text-slate-700 dark:text-[#B8CCC3] border border-slate-200 dark:border-[#355047] shadow-sm">
      {condition || 'Baik'}
    </span>
  );
};

export const OwnershipBadge = ({ ownership }) => {
  if (ownership === 'Aset Hibah') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-sm" title="Aset Hibah ke Mitra/Instansi">
        <Gift className="w-3 h-3 mr-1 text-amber-500 dark:text-amber-400" />
        Hibah
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-[#8DD6BB] border border-blue-500/20 shadow-sm" title="Aset Tetap Milik Perusahaan">
      <Building2 className="w-3 h-3 mr-1 text-blue-500 dark:text-[#8DD6BB]" />
      Aset Tetap
    </span>
  );
};

const AssetTable = ({
  user,
  assets,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  searchQuery,
  setSearchQuery,
  selectedBranch,
  setSelectedBranch,
  selectedCategory,
  setSelectedCategory,
  selectedSegment,
  setSelectedSegment,
  selectedStatus,
  setSelectedStatus,
  selectedOwnership,
  setSelectedOwnership,
  filterMissingSN = '',
  setFilterMissingSN,
  branches,
  categories,
  segments,
  onEditAsset,
  onDeleteAsset,
  onOpenQRCodeModal,
  onOpenTransferModal,
}) => {
  const [copiedSN, setCopiedSN] = useState(null);

  const isAuditor = user?.role === 'Auditor';
  const isBranchAdmin = user?.role === 'Branch Admin';
  const isBranchScoped = isBranchAdmin || (user?.role !== 'Super Admin' && user?.role !== 'Super User' && user?.username !== 'admin' && Boolean(user?.branch_id));
  const currentBranch = branches?.find((b) => String(b.id) === String(selectedBranch));

  const handleCopy = (sn) => {
    navigator.clipboard.writeText(sn);
    setCopiedSN(sn);
    setTimeout(() => setCopiedSN(null), 2000);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1D332E] border border-slate-200/80 dark:border-[#355047] shadow-sm dark:shadow-xl overflow-hidden">
      
      {/* Table Filters & Toolbar */}
      <div className="p-5 border-b border-slate-200 dark:border-[#355047] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F2] flex items-center space-x-2">
            <span>{currentBranch ? `Daftar Master Aset Cabang ${currentBranch.name}` : 'Daftar Master Aset Nasional'}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1D332E] text-[#0F766E] dark:text-[#8DD6BB] font-semibold border border-slate-200 dark:border-transparent">
              {total} Total Rekord
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter */}
            <select
              disabled={isBranchScoped}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-xs text-slate-700 dark:text-[#F1F5F2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E] disabled:opacity-60"
            >
              <option value="">Semua Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            {/* Segment Filter (Kemitraan, POP, Local Loop, Corporate) */}
            <select
              value={selectedSegment || ''}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="bg-slate-50 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-xs text-violet-700 dark:text-violet-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="">Semua Segmen Layanan</option>
              {segments?.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-xs text-slate-700 dark:text-[#F1F5F2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-xs text-slate-700 dark:text-[#F1F5F2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E]"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
              <option value="Retired">Retired</option>
              <option value="Hilang">Hilang</option>
            </select>

            {/* Ownership Filter */}
            <select
              value={selectedOwnership}
              onChange={(e) => setSelectedOwnership(e.target.value)}
              className="bg-slate-50 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-xs text-slate-700 dark:text-[#F1F5F2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E]"
            >
              <option value="">Semua Kepemilikan</option>
              <option value="Aset Tetap">🏢 Aset Tetap</option>
              <option value="Aset Hibah">🎁 Aset Hibah</option>
            </select>

            {/* Serial Number Status Filter */}
            {setFilterMissingSN && (
              <select
                value={filterMissingSN || ''}
                onChange={(e) => setFilterMissingSN(e.target.value)}
                className={`border text-xs rounded-xl px-3 py-2 focus:outline-none transition-all font-semibold ${
                  filterMissingSN === 'true'
                    ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-[#142522] border-slate-200 dark:border-[#355047] text-slate-700 dark:text-[#F1F5F2] focus:border-[#0F766E]'
                }`}
              >
                <option value="">Semua Status SN</option>
                <option value="true">⚠️ Tanpa SN (None / -)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-[#B8CCC3]">
          <thead className="bg-slate-50 dark:bg-[#142522] text-slate-600 dark:text-[#829A8F] font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-[#355047]">
            <tr>
              <th className="py-3.5 px-4">Info Branch / Site</th>
              <th className="py-3.5 px-4">Segmen Layanan</th>
              <th className="py-3.5 px-4">Kategori & Jenis</th>
              <th className="py-3.5 px-4">Merek & Tipe</th>
              <th className="py-3.5 px-4">Daftar Serial Number</th>
              <th className="py-3.5 px-4">Lokasi & Catatan</th>
              <th className="py-3.5 px-4 text-center">Unit</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Kondisi</th>
              <th className="py-3.5 px-4 text-center">Kepemilikan</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#355047]/60 bg-white dark:bg-[#1D332E]">
            {assets.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-12 text-center text-slate-400 dark:text-[#829A8F]">
                  Tidak ada aset yang memenuhi kriteria filter.
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const siteName = asset.site?.site_name || '-';
                const partnerName = asset.site?.partner_name || '-';
                const branchName = asset.site?.branch?.name || '-';
                const categoryName = asset.category?.name || '-';
                const segmentName = asset.segment?.name || 'Umum';
                const segmentColor = asset.segment?.color || '#718078';
                const assetType = asset.asset_type || 'Aktif';
                const snList = parseSNList(asset.serial_number);

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-[#2B4840]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-[#F1F5F2]">{partnerName} - {siteName}</div>
                      <div className="text-[11px] text-slate-500">{branchName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
                        style={{
                          backgroundColor: `${segmentColor}15`,
                          color: segmentColor,
                          border: `1px solid ${segmentColor}40`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: segmentColor }} />
                        {segmentName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1 items-start">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                          {categoryName}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#DDF3EC] text-[#0F766E] border-[#BBE5D7] dark:bg-[#31584C]/40 dark:text-[#8DD6BB] dark:border-[#0F766E]/20">
                          {assetType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-[#F1F5F2]">{asset.brand}</div>
                      <div className="text-[11px] text-slate-500 dark:text-[#829A8F]">{asset.model}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono max-w-xs">
                      {isMissingSN(asset.serial_number) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          {snList[0] || 'None / Kosong'}
                        </span>
                      ) : snList.length <= 1 ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#0F766E] dark:text-[#8DD6BB] font-semibold">{snList[0] || '-'}</span>
                          {snList[0] && (
                            <button
                              type="button"
                              onClick={() => handleCopy(snList[0])}
                              className="p-1 text-slate-400 hover:text-[#0F766E] dark:text-[#829A8F] dark:hover:text-[#8DD6BB] transition-colors active:scale-95"
                              title="Copy SN"
                            >
                              {copiedSN === snList[0] ? (
                                <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[10px] text-[#0F766E] dark:text-[#8DD6BB] font-bold uppercase tracking-wider">
                            {snList.length} Serial Number Terdaftar:
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {snList.map((sn, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#142522] border border-slate-200 dark:border-[#355047] text-[11px] text-[#0F766E] dark:text-[#8DD6BB] font-semibold"
                              >
                                <span>{sn}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(sn)}
                                  className="text-slate-400 hover:text-[#0F766E] dark:text-[#829A8F] dark:hover:text-[#8DD6BB]"
                                  title="Copy SN ini"
                                >
                                  {copiedSN === sn ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#829A8F] max-w-xs">
                      {asset.building && (
                        <div className="inline-flex items-center text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-1.5 py-0.5 rounded mb-1">
                          🏢 {asset.building}
                        </div>
                      )}
                      <div className="font-medium text-slate-700 dark:text-[#B8CCC3]">{asset.location_detail || 'Main Rack'}</div>
                      {asset.notes && (
                        <div className="text-[11px] text-slate-600 dark:text-[#829A8F] italic mt-1 bg-slate-50 dark:bg-[#142522]/70 p-1.5 rounded border border-slate-200 dark:border-[#355047] whitespace-pre-wrap break-words leading-relaxed">
                          "{asset.notes}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-[#F1F5F2]">
                      {asset.unit_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ConditionBadge condition={asset.condition} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <OwnershipBadge ownership={asset.ownership} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* QR Print Button */}
                        <button
                          type="button"
                          onClick={() => onOpenQRCodeModal(asset)}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/20 transition-colors active:scale-95"
                          title="Cetak Stiker QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {!isAuditor && (
                          <>
                            {/* Mutasi Asset Button */}
                            <button
                              type="button"
                              onClick={() => onOpenTransferModal(asset)}
                              className="p-1.5 rounded-lg text-[#0F766E] hover:bg-[#DDF3EC] dark:text-[#8DD6BB] dark:hover:bg-[#31584C]/40 transition-colors active:scale-95"
                              title="Mutasi / Pindahkan Perangkat"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditAsset(asset)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F766E] hover:bg-slate-100 dark:text-[#829A8F] dark:hover:text-[#8DD6BB] dark:hover:bg-[#2B4840] transition-colors active:scale-95"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAsset(asset.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-[#829A8F] dark:hover:text-rose-400 dark:hover:bg-[#2B4840] transition-colors active:scale-95"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-[#355047] flex items-center justify-between text-xs text-slate-500 dark:text-[#829A8F] bg-slate-50 dark:bg-[#142522]">
        <div>
          Menampilkan halaman <strong className="text-slate-700 dark:text-[#F1F5F2]">{page}</strong> dari{' '}
          <strong className="text-slate-700 dark:text-[#F1F5F2]">{totalPages || 1}</strong> ({total} total aset)
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] text-slate-600 dark:text-[#B8CCC3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#2B4840] transition-colors active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] font-semibold text-slate-700 dark:text-[#F1F5F2] shadow-sm">
            {page}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-white dark:bg-[#172A27] border border-slate-200 dark:border-[#355047] text-slate-600 dark:text-[#B8CCC3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-[#2B4840] transition-colors active:scale-95 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
