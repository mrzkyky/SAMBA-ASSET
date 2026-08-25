import React from 'react';
import {
  Server,
  Layers,
  Table,
  Building2,
  MapPin,
  Tag,
  Plus,
  Search,
  Download,
  Users,
  LogOut,
  UserCheck,
  QrCode,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react';
import { getExportAssetsUrl } from '../api';
import sambaIcon from '../assets/samba-icon.png';

const Header = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAssetModal,
  onOpenQRScannerModal,
  searchQuery,
  setSearchQuery,
  selectedBranch,
}) => {
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

  const isSuperAdmin = user?.role === 'Super Admin';
  const isAuditor = user?.role === 'Auditor';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row: Logo/Title & User Profile */}
        <div className="py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-slate-800/60">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/25 border border-cyan-500/30 bg-slate-950 flex items-center justify-center shrink-0">
              <img src={sambaIcon} alt="SAMBA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">SAMBA ASSET</h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">System Asset Management</p>
            </div>
          </div>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-800 max-w-[150px] sm:max-w-none">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <div className="text-left min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">{user.username}</div>
                  <div className="text-[9px] sm:text-[10px] text-cyan-400 font-semibold leading-tight truncate">
                    {user.role} {user.branch ? `(${user.branch.code})` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar & Action Buttons Row */}
        <div className="py-2.5 flex items-center gap-2 border-b border-slate-800/40">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari SN, Merek, Site, Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>

          {/* QR Scanner Trigger */}
          <button
            type="button"
            onClick={onOpenQRScannerModal}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 active:scale-95 shadow-sm"
            title="Pindai Kamera QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden md:inline">Pindai QR</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 active:scale-95"
            title="Unduh Laporan CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Ekspor CSV</span>
          </button>

          {/* Create Asset Trigger (RBAC Filter) */}
          {!isAuditor && (
            <button
              type="button"
              onClick={onOpenAssetModal}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all shrink-0 active:scale-95"
              title="Tambah Aset Baru"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Tambah Aset</span>
            </button>
          )}
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
              activeTab === 'hierarchy'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tampilan Hirarki (Level 1-4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
              activeTab === 'master'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabel Master Aset</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transfers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
              activeTab === 'transfers'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Histori Mutasi & BAST</span>
          </button>

          {/* Level 2: Site Management (Super Admin & Branch Admin) */}
          {(isSuperAdmin || user?.role === 'Branch Admin') && (
            <button
              type="button"
              onClick={() => setActiveTab('sites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                activeTab === 'sites'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Site (L2)</span>
            </button>
          )}

          {/* Level 3: Category Management (Super Admin & Branch Admin) */}
          {(isSuperAdmin || user?.role === 'Branch Admin') && (
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                activeTab === 'categories'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Kategori (L3)</span>
            </button>
          )}

          {/* Super Admin Specific Management Tabs */}
          {isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                  activeTab === 'audit'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Audit Log</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                  activeTab === 'users'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Kelola User (RBAC)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('branches')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                  activeTab === 'branches'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Cabang (L1)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('segments')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 active:scale-95 ${
                  activeTab === 'segments'
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Segmen</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
