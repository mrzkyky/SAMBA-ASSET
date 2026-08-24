import React from 'react';
import { Building2, MapPin, Tag, Box, CheckCircle2, AlertTriangle, RefreshCw, MinusCircle } from 'lucide-react';

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
    <div className="space-y-4 mb-8">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-900/90 border ${card.borderColor} shadow-lg transition-all hover:border-slate-700 hover:translate-y-[-2px]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <h3 className={`font-bold text-white mt-1 ${isBranchScoped && idx === 0 ? 'text-xl sm:text-2xl truncate max-w-[180px]' : 'text-2xl'}`} title={String(card.value)}>
                    {card.value}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{card.subtext}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {isBranchScoped ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Perangkat Cabang:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {currentBranch.name} ({currentBranch.code})
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Perangkat Nasional (Seluruh Cabang):</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aktif: <strong className="text-white text-sm ml-1">{stats.active_assets}</strong> unit</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <MinusCircle className="w-4 h-4" />
            <span>Pasif: <strong className="text-white text-sm ml-1">{stats.passive_assets || 0}</strong> unit</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <RefreshCw className="w-4 h-4" />
            <span>Cadangan / Spare: <strong className="text-white text-sm ml-1">{stats.backup_assets}</strong> unit</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Rusak: <strong className="text-white text-sm ml-1">{stats.damaged_assets}</strong> unit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
