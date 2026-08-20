import React from 'react';
import { Network, ShieldCheck, Layers, Server, Plus, Download, Search, Camera, LogOut, UserCheck, Users, X } from 'lucide-react';
import { getExportUrl } from '../api';

const Header = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenAssetModal,
  onOpenQRScanner,
  selectedBranch,
  branches,
}) => {
  const currentBranchName = branches.find((b) => String(b.id) === String(selectedBranch))?.name || 'Seluruh Indonesia';

  const handleExport = () => {
    const url = getExportUrl(selectedBranch);
    window.open(url, '_blank');
  };

  const isAuditor = user?.role === 'Auditor';
  const isSuperAdmin = user?.role === 'Super Admin';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('hierarchy')}>
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white shrink-0">
              <Network className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                  National Asset System
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Manajemen Perangkat IT • Terintegrasi QR Code & RBAC
              </p>
            </div>
          </div>

          {/* Quick Search & QR Scanner (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2">
            <div className="relative w-full flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Serial Number / Merek / Model..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-500 hover:text-slate-200"
                    title="Hapus kata kunci"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* QR Scanner Button */}
              <button
                onClick={onOpenQRScanner}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 active:scale-95 shadow-sm"
                title="Pindai QR Code via Kamera"
              >
                <Camera className="w-4 h-4 text-purple-400" />
                <span className="hidden md:inline">Pindai QR</span>
              </button>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Mobile QR Scanner Button */}
            <button
              onClick={onOpenQRScanner}
              className="sm:hidden p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs"
              title="Pindai QR Code"
            >
              <Camera className="w-4 h-4 text-purple-400" />
            </button>

            {!isAuditor && (
              <button
                onClick={() => onOpenAssetModal(null)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
                title="Tambah Aset Baru"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Tambah Aset</span>
              </button>
            )}

            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all active:scale-95"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">CSV</span>
            </button>

            {/* User Profile Pill & Logout */}
            {user && (
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-2 sm:pl-3">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-bold text-white flex items-center justify-end space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{user.username}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold">{user.role}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all active:scale-95"
                  title="Keluar Sesi (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="pb-3 sm:hidden">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Serial Number / Merek / Model..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-t border-slate-800/80 pt-2 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'hierarchy'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tampilan Hirarki (Level 1 - 4)</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeTab === 'table'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Tabel Master Aset</span>
          </button>

          {!isAuditor && (
            <button
              onClick={() => setActiveTab('master')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'master'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Kelola Cabang / Site / Kategori</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeTab === 'users'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kelola Pengguna (RBAC)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
