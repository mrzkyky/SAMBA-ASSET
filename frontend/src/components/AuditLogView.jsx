import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Calendar, RefreshCw } from 'lucide-react';
import { getAuditLogs } from '../api';

const ActionBadge = ({ action }) => {
  if (action === 'MUTASI_ASET') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        MUTASI ASET
      </span>
    );
  }
  if (action === 'TAMBAH_ASET' || action === 'CREATE_ASSET') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        TAMBAH ASET
      </span>
    );
  }
  if (action === 'HAPUS_ASET' || action === 'DELETE_ASSET') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        HAPUS ASET
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
      {action}
    </span>
  );
};

const AuditLogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ limit: 40 });
      setLogs(res.data || []);
    } catch (err) {
      setError('Gagal memuat catatan log audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>Audit Trail & Log Aktivitas Sistem</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekam jejak otomatis seluruh transaksi, perubahan, pemindahan, dan akses pengguna.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Log</span>
        </button>
      </div>

      {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Waktu Audit</th>
              <th className="py-3.5 px-4">Pengguna (User)</th>
              <th className="py-3.5 px-4">Aksi / Aktivitas</th>
              <th className="py-3.5 px-4">Detail Perubahan & Lokasi</th>
              <th className="py-3.5 px-4 text-right">Alamat IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">Memuat log aktivitas audit...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">Belum ada catatan log aktivitas.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    <div className="flex items-center text-[11px]">
                      <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                      <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                      <span>{log.username}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;
