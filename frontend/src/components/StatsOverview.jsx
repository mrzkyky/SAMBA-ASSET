import React from 'react';
import { Building2, MapPin, Tag, Box, CheckCircle2, AlertTriangle, RefreshCw, MinusCircle, Gift } from 'lucide-react';

const StatsOverview = ({ stats, selectedBranch = '', branches = [], user = null }) => {
  if (!stats) return null;

  const currentBranch = branches?.find((b) => String(b.id) === String(selectedBranch));
  const isBranchScoped = Boolean(selectedBranch && currentBranch);

  const cards = [
    {
      label: isBranchScoped ? 'Cakupan Cabang' : 'Cabang Daerah',
      value: isBranchScoped ? currentBranch.name : stats.total_branches,
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      subtext: isBranchScoped ? `Kode: ${currentBranch.code} • ${currentBranch.province || 'Regional'}` : 'Level 1 Hirarki Nasional',
    },
    {
      label: 'Mitra & Site Spesifik',
      value: stats.total_sites,
      icon: MapPin,
      color: 'from-cyan-500 to-teal-600',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      subtext: isBranchScoped ? `Site di Cabang ${currentBranch.name}` : 'Level 2 Hirarki Nasional',
    },
    {
      label: 'Kategori Perangkat',
      value: stats.total_categories,
      icon: Tag,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      subtext: isBranchScoped ? `Kategori Aktif di ${currentBranch.name}` : 'Level 3 Hirarki Nasional',
    },
    {
      label: 'Total Unit Aset',
      value: stats.total_units || stats.total_assets,
      icon: Box,
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      subtext: isBranchScoped ? `${stats.total_assets} Rekord Aset ${currentBranch.name}` : `${stats.total_assets} Data Rekord Nasional`,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      {/* Top 4 KPI Cards: 2x2 on Mobile, 4 in a row on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border ${card.borderColor} shadow-lg transition-all hover:border-slate-700`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{card.label}</p>
                  <h3 className="font-extrabold text-white mt-0.5 sm:mt-1 text-lg sm:text-2xl truncate" title={String(card.value)}>
                    {card.value}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">{card.subtext}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl ${card.bgColor} ${card.textColor} shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status & Ownership Breakdown Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {isBranchScoped ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Cakupan Cabang:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {currentBranch.name} ({currentBranch.code})
              </span>
            </div>
          ) : (
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Ringkasan Nasional:</span>
          )}

          {/* Ownership Breakdown Badges */}
          <div className="flex items-center space-x-1.5 pl-0 sm:pl-2 border-l-0 sm:border-l sm:border-slate-800">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] sm:text-xs font-semibold">
              <Building2 className="w-3 h-3 mr-1 text-blue-400" />
              Aset Tetap: <strong className="text-white ml-1">{stats.fixed_assets || 0}</strong>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold">
              <Gift className="w-3 h-3 mr-1 text-amber-400" />
              Aset Hibah: <strong className="text-white ml-1">{stats.grant_assets || 0}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-medium shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aktif: <strong className="text-white ml-0.5">{stats.active_assets || 0}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] sm:text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-0.5"></span>
            <span>Nonaktif: <strong className="text-white ml-0.5">{stats.inactive_assets || 0}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-medium shadow-sm">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Pasif: <strong className="text-white ml-0.5">{stats.passive_assets || 0}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] sm:text-xs font-medium shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Maintenance: <strong className="text-white ml-0.5">{stats.maintenance_assets || stats.backup_assets || 0}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] sm:text-xs font-medium shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Rusak: <strong className="text-white ml-0.5">{stats.damaged_assets || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
