import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, FileText, Calendar, User, MapPin } from 'lucide-react';
import { getTransfers } from '../api';

const TransferHistory = ({ onOpenBASTModal }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getTransfers({ page: p, limit: 15 });
      setTransfers(res.data || []);
      setPage(res.page || 1);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError('Gagal memuat riwayat mutasi perangkat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden space-y-4 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <span>Histori Mutasi & Pemindahan Perangkat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jejak rekaman mutasi perangkat antar site/cabang beserta penerbitan BAST resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchHistory(page)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          Refresh Data
        </button>
      </div>

      {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">No. BAST / Ref Mutasi</th>
              <th className="py-3.5 px-4">Perangkat & SN</th>
              <th className="py-3.5 px-4">Dari Site Asal</th>
              <th className="py-3.5 px-4">Ke Site Tujuan</th>
              <th className="py-3.5 px-4 text-center">Unit</th>
              <th className="py-3.5 px-4">Tanggal & User</th>
              <th className="py-3.5 px-4 text-right">Aksi Dokumen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">Memuat histori mutasi...</td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-500">Belum ada riwayat mutasi perangkat.</td>
              </tr>
            ) : (
              transfers.map((t) => {
                const asset = t.asset;
                const fromSite = t.from_site;
                const toSite = t.to_site;

                return (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {t.reference_no}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{asset?.brand} - {asset?.model}</div>
                      <div className="text-[11px] font-mono text-cyan-400 max-w-xs truncate">{t.serial_numbers || asset?.serial_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-semibold">{fromSite?.partner_name} - {fromSite?.site_name}</div>
                      <div className="text-[11px] text-slate-500">{fromSite?.branch?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-teal-400 font-semibold">{toSite?.partner_name} - {toSite?.site_name}</div>
                      <div className="text-[11px] text-slate-500">{toSite?.branch?.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {t.unit_count}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center text-[11px]">
                        <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                        <span>{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500 mt-0.5">
                        <User className="w-3 h-3 mr-1 text-slate-600" />
                        <span>{t.performed_by_user?.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenBASTModal(t)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 text-xs font-semibold inline-flex items-center space-x-1 transition-all active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Cetak BAST</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferHistory;
