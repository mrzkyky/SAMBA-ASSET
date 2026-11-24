import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, FileText, Calendar, User, MapPin, RefreshCw, Sparkles } from 'lucide-react';
import { getTransfers, recoverTransfers } from '../api';

const TransferHistory = ({ onOpenBASTModal }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const handleRecover = async () => {
    setRecovering(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await recoverTransfers();
      setSuccessMsg(res.message || 'Sinkronisasi riwayat mutasi berhasil');
      await fetchHistory(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memulihkan riwayat mutasi dari audit log');
    } finally {
      setRecovering(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  // Group transfers by reference_no so batch transfers appear as 1 unified BAST entry
  const groupedTransfers = React.useMemo(() => {
    const map = new Map();
    transfers.forEach((t) => {
      const ref = t.reference_no || `TRF_${t.id}`;
      if (!map.has(ref)) {
        map.set(ref, {
          id: t.id,
          reference_no: t.reference_no,
          created_at: t.created_at,
          transfer_date: t.transfer_date,
          performed_by_user: t.performed_by_user,
          reason: t.reason,
          from_site: t.from_site,
          from_site_name: t.from_site_name,
          from_partner_name: t.from_partner_name,
          from_branch_name: t.from_branch_name,
          to_site: t.to_site,
          to_site_name: t.to_site_name,
          to_partner_name: t.to_partner_name,
          to_branch_name: t.to_branch_name,
          total_units: 0,
          items: [],
        });
      }
      const group = map.get(ref);
      group.total_units += (t.unit_count || 1);
      group.items.push(t);
    });
    return Array.from(map.values());
  }, [transfers]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1D332E] border border-slate-200 dark:border-[#355047] shadow-sm space-y-4 p-4 sm:p-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F2] flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-[#0F766E] dark:text-[#8DD6BB]" />
            <span>Histori Mutasi & Pemindahan Perangkat</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#829A8F] mt-0.5">
            Jejak rekaman mutasi perangkat antar site/cabang beserta penerbitan BAST resmi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={recovering || loading}
            onClick={handleRecover}
            className="px-3.5 py-2 rounded-xl bg-[#DDF3EC] hover:bg-cyan-100 text-[#0F766E] border border-[#BBE5D7] dark:bg-[#31584C]/40 dark:hover:bg-[#31584C]/40 dark:text-[#8DD6BB] dark:border-[#0F766E]/20 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50"
            title="Pindai audit log dan pulihkan catatan mutasi yang hilang"
          >
            <Sparkles className={`w-3.5 h-3.5 ${recovering ? 'animate-spin' : ''}`} />
            <span>{recovering ? 'Memulihkan...' : 'Sinkronkan / Pulihkan Mutasi'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchHistory(page)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1D332E] dark:hover:bg-[#2B4840] dark:text-[#B8CCC3] text-xs font-semibold flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center space-x-2">
          <span>✓ {successMsg}</span>
        </p>
      )}

      {error && <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/20">{error}</p>}

      {/* History Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#355047]">
        <table className="w-full text-left text-xs text-slate-700 dark:text-[#B8CCC3]">
          <thead className="bg-slate-50 dark:bg-[#142522] text-slate-600 dark:text-[#829A8F] uppercase font-semibold border-b border-slate-200 dark:border-[#355047]">
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
          <tbody className="divide-y divide-slate-100 dark:divide-[#355047]/60 bg-white dark:bg-[#1D332E]">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-[#829A8F]">Memuat histori mutasi...</td>
              </tr>
            ) : groupedTransfers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-[#829A8F]">Belum ada riwayat mutasi perangkat.</td>
              </tr>
            ) : (
              groupedTransfers.map((group) => {
                const fromSite = group.from_site;
                const toSite = group.to_site;

                const fromLocation = fromSite
                  ? `${fromSite.partner_name} - ${fromSite.site_name}`
                  : (group.from_partner_name ? `${group.from_partner_name} - ${group.from_site_name}` : (group.from_site_name || '-'));
                const fromBranch = fromSite?.branch?.name || group.from_branch_name || '';

                const toLocation = toSite
                  ? `${toSite.partner_name} - ${toSite.site_name}`
                  : (group.to_partner_name ? `${group.to_partner_name} - ${group.to_site_name}` : (group.to_site_name || '-'));
                const toBranch = toSite?.branch?.name || group.to_branch_name || '';

                return (
                  <tr key={group.reference_no || group.id} className="hover:bg-slate-50 dark:hover:bg-[#2B4840]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="font-mono font-bold text-[#0F766E] dark:text-[#8DD6BB] bg-[#DDF3EC] dark:bg-[#142522] px-2 py-1 rounded border border-[#BBE5D7] dark:border-[#355047]">
                          {group.reference_no}
                        </span>
                        {group.items.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-100 text-cyan-800 dark:bg-[#31584C]/40 dark:text-[#8DD6BB] border border-[#BBE5D7] dark:border-[#0F766E]/30">
                            {group.items.length} Perangkat
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Devices list inside this BAST */}
                    <td className="py-3.5 px-4">
                      {group.items.length === 1 ? (
                        (() => {
                          const single = group.items[0];
                          const a = single.asset;
                          const brand = a?.brand || single.asset_brand || '';
                          const model = a?.model || single.asset_model || '';
                          const displayDevice = (brand && brand !== '-' ? brand + ' ' : '') + (model && model !== '-' ? model : (brand || 'Perangkat Jaringan'));
                          return (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-[#F1F5F2]">{displayDevice}</div>
                              <div className="text-[11px] font-mono text-[#0F766E] dark:text-[#8DD6BB] max-w-xs truncate">
                                {single.serial_numbers || a?.serial_number || '-'}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="space-y-2 py-1">
                          {group.items.map((it, iIdx) => {
                            const a = it.asset;
                            const brand = a?.brand || it.asset_brand || '';
                            const model = a?.model || it.asset_model || '';
                            const devName = (brand && brand !== '-' ? brand + ' ' : '') + (model && model !== '-' ? model : (brand || 'Perangkat'));
                            return (
                              <div key={it.id || iIdx} className="text-xs">
                                <div className="font-bold text-slate-900 dark:text-[#F1F5F2] flex items-center space-x-1.5">
                                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-[#1D332E] text-[#0F766E] dark:text-[#8DD6BB] text-[9px] font-mono flex items-center justify-center shrink-0">
                                    {iIdx + 1}
                                  </span>
                                  <span className="truncate">{devName}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-[#829A8F] font-normal">({it.unit_count} unit)</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#0F766E] dark:text-[#8DD6BB] pl-5.5 truncate max-w-xs">
                                  SN: {it.serial_numbers || a?.serial_number || '-'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-[#F1F5F2] font-semibold">{fromLocation}</div>
                      {fromBranch && <div className="text-[11px] text-slate-500">{fromBranch}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#0F766E] dark:text-[#8DD6BB] font-semibold">{toLocation}</div>
                      {toBranch && <div className="text-[11px] text-slate-500">{toBranch}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-[#F1F5F2] text-sm">
                      {group.total_units}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#829A8F]">
                      <div className="flex items-center text-[11px]">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{new Date(group.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 mt-0.5">
                        <User className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{group.performed_by_user?.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenBASTModal(group)}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 dark:border-purple-500/20 text-xs font-semibold inline-flex items-center space-x-1 transition-all active:scale-95"
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
