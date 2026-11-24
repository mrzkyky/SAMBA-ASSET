import React from 'react';
import {
  Building2,
  MapPin,
  Tag,
  Box,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MinusCircle,
  Gift,
  Activity,
} from 'lucide-react';

const StatsOverview = ({
  stats,
  selectedBranch = '',
  branches = [],
  user = null,
  onOpenMissingSNTracker = null,
}) => {
  if (!stats) return null;

  const currentBranch = branches?.find((b) => String(b.id) === String(selectedBranch));
  const isBranchScoped = Boolean(selectedBranch && currentBranch);

  const totalAssetsCount = Number(stats.total_units || stats.total_assets || 0);
  const activeCount = Number(stats.active_assets || 0);
  const activePercent = totalAssetsCount > 0 ? Math.round((activeCount / totalAssetsCount) * 100) : 0;

  const cards = [
    {
      id: 'branches',
      label: isBranchScoped ? 'Cakupan Cabang' : 'Cabang Daerah',
      value: isBranchScoped ? currentBranch.name : (stats.total_branches || 0),
      icon: Building2,
      accentColor: 'text-[#0F766E] dark:text-[#8DD6BB]',
      badgeBg: 'bg-[#DDF3EC] text-[#0F766E] border-[#BBE5D7] dark:bg-[#31584C]/40 dark:text-[#8DD6BB] dark:border-[#355047]',
      subtext: isBranchScoped ? `Kode: ${currentBranch.code} • ${currentBranch.province || 'Regional'}` : 'Level 1 Hirarki Regional',
      isHero: false,
    },
    {
      id: 'sites',
      label: 'Mitra & Site Spesifik',
      value: stats.total_sites || 0,
      icon: MapPin,
      accentColor: 'text-[#527DA8] dark:text-[#8DD6BB]',
      badgeBg: 'bg-[#E8EFF6] text-[#527DA8] border-[#CADCEB] dark:bg-[#223B35] dark:text-[#8DD6BB] dark:border-[#355047]',
      subtext: isBranchScoped ? `Site terhubung di ${currentBranch.name}` : 'Level 2 Lokasi & Partner',
      isHero: false,
    },
    {
      id: 'categories',
      label: 'Kategori Perangkat',
      value: stats.total_categories || 0,
      icon: Tag,
      accentColor: 'text-[#C58B32] dark:text-[#D9A441]',
      badgeBg: 'bg-[#FDF6E9] text-[#C58B32] border-[#F5E2BE] dark:bg-[#D9A441]/10 dark:text-[#D9A441] dark:border-[#D9A441]/30',
      subtext: isBranchScoped ? `Klasifikasi di ${currentBranch.name}` : 'Level 3 Klasifikasi Alat',
      isHero: false,
    },
    {
      id: 'assets',
      label: 'Total Unit Aset',
      value: totalAssetsCount,
      icon: Box,
      accentColor: 'text-[#D9A441]',
      badgeBg: 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441]/40',
      subtext: isBranchScoped ? `${stats.total_assets || 0} Rekord • ${activePercent}% Siap Operasi` : `${stats.total_assets || 0} Data Rekord Nasional`,
      isHero: true,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      
      {/* 4 KPI Cards Grid: Varied Layout & Visual Emphasis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          if (card.isHero) {
            return (
              <div
                key={card.id}
                className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#183B3A] dark:bg-[#1D332E] text-white border border-[#245451] dark:border-[#355047] shadow-lg shadow-[#142522]/30 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9A441]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] sm:text-xs font-bold text-[#A8D3C8] dark:text-[#8DD6BB] uppercase tracking-wider truncate">
                        {card.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/30">
                        Nasional
                      </span>
                    </div>
                    <h3 className="font-extrabold text-white dark:text-[#F1F5F2] mt-1 text-2xl sm:text-3xl tracking-tight truncate">
                      {card.value.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#245451] dark:bg-[#223B35] text-[#D9A441] border border-[#3A6B68] dark:border-[#355047] shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#245451] dark:border-[#355047] flex items-center justify-between text-[11px] text-[#A8D3C8] dark:text-[#B8CCC3] relative z-10">
                  <span className="truncate">{card.subtext}</span>
                  <div className="flex items-center space-x-1 shrink-0 font-bold text-[#D9A441]">
                    <Activity className="w-3.5 h-3.5 text-[#16845B] dark:text-[#8DD6BB]" />
                    <span>{activePercent}% Aktif</span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1D332E] border border-[#E4E5DC] dark:border-[#355047] shadow-sm transition-all hover:border-[#D5D7CB] dark:hover:border-[#2B4840] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-[#718078] dark:text-[#829A8F] uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  <h3
                    className="font-extrabold text-[#27332F] dark:text-[#F1F5F2] mt-1 text-xl sm:text-2xl tracking-tight truncate"
                    title={String(card.value)}
                  >
                    {typeof card.value === 'number' ? card.value.toLocaleString('id-ID') : card.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl border shrink-0 ${card.badgeBg}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F4F2EB] dark:border-[#355047] text-[10px] sm:text-[11px] text-[#718078] dark:text-[#829A8F] truncate">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Status & Ownership Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1D332E] border border-[#E4E5DC] dark:border-[#355047] shadow-sm space-y-3">
        
        {/* Top Line: Scope & Ownership Split */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#F4F2EB] dark:border-[#355047]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#718078] dark:text-[#829A8F] uppercase tracking-wider">
              {isBranchScoped ? 'Lingkup Wilayah:' : 'Ringkasan Nasional:'}
            </span>
            {isBranchScoped ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDF3EC] text-[#0F766E] border border-[#BBE5D7] dark:bg-[#31584C] dark:text-[#8DD6BB] dark:border-[#355047]">
                {currentBranch.name} ({currentBranch.code})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F2EB] text-[#27332F] border border-[#E4E5DC] dark:bg-[#223B35] dark:text-[#F1F5F2] dark:border-[#355047]">
                Semua Cabang ({stats.total_branches || 0})
              </span>
            )}
          </div>

          {/* Ownership Breakdown */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#DDF3EC] text-[#0F766E] border border-[#BBE5D7] dark:bg-[#31584C]/40 dark:text-[#8DD6BB] dark:border-[#355047] text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 mr-1 text-[#0F766E] dark:text-[#8DD6BB]" />
              Aset Tetap: <strong className="ml-1 text-[#27332F] dark:text-[#F1F5F2] font-bold">{stats.fixed_assets || 0}</strong>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FDF6E9] text-[#C58B32] border border-[#F5E2BE] dark:bg-[#D9A441]/10 dark:text-[#D9A441] dark:border-[#D9A441]/30 text-xs font-medium">
              <Gift className="w-3.5 h-3.5 mr-1 text-[#C58B32] dark:text-[#D9A441]" />
              Aset Hibah: <strong className="ml-1 text-[#27332F] dark:text-[#F1F5F2] font-bold">{stats.grant_assets || 0}</strong>
            </span>
          </div>
        </div>

        {/* Bottom Line: Asset Health Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Status: Aktif */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#DDF3EC] text-[#16845B] border border-[#BBE5D7] dark:bg-[#31584C]/40 dark:text-[#8DD6BB] dark:border-[#355047] text-xs font-medium shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B] dark:text-[#8DD6BB]" />
              <span>Aktif: <strong className="text-[#27332F] dark:text-[#F1F5F2] font-bold ml-0.5">{stats.active_assets || 0}</strong></span>
            </div>

            {/* Status: Nonaktif */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F8F7F2] text-[#718078] border border-[#E4E5DC] dark:bg-[#223B35] dark:text-[#B8CCC3] dark:border-[#355047] text-xs font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#718078] dark:bg-[#829A8F]" />
              <span>Nonaktif: <strong className="text-[#27332F] dark:text-[#F1F5F2] font-bold ml-0.5">{stats.inactive_assets || 0}</strong></span>
            </div>

            {/* Status: Pasif */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#E8EFF6] text-[#527DA8] border border-[#CADCEB] dark:bg-[#223B35] dark:text-[#8DD6BB] dark:border-[#355047] text-xs font-medium shadow-sm">
              <MinusCircle className="w-3.5 h-3.5 text-[#527DA8] dark:text-[#8DD6BB]" />
              <span>Pasif: <strong className="text-[#27332F] dark:text-[#F1F5F2] font-bold ml-0.5">{stats.passive_assets || 0}</strong></span>
            </div>

            {/* Status: Maintenance */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FDF6E9] text-[#C58B32] border border-[#F5E2BE] dark:bg-[#D9A441]/15 dark:text-[#D9A441] dark:border-[#D9A441]/30 text-xs font-medium shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-[#C58B32] dark:text-[#D9A441]" />
              <span>Maintenance: <strong className="text-[#27332F] dark:text-[#F1F5F2] font-bold ml-0.5">{stats.maintenance_assets || stats.backup_assets || 0}</strong></span>
            </div>

            {/* Status: Rusak */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FDF0F0] text-[#C94B4B] border border-[#F8D2D2] dark:bg-[#C94B4B]/20 dark:text-[#FFA4A4] dark:border-[#C94B4B]/40 text-xs font-medium shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C94B4B] dark:text-[#FFA4A4]" />
              <span>Rusak: <strong className="text-[#27332F] dark:text-[#F1F5F2] font-bold ml-0.5">{stats.damaged_assets || 0}</strong></span>
            </div>
          </div>

          {/* Missing Serial Number Trigger */}
          {Boolean(stats.missing_sn_assets) && (
            <button
              type="button"
              onClick={onOpenMissingSNTracker}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FDF0F0] hover:bg-[#FBE4E4] text-[#C94B4B] border border-[#F8D2D2] dark:bg-[#C94B4B]/20 dark:hover:bg-[#C94B4B]/30 dark:text-[#FFA4A4] dark:border-[#C94B4B]/40 text-xs font-bold shadow-sm transition-all active:scale-95"
              title="Buka Pelacak Site & Mitra Tanpa Serial Number"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#C94B4B] dark:text-[#FFA4A4]" />
              <span>Tanpa SN: <strong className="text-[#27332F] dark:text-[#F1F5F2] ml-0.5">{stats.missing_sn_assets} Unit</strong> ({stats.missing_sn_sites || 0} Site)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default StatsOverview;
