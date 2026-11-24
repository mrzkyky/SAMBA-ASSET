import React from 'react';
import {
  Layers,
  Table,
  Building,
  Building2,
  MapPin,
  Tag,
  Users,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Boxes,
} from 'lucide-react';
import sambaSLogo from '../assets/samba-s-logo.png';

const Sidebar = ({
  user,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  missingSNStats = null,
}) => {
  const isSuperUser = user?.role === 'Super User' || user?.username === 'admin';
  const isSuperAdmin = user?.role === 'Super Admin' || isSuperUser;
  const isBranchAdmin = user?.role === 'Branch Admin';

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const menuGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        {
          id: 'hierarchy',
          label: 'Tampilan Hirarki',
          sublabel: 'Level 1-4 Nasional',
          icon: Layers,
          visible: true,
        },
      ],
    },
    {
      groupTitle: 'MASTER DATA',
      items: [
        {
          id: 'master',
          label: 'Tabel Master Aset',
          sublabel: 'Seluruh Aset Terdaftar',
          icon: Table,
          visible: true,
        },
        {
          id: 'office_assets',
          label: 'Aset Internal',
          sublabel: 'Kantor Pusat & Cabang',
          icon: Building,
          visible: true,
        },
      ],
    },
    {
      groupTitle: 'OPERASIONAL',
      items: [
        {
          id: 'missing_sn',
          label: 'Pelacak SN',
          sublabel: 'Mitra Tanpa Serial Number',
          icon: AlertTriangle,
          visible: true,
          badge: missingSNStats?.sites || missingSNStats?.assets ? `${missingSNStats.sites} Site` : null,
          badgeColor: 'bg-[#C94B4B]/25 text-[#FFA4A4] border border-[#C94B4B]/40',
        },
        {
          id: 'transfers',
          label: 'Histori Mutasi & BAST',
          sublabel: 'Perpindahan Aset',
          icon: ArrowRightLeft,
          visible: true,
        },
        {
          id: 'audit',
          label: 'Riwayat Perubahan',
          sublabel: 'Audit Trail Sistem',
          icon: ShieldCheck,
          visible: isSuperAdmin || isBranchAdmin,
        },
      ],
    },
    {
      groupTitle: 'KONFIGURASI',
      items: [
        {
          id: 'sites',
          label: 'Site & Mitra (L2)',
          sublabel: 'Manajemen Lokasi',
          icon: MapPin,
          visible: isSuperAdmin || isBranchAdmin,
        },
        {
          id: 'categories',
          label: 'Kategori (L3)',
          sublabel: 'Klasifikasi Perangkat',
          icon: Tag,
          visible: isSuperAdmin || isBranchAdmin,
        },
        {
          id: 'branches',
          label: 'Cabang (L1)',
          sublabel: 'Kantor Regional',
          icon: Building2,
          visible: isSuperAdmin,
        },
        {
          id: 'segments',
          label: 'Segmen',
          sublabel: 'Unit Bisnis',
          icon: Boxes,
          visible: isSuperAdmin,
        },
        {
          id: 'users',
          label: 'Kelola User',
          sublabel: 'RBAC & Akses',
          icon: Users,
          visible: isSuperUser,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#142522]/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fixed width 260px expanded / 76px collapsed */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#183B3A] dark:bg-[#142522] text-[#F4F2EB] dark:text-[#F1F5F2] border-r border-[#245451] dark:border-[#355047] transition-all duration-300 ease-in-out select-none flex-shrink-0
          ${collapsed ? 'lg:w-[76px] lg:min-w-[76px] lg:max-w-[76px]' : 'lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px]'}
          ${mobileOpen ? 'translate-x-0 w-[270px] max-w-[85vw]' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Brand Area */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-[#245451] dark:border-[#355047] bg-[#143231]/80 dark:bg-[#11201D]/90 shrink-0">
          <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/95 dark:bg-[#1D332E] border border-[#D9A441]/50 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img src={sambaSLogo} alt="SAMBA Logo" className="w-full h-full object-contain drop-shadow-sm scale-105" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-tight text-white dark:text-[#F1F5F2] truncate">
                    SAMBA ASSET
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40 shrink-0">
                    v3.0
                  </span>
                </div>
                <p className="text-[10px] text-[#A0B0A8] dark:text-[#829A8F] font-medium truncate leading-tight">
                  Asset Management System
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#A0B0A8] dark:text-[#829A8F] hover:text-white dark:hover:text-[#F1F5F2] hover:bg-[#245451] dark:hover:bg-[#2B4840] transition-colors shrink-0"
            title={collapsed ? 'Perluas Sidebar (260px)' : 'Ciutkan Sidebar (76px)'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#A0B0A8] dark:text-[#829A8F] hover:text-white dark:hover:text-[#F1F5F2] hover:bg-[#245451] dark:hover:bg-[#2B4840]"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 no-scrollbar">
          {menuGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {/* Group Title */}
                {(!collapsed || mobileOpen) ? (
                  <div className="px-2.5 pt-3 pb-1 text-[10px] font-bold text-[#A0B0A8] dark:text-[#829A8F] tracking-widest uppercase">
                    {group.groupTitle}
                  </div>
                ) : (
                  <div className="my-2 border-t border-[#245451]/60 dark:border-[#355047]/60" />
                )}

                {/* Items */}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <div key={item.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        title={collapsed && !mobileOpen ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left relative
                          ${
                            isActive
                              ? 'bg-[#245451] dark:bg-[#31584C] text-white dark:text-[#F1F5F2] font-bold shadow-sm'
                              : 'text-[#DDF3EC]/90 dark:text-[#B8CCC3] hover:text-white dark:hover:text-[#F1F5F2] hover:bg-[#245451]/60 dark:hover:bg-[#2B4840]'
                          }
                          ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}
                        `}
                      >
                        {/* Active Indicator Bar (Muted Gold Accent) */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#D9A441]" />
                        )}

                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                            isActive ? 'text-[#D9A441] scale-105' : 'text-[#A0B0A8] dark:text-[#829A8F] group-hover:text-white dark:group-hover:text-[#F1F5F2]'
                          }`}
                        />

                        {(!collapsed || mobileOpen) && (
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                            <span className="truncate whitespace-nowrap">{item.label}</span>
                            {item.badge && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#DDF3EC]/20 text-[#DDF3EC]'}`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Tooltip on Collapsed Desktop */}
                      {collapsed && !mobileOpen && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#143231] dark:bg-[#1D332E] text-white dark:text-[#F1F5F2] text-xs rounded-xl shadow-2xl border border-[#245451] dark:border-[#355047] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 font-medium">
                          <div className="font-bold text-[#DDF3EC] dark:text-[#8DD6BB]">{item.label}</div>
                          {item.sublabel && <div className="text-[10px] text-[#A0B0A8] dark:text-[#829A8F]">{item.sublabel}</div>}
                          {item.badge && (
                            <div className="mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C94B4B]/30 text-[#FFA4A4]">
                                {item.badge}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer / User Scope Brief */}
        <div className="p-3 border-t border-[#245451] dark:border-[#355047] bg-[#143231]/90 dark:bg-[#11201D]/90 text-xs shrink-0">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#245451] dark:bg-[#223B35] border border-[#D9A441]/40 text-[#D9A441] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'SA'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white dark:text-[#F1F5F2] font-semibold text-xs truncate">
                  {user?.username || 'User'}
                </div>
                <div className="text-[10px] text-[#A0B0A8] dark:text-[#829A8F] font-medium truncate">
                  {user?.role || 'Guest'} {user?.branch ? `• ${user.branch.code}` : ''}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-8 h-8 rounded-lg bg-[#245451] dark:bg-[#223B35] border border-[#D9A441]/40 text-[#D9A441] flex items-center justify-center font-bold text-xs"
                title={`${user?.username} (${user?.role})`}
              >
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'SA'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
