import React from 'react';
import {
  Plus,
  QrCode,
  Download,
  Upload,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { getExportAssetsUrl, syncAssetsToGoogleSheet } from '../api';

const QuickActionsBar = ({
  user,
  selectedBranch = '',
  onOpenAssetModal,
  onOpenImportModal,
  onOpenQRScannerModal,
  onRefresh,
  loading = false,
}) => {
  const isSuperUser = user?.role === 'Super User' || user?.username === 'admin';
  const isSuperAdmin = user?.role === 'Super Admin' || isSuperUser;
  const isAuditor = user?.role === 'Auditor';

  const [syncingSheet, setSyncingSheet] = React.useState(false);

  const handleExportCSV = () => {
    const { url, token } = getExportAssetsUrl(selectedBranch);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = selectedBranch ? `Aset_Cabang_${selectedBranch}.csv` : 'Aset_Nasional_Export.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert('Gagal mendownload berkas Laporan CSV.'));
  };

  const handleSyncToSheet = async () => {
    if (!window.confirm('Sinkronkan seluruh data aset saat ini ke Google Spreadsheet?')) return;
    try {
      setSyncingSheet(true);
      const res = await syncAssetsToGoogleSheet();
      alert(res.message || 'Sinkronisasi ke Google Spreadsheet berhasil dimulai!');
    } catch (err) {
      alert('Gagal menyinkronkan ke Google Spreadsheet: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncingSheet(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 rounded-2xl bg-white dark:bg-[#1D332E] border border-[#E4E5DC] dark:border-[#355047] shadow-sm transition-colors">
      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-bold text-[#718078] dark:text-[#829A8F] uppercase tracking-wider">
          Aksi Cepat:
        </span>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-[#718078] hover:text-[#27332F] dark:text-[#B8CCC3] dark:hover:text-[#F1F5F2] hover:bg-[#F4F2EB] dark:hover:bg-[#2B4840] transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* QR Scanner Trigger */}
        <button
          type="button"
          onClick={onOpenQRScannerModal}
          className="px-3 py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#EAE7DC] text-[#27332F] border border-[#E4E5DC] dark:bg-[#223B35] dark:hover:bg-[#2B4840] dark:text-[#F1F5F2] dark:border-[#355047] text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
          title="Pindai Kamera QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#8DD6BB]" />
          <span>Pindai QR</span>
        </button>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#EAE7DC] text-[#27332F] border border-[#E4E5DC] dark:bg-[#223B35] dark:hover:bg-[#2B4840] dark:text-[#F1F5F2] dark:border-[#355047] text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
          title="Unduh Laporan CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#718078] dark:text-[#B8CCC3]" />
          <span>Ekspor CSV</span>
        </button>

        {/* Google Spreadsheet Sync & Link */}
        <div className="flex items-center rounded-xl bg-[#DDF3EC] border border-[#0F766E]/30 dark:bg-[#0F766E]/20 dark:border-[#0F766E]/40 overflow-hidden shadow-sm">
          <a
            href="https://docs.google.com/spreadsheets/d/1atRDjWGXRJwZH5gqDh59Mbkuj8tZiTSAHCytVV-2rck/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-[#0F766E] hover:bg-[#C6EADF] dark:text-[#DDF3EC] dark:hover:bg-[#0F766E]/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            title="Buka Google Spreadsheet Terhubung"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheet</span>
            <ExternalLink className="w-3 h-3 text-[#0F766E] dark:text-[#8DD6BB]" />
          </a>
          {!isAuditor && (
            <button
              type="button"
              onClick={handleSyncToSheet}
              disabled={syncingSheet}
              className="p-1.5 px-2 border-l border-[#0F766E]/30 text-[#0F766E] hover:bg-[#C6EADF] dark:text-[#DDF3EC] dark:hover:bg-[#0F766E]/30 text-xs transition-all disabled:opacity-50"
              title="Sinkronkan Seluruh Aset ke Google Spreadsheet Sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Import CSV/Excel Button */}
        {!isAuditor && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3 py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#EAE7DC] text-[#0F766E] border border-[#0F766E]/30 dark:bg-[#223B35] dark:hover:bg-[#2B4840] dark:text-[#8DD6BB] dark:border-[#355047] text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
            title="Import Aset dari Spreadsheet / CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        )}

        {/* Primary Action: Tambah Aset */}
        {!isAuditor && (
          <button
            type="button"
            onClick={onOpenAssetModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#16845B] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            title="Daftarkan Unit Aset Baru"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActionsBar;
