import React from 'react';
import { Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, Copy, Check, Shield } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Aktif
      </span>
    );
  }
  if (status === 'Rusak') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Rusak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      Cadangan
    </span>
  );
};

const AssetTable = ({
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
  selectedStatus,
  setSelectedStatus,
  branches,
  categories,
  onEditAsset,
  onDeleteAsset,
}) => {
  const [copiedSN, setCopiedSN] = React.useState(null);

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
            <span>Daftar Master Aset Nasional</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">
              {total} Total Rekord
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Semua Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
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
              <option value="Cadangan">Cadangan</option>
              <option value="Rusak">Rusak</option>
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
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4">Merek & Tipe</th>
              <th className="py-3.5 px-4">Serial Number</th>
              <th className="py-3.5 px-4">Lokasi Detail</th>
              <th className="py-3.5 px-4 text-center">Unit</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {assets.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  Tidak ada aset yang memenuhi kriteria filter.
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const siteName = asset.site?.site_name || '-';
                const partnerName = asset.site?.partner_name || '-';
                const branchName = asset.site?.branch?.name || '-';
                const categoryName = asset.category?.name || '-';

                return (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{partnerName} - {siteName}</div>
                      <div className="text-[11px] text-slate-500">{branchName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{asset.brand}</div>
                      <div className="text-[11px] text-slate-400">{asset.model}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-400 font-semibold">{asset.serial_number}</span>
                        <button
                          onClick={() => handleCopy(asset.serial_number)}
                          className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                          title="Copy SN"
                        >
                          {copiedSN === asset.serial_number ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
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
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Edit Aset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Hapus Aset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-200">
            {page}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
