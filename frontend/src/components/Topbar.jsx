import React from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

const tabBreadcrumbs = {
  hierarchy: { category: 'Overview', title: 'Tampilan Hirarki (Level 1-4)' },
  master: { category: 'Master Data', title: 'Tabel Master Aset' },
  office_assets: { category: 'Master Data', title: 'Aset Internal Perusahaan' },
  missing_sn: { category: 'Operasional', title: 'Pelacak Serial Number' },
  transfers: { category: 'Operasional', title: 'Histori Mutasi & BAST' },
  audit: { category: 'Operasional', title: 'Riwayat Perubahan & Audit Trail' },
  sites: { category: 'Konfigurasi', title: 'Site & Mitra Spesifik (Level 2)' },
  categories: { category: 'Konfigurasi', title: 'Kategori Perangkat (Level 3)' },
  branches: { category: 'Konfigurasi', title: 'Cabang Daerah (Level 1)' },
  segments: { category: 'Konfigurasi', title: 'Segmen Bisnis' },
  users: { category: 'Konfigurasi', title: 'Kelola Pengguna & Hak Akses' },
};

const Topbar = ({
  user,
  onLogout,
  activeTab,
  searchQuery,
  setSearchQuery,
  theme = 'light',
  toggleTheme,
  onToggleMobileSidebar,
}) => {
  const currentMeta = tabBreadcrumbs[activeTab] || { category: 'SAMBA ASSET', title: 'Dashboard' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1D332E]/95 backdrop-blur-md border-b border-[#E4E5DC] dark:border-[#355047] transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-[#27332F] dark:text-[#F1F5F2] hover:bg-[#F4F2EB] dark:hover:bg-[#2B4840] focus:outline-none"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Title */}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#718078] dark:text-[#829A8F] uppercase tracking-wider truncate">
                <span>SAMBA ASSET</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-[#0F766E] dark:text-[#8DD6BB] font-black">{currentMeta.category}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#27332F] dark:text-[#F1F5F2] truncate">
                {currentMeta.title}
              </h1>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#718078] dark:text-[#829A8F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari SN, Merek, Site, Model aset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F2EB] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl pl-9 pr-8 py-2 text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#718078] hover:text-[#27332F] dark:text-[#829A8F] dark:hover:text-[#F1F5F2]"
                  title="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions, Theme Toggle & User Info */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Theme Toggle */}
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[#718078] hover:text-[#D9A441] hover:bg-[#F4F2EB] dark:text-[#B8CCC3] dark:hover:text-[#D9A441] dark:hover:bg-[#2B4840] border border-[#E4E5DC] dark:border-[#355047] transition-all active:scale-95"
                title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9A441]" /> : <Moon className="w-4 h-4 text-[#27332F]" />}
              </button>
            )}

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center space-x-1.5 pl-1.5">
                <div className="hidden sm:flex items-center space-x-2 bg-[#F8F7F2] dark:bg-[#223B35] px-2.5 py-1.5 rounded-xl border border-[#E4E5DC] dark:border-[#355047]">
                  <div className="w-6 h-6 rounded-lg bg-[#DDF3EC] dark:bg-[#31584C] border border-[#0F766E]/30 text-[#0F766E] dark:text-[#8DD6BB] flex items-center justify-center font-bold text-xs shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0 max-w-[120px] lg:max-w-none">
                    <div className="text-xs font-bold text-[#27332F] dark:text-[#F1F5F2] truncate">
                      {user.username}
                    </div>
                    <div className="text-[10px] text-[#0F766E] dark:text-[#8DD6BB] font-semibold truncate">
                      {user.role} {user.branch ? `(${user.branch.code})` : ''}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-[#718078] hover:text-[#C94B4B] hover:bg-[#FBE8E8] dark:text-[#B8CCC3] dark:hover:bg-[#C94B4B]/20 border border-[#E4E5DC] dark:border-[#355047] transition-colors"
                  title="Keluar (Logout)"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Row (visible on small screens) */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#718078] dark:text-[#829A8F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari SN, Merek, Site, Model aset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F2EB] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl pl-9 pr-8 py-2 text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:outline-none focus:border-[#0F766E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#718078] dark:text-[#829A8F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
