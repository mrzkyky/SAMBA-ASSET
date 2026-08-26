import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  User,
  Calendar,
  RefreshCw,
  Search,
  History,
  ArrowRight,
  Edit3,
  PlusCircle,
  Trash2,
  ArrowRightLeft,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { getAuditLogs } from '../api';

const ActionBadge = ({ action }) => {
  if (action === 'EDIT_ASET' || action === 'UPDATE_ASSET') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
        <Edit3 className="w-3 h-3 mr-1.5" />
        EDIT ASET
      </span>
    );
  }
  if (action === 'MUTASI_ASET' || action === 'TRANSFER_ASSET') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30 shadow-sm">
        <ArrowRightLeft className="w-3 h-3 mr-1.5" />
        MUTASI ASET
      </span>
    );
  }
  if (action === 'TAMBAH_ASET' || action === 'CREATE_ASSET') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
        <PlusCircle className="w-3 h-3 mr-1.5" />
        TAMBAH ASET
      </span>
    );
  }
  if (action === 'HAPUS_ASET' || action === 'DELETE_ASSET') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm">
        <Trash2 className="w-3 h-3 mr-1.5" />
        HAPUS ASET
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm">
      <ShieldCheck className="w-3 h-3 mr-1.5" />
      {action}
    </span>
  );
};

// Formatter to render delta changes with highlighting
const FormattedDetails = ({ details, action }) => {
  if (!details) return <span className="text-slate-500 italic">Tidak ada rincian</span>;

  // If details contain arrow ➔ for edit delta
  if (details.includes('➔')) {
    const parts = details.split(': ');
    const prefix = parts.length > 1 ? parts[0] + ':' : '';
    const body = parts.length > 1 ? parts.slice(1).join(': ') : details;
    const diffs = body.split(' | ');

    return (
      <div className="space-y-1.5">
        {prefix && <div className="text-xs font-bold text-white mb-1">{prefix}</div>}
        <div className="flex flex-wrap gap-1.5">
          {diffs.map((diff, idx) => {
            if (diff.includes('➔')) {
              const [param, values] = diff.includes(':') ? diff.split(/:(.+)/) : ['', diff];
              const [oldVal, newVal] = (values || diff).split('➔');
              return (
                <div
                  key={idx}
                  className="inline-flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs"
                >
                  {param && <span className="font-semibold text-slate-400">{param.trim()}:</span>}
                  <span className="text-rose-400/90 line-through bg-rose-500/10 px-1.5 py-0.5 rounded text-[11px]">
                    {oldVal?.trim()}
                  </span>
                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                    {newVal?.trim()}
                  </span>
                </div>
              );
            }
            return (
              <span key={idx} className="text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {diff}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return <p className="text-xs text-slate-200 leading-relaxed break-words">{details}</p>;
};

const AuditLogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async (targetPage = page, action = selectedAction, query = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogs({
        page: targetPage,
        limit: 25,
        action: action || undefined,
        q: query.trim() || undefined,
      });
      setLogs(res.data || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError('Gagal memuat catatan log riwayat perubahan.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedAction, searchQuery]);

  useEffect(() => {
    fetchLogs(1, selectedAction, searchQuery);
    setPage(1);
  }, [selectedAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1, selectedAction, searchQuery);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchLogs(newPage, selectedAction, searchQuery);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden space-y-5 p-4 sm:p-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Riwayat Perubahan & Audit Trail Aset</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Lacak riwayat terakhir kali data aset diedit, nilai sebelumnya (sebelum salah input), mutasi, dan penambahan aset.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Total: <strong className="text-cyan-400">{totalCount}</strong> Aktivitas
          </span>
          <button
            type="button"
            onClick={() => fetchLogs(page, selectedAction, searchQuery)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95"
            title="Segarkan data log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        {/* Action Type Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedAction('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedAction === ''
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('EDIT_ASET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedAction === 'EDIT_ASET'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ✏️ Edit Aset
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('TAMBAH_ASET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedAction === 'TAMBAH_ASET'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ➕ Tambah Aset
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('MUTASI_ASET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedAction === 'MUTASI_ASET'
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🔄 Mutasi Aset
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('HAPUS_ASET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedAction === 'HAPUS_ASET'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🗑️ Hapus Aset
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 shrink-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SN, Merek, User, Site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 active:scale-95"
          >
            Cari
          </button>
        </form>
      </div>

      {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

      {/* Activity Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Waktu Kejadian</th>
              <th className="py-3.5 px-4">Pengubah (User)</th>
              <th className="py-3.5 px-4">Jenis Aksi</th>
              <th className="py-3.5 px-4">Rincian Perubahan (Sebelum ➔ Sesudah)</th>
              <th className="py-3.5 px-4 text-right">Alamat IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Memuat riwayat log perubahan data...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-500">
                  Belum ada catatan log aktivitas yang sesuai kriteria pencarian.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-slate-400 font-mono align-top whitespace-nowrap">
                    <div className="flex items-center text-[11px]">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" />
                      <span>{new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="py-3.5 px-4 font-bold text-white align-top whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[11px] font-bold text-cyan-400 uppercase">
                        {log.username?.charAt(0) || 'U'}
                      </div>
                      <span className="text-cyan-300">{log.username}</span>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <ActionBadge action={log.action} />
                  </td>

                  {/* Details with Delta Diff */}
                  <td className="py-3.5 px-4 text-slate-300 align-top">
                    <FormattedDetails details={log.details} action={log.action} />
                  </td>

                  {/* IP Address */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px] align-top whitespace-nowrap">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Halaman <strong className="text-white">{page}</strong> dari <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogView;
