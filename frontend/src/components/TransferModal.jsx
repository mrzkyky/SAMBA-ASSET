import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Send, MapPin } from 'lucide-react';
import { createTransfer, getSites } from '../api';
import { parseSNList } from './HierarchyView';

const TransferModal = ({ isOpen, onClose, asset, sites: initialSites, onTransferSuccess }) => {
  const [sitesList, setSitesList] = useState(initialSites || []);
  const [toSiteId, setToSiteId] = useState('');
  const [unitCount, setUnitCount] = useState(1);
  const [selectedSNs, setSelectedSNs] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const snList = asset ? parseSNList(asset.serial_number) : [];

  useEffect(() => {
    if (initialSites && initialSites.length > 0) {
      setSitesList(initialSites);
    } else if (isOpen) {
      getSites().then((data) => data && setSitesList(data)).catch(() => {});
    }
  }, [initialSites, isOpen]);

  useEffect(() => {
    if (asset) {
      setUnitCount(asset.unit_count || 1);
      setSelectedSNs(asset.serial_number || '');
      setReason('');
      setToSiteId('');
      setError('');
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handleUnitCountChange = (val) => {
    const num = Math.min(Math.max(1, parseInt(val, 10) || 1), asset.unit_count);
    setUnitCount(num);
    if (snList.length > 0) {
      setSelectedSNs(snList.slice(0, num).join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toSiteId) {
      setError('Silakan pilih site lokasi tujuan mutasi.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await createTransfer({
        asset_id: asset.id,
        to_site_id: parseInt(toSiteId, 10),
        unit_count: unitCount,
        serial_numbers: selectedSNs,
        reason: reason,
      });

      onTransferSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memproses mutasi perangkat.');
    } finally {
      setLoading(false);
    }
  };

  const currentSiteName = asset.site ? `${asset.site.partner_name} - ${asset.site.site_name} (${asset.site.branch?.name})` : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mutasi & Pemindahan Perangkat</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Memindahkan lokasi unit perangkat antar site atau antar cabang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Current Asset Info Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Perangkat Yang Dipindahkan:</div>
            <div className="text-sm font-bold text-white">{asset.brand} - {asset.model}</div>
            <div className="text-slate-400 flex items-center pt-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1 shrink-0" />
              <span>Lokasi Asal: <strong className="text-cyan-300">{currentSiteName}</strong></span>
            </div>
          </div>

          {/* Destination Site Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Pilih Site & Mitra Tujuan Mutasi *
            </label>
            <select
              required
              value={toSiteId}
              onChange={(e) => setToSiteId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">-- Pilih Site Tujuan --</option>
              {sitesList
                .filter((s) => String(s.id) !== String(asset.site_id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch?.name}] {s.partner_name} - {s.site_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Unit Count to Move */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Jumlah Unit Yang Dipindahkan (Maks: {asset.unit_count}) *
              </label>
              <input
                type="number"
                min="1"
                max={asset.unit_count}
                required
                value={unitCount}
                onChange={(e) => handleUnitCountChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Serial Number Yang Dipindahkan
              </label>
              <input
                type="text"
                value={selectedSNs}
                onChange={(e) => setSelectedSNs(e.target.value)}
                placeholder="Serial Number unit yang dipindah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Reason for Transfer */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Alasan Pemindahan / Catatan Mutasi *
            </label>
            <textarea
              rows="3"
              required
              placeholder="misal: Relokasi ke site baru / Penggantian perangkat di lokasi A / Upgrade jaringan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Memproses Mutasi...' : 'Proses Mutasi & Terbitkan BAST'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
