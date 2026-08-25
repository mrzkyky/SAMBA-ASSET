import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, Copy, Check, QrCode, ArrowRightLeft } from 'lucide-react';
import { parseSNList } from './HierarchyView';

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
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Baik
      </span>
    );
  }
  if (condition === 'Perlu Perbaikan') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Perlu Perbaikan
      </span>
    );
  }
  if (condition === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Rusak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      {condition || 'Baik'}
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
  const isBranchScoped = isBranchAdmin || (user?.role !== 'Super Admin' && Boolean(user?.branch_id));
  const currentBranch = branches?.find((b) => String(b.id) === String(selectedBranch));

  const handleCopy = (sn) => {
    navigator.clipboard.writeText(sn);
    setCopiedSN(sn);
    setTimeout(() => setCopiedSN(null), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Table Filters & Toolbar */}
      <div className="p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{currentBranch ? `Daftar Master Aset Cabang ${currentBranch.name}` : 'Daftar Master Aset Nasional'}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">
              {total} Total Rekord
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter */}
            <select
              disabled={isBranchScoped}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
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
              className="bg-slate-950 border border-slate-800 text-xs text-violet-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-medium"
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
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
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
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rusak">Rusak</option>
              <option value="Retired">Retired</option>
              <option value="Hilang">Hilang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Info Branch / Site</th>
              <th className="py-3.5 px-4">Segmen Layanan</th>
              <th className="py-3.5 px-4">Kategori & Jenis</th>
              <th className="py-3.5 px-4">Merek & Tipe</th>
              <th className="py-3.5 px-4">Daftar Serial Number</th>
              <th className="py-3.5 px-4">Lokasi Detail</th>
              <th className="py-3.5 px-4 text-center">Unit</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Kondisi</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {assets.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-500">
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
                const segmentColor = asset.segment?.color || '#64748b';
                const assetType = asset.asset_type || 'Aktif';
                const snList = parseSNList(asset.serial_number);

                return (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{partnerName} - {siteName}</div>
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
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {categoryName}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {assetType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{asset.brand}</div>
                      <div className="text-[11px] text-slate-400">{asset.model}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono max-w-xs">
                      {snList.length <= 1 ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-cyan-400 font-semibold">{snList[0] || '-'}</span>
                          {snList[0] && (
                            <button
                              type="button"
                              onClick={() => handleCopy(snList[0])}
                              className="p-1 text-slate-500 hover:text-cyan-400 transition-colors active:scale-95"
                              title="Copy SN"
                            >
                              {copiedSN === snList[0] ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                            {snList.length} Serial Number Terdaftar:
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {snList.map((sn, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-400 font-semibold"
                              >
                                <span>{sn}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(sn)}
                                  className="text-slate-500 hover:text-cyan-300"
                                  title="Copy SN ini"
                                >
                                  {copiedSN === sn ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
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
                    <td className="py-3.5 px-4 text-slate-400">
                      {asset.location_detail}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {asset.unit_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ConditionBadge condition={asset.condition} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* QR Print Button */}
                        <button
                          type="button"
                          onClick={() => onOpenQRCodeModal(asset)}
                          className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors active:scale-95"
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
                              className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors active:scale-95"
                              title="Mutasi / Pindahkan Perangkat"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditAsset(asset)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors active:scale-95"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAsset(asset.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors active:scale-95"
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
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950">
        <div>
          Menampilkan halaman <strong className="text-slate-200">{page}</strong> dari{' '}
          <strong className="text-slate-200">{totalPages || 1}</strong> ({total} total aset)
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-200">
            {page}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
