import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Send, MapPin, Plus, Trash2, Layers } from 'lucide-react';
import { createTransfer, createBatchTransfer, getSites, getAssets } from '../api';
import { parseSNList } from './HierarchyView';
import SearchableSelect from './SearchableSelect';

const TransferModal = ({ isOpen, onClose, asset, sites: initialSites, onTransferSuccess }) => {
  const [sitesList, setSitesList] = useState(initialSites || []);
  const [toSiteId, setToSiteId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Multi-device transfer state
  const [transferItems, setTransferItems] = useState([]);
  const [siteAssets, setSiteAssets] = useState([]);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [selectedAddAssetId, setSelectedAddAssetId] = useState('');

  useEffect(() => {
    if (initialSites && initialSites.length > 0) {
      setSitesList(initialSites);
    } else if (isOpen) {
      getSites().then((data) => data && setSitesList(data)).catch(() => {});
    }
  }, [initialSites, isOpen]);

  // When modal opens with a target asset, initialize transfer items & fetch other assets at the same site
  useEffect(() => {
    if (asset && isOpen) {
      setTransferItems([
        {
          asset_id: asset.id,
          asset: asset,
          unit_count: asset.unit_count || 1,
          serial_numbers: asset.serial_number || '',
        },
      ]);
      setReason('');
      setToSiteId('');
      setError('');
      setIsAddingDevice(false);
      setSelectedAddAssetId('');

      // Fetch all assets from source site so user can select more devices to move together
      if (asset.site_id) {
        getAssets({ site_id: asset.site_id, limit: 100 })
          .then((res) => {
            const list = res.data || [];
            setSiteAssets(list);
          })
          .catch((err) => {
            console.error('Failed to load other assets at site:', err);
          });
      }
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  // Available devices from the same site that are not yet added to transferItems
  const availableSiteAssets = siteAssets.filter(
    (sa) => !transferItems.some((it) => it.asset_id === sa.id)
  );

  const handleAddItem = (assetToAdd) => {
    if (!assetToAdd) return;
    setTransferItems((prev) => [
      ...prev,
      {
        asset_id: assetToAdd.id,
        asset: assetToAdd,
        unit_count: assetToAdd.unit_count || 1,
        serial_numbers: assetToAdd.serial_number || '',
      },
    ]);
    setIsAddingDevice(false);
    setSelectedAddAssetId('');
  };

  const handleRemoveItem = (indexToRemove) => {
    if (transferItems.length <= 1) return;
    setTransferItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleItemUnitChange = (index, val) => {
    setTransferItems((prev) => {
      const copy = [...prev];
      const it = copy[index];
      const maxUnits = it.asset?.unit_count || 1;
      const num = Math.min(Math.max(1, parseInt(val, 10) || 1), maxUnits);
      it.unit_count = num;

      // Adjust serial numbers preview if present
      const snList = parseSNList(it.asset?.serial_number || '');
      if (snList.length > 0) {
        it.serial_numbers = snList.slice(0, num).join(', ');
      }
      return copy;
    });
  };

  const handleItemSNChange = (index, val) => {
    setTransferItems((prev) => {
      const copy = [...prev];
      copy[index].serial_numbers = val;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toSiteId) {
      setError('Silakan pilih site lokasi tujuan mutasi.');
      return;
    }
    if (transferItems.length === 0) {
      setError('Pilih minimal satu perangkat yang akan dimutasi.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (transferItems.length === 1) {
        const single = transferItems[0];
        await createTransfer({
          asset_id: single.asset_id,
          to_site_id: parseInt(toSiteId, 10),
          unit_count: single.unit_count,
          serial_numbers: single.serial_numbers,
          reason: reason,
        });
      } else {
        // Multi-device transfer under 1 BAST
        await createBatchTransfer({
          to_site_id: parseInt(toSiteId, 10),
          reason: reason,
          items: transferItems.map((it) => ({
            asset_id: it.asset_id,
            unit_count: it.unit_count,
            serial_numbers: it.serial_numbers,
          })),
        });
      }

      onTransferSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memproses mutasi perangkat.');
    } finally {
      setLoading(false);
    }
  };

  const currentSiteName = asset.site ? `${asset.site.partner_name} - ${asset.site.site_name} (${asset.site.branch?.name})` : '-';
  const totalUnitsToMove = transferItems.reduce((acc, curr) => acc + (curr.unit_count || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mutasi & Pemindahan Perangkat</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pindahkan satu atau beberapa perangkat sekaligus dalam 1 Berita Acara (BAST).
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

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Current Site Location Info */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
            <div>
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Lokasi Asal (Site):</div>
              <div className="text-cyan-300 font-bold flex items-center pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1 shrink-0" />
                <span>{currentSiteName}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400">Total Dimutasi:</span>
              <div className="font-bold text-white">{transferItems.length} Perangkat ({totalUnitsToMove} Unit)</div>
            </div>
          </div>

          {/* Target Site Dropdown (Searchable) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Pilih Site & Mitra Tujuan Mutasi *
            </label>
            <SearchableSelect
              required
              value={toSiteId}
              onChange={(val) => setToSiteId(val)}
              placeholder="-- Pilih Site Tujuan --"
              searchPlaceholder="Ketik untuk mencari site tujuan (misal: Brebes, MAN 1, Pop)..."
              options={sitesList
                .filter((s) => String(s.id) !== String(asset?.site_id))
                .map((s) => ({
                  value: String(s.id),
                  label: `[${s.branch?.name || 'Branch'}] ${s.partner_name} - ${s.site_name}`,
                  sublabel: s.address,
                  searchKeywords: `${s.branch?.name || ''} ${s.partner_name || ''} ${s.site_name || ''} ${s.address || ''}`,
                }))}
            />
          </div>

          {/* Section: List of Devices to Transfer */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Daftar Perangkat Yang Dipindahkan ({transferItems.length})</span>
              </label>

              {availableSiteAssets.length > 0 && !isAddingDevice && (
                <button
                  type="button"
                  onClick={() => setIsAddingDevice(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Perangkat Lain</span>
                </button>
              )}
            </div>

            {/* Inline Device Picker to add another asset */}
            {isAddingDevice && (
              <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400">Pilih Perangkat Lain dari Site Ini:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDevice(false);
                      setSelectedAddAssetId('');
                    }}
                    className="text-slate-400 hover:text-white text-[11px]"
                  >
                    Batal
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAddAssetId}
                    onChange={(e) => setSelectedAddAssetId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- Pilih Perangkat yang Ada di Site Asal --</option>
                    {availableSiteAssets.map((sa) => (
                      <option key={sa.id} value={sa.id}>
                        {sa.brand} - {sa.model} [{sa.category?.name || 'Aset'}] (Tersedia: {sa.unit_count} unit)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedAddAssetId}
                    onClick={() => {
                      const found = availableSiteAssets.find((sa) => String(sa.id) === String(selectedAddAssetId));
                      if (found) handleAddItem(found);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}

            {/* List Cards of Transfer Items */}
            <div className="space-y-2.5">
              {transferItems.map((item, idx) => {
                const targetAsset = item.asset;
                const maxUnit = targetAsset?.unit_count || 1;

                return (
                  <div
                    key={item.asset_id || idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white text-xs truncate">
                            {targetAsset?.brand} - {targetAsset?.model}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 shrink-0">
                            {targetAsset?.category?.name || 'Aset'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-7 mt-0.5">
                          Lokasi Rak: {targetAsset?.location_detail || 'Main Rack'} • Stok Saat Ini: {maxUnit} Unit
                        </div>
                      </div>

                      {transferItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Hapus dari daftar mutasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Unit count & SN inputs for this specific device */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-7">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Jumlah Unit (Maks: {maxUnit})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={maxUnit}
                          required
                          value={item.unit_count}
                          onChange={(e) => handleItemUnitChange(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Serial Number Yang Dipindahkan
                        </label>
                        <input
                          type="text"
                          value={item.serial_numbers}
                          onChange={(e) => handleItemSNChange(idx, e.target.value)}
                          placeholder="Serial Number unit yang dipindah"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason for Transfer */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Alasan Pemindahan / Catatan Mutasi *
            </label>
            <textarea
              rows="2"
              required
              placeholder="misal: Relokasi perangkat ke site baru / Penggantian perangkat / Upgrade jaringan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {loading
                  ? 'Memproses Mutasi...'
                  : transferItems.length > 1
                  ? `Mutasi (${transferItems.length} Perangkat) & Terbitkan 1 BAST`
                  : 'Proses Mutasi & Terbitkan BAST'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
