import React from 'react';
import { SummaryStats } from '../types/petaJabatan';
import { Users, UserCheck, AlertCircle, CheckCircle2, Award } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const isDeficit = stats.totalDeficit > 0;
  const isSurplus = stats.totalSurplus > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Kebutuhan ABK */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Kebutuhan Formasi (ABK)</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {stats.totalAbk}
          </span>
          <span className="text-xs text-slate-500 font-medium">guru</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Standar beban jam 24 jam/minggu
        </p>
      </div>

      {/* 2. Total Guru Eksisting */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Guru Eksisting Saat Ini</span>
          <UserCheck className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {stats.totalExisting}
          </span>
          <span className="text-xs text-slate-500 font-medium">guru</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono tabular-nums">
          <span>PNS: {stats.totalPns}</span>
          <span>·</span>
          <span>PPPK: {stats.totalPppk}</span>
          <span>·</span>
          <span>GTT: {stats.totalGtt}</span>
        </div>
      </div>

      {/* 3. Selisih / Status Kebutuhan */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Status Formasi</span>
          {isDeficit ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
              isDeficit
                ? 'text-amber-600'
                : isSurplus
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}
          >
            {isDeficit
              ? `-${stats.totalDeficit}`
              : isSurplus
              ? `+${stats.totalSurplus}`
              : '0'}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            {isDeficit ? 'Kurang (Defisit)' : isSurplus ? 'Kelebihan' : 'Ideal Sesuai'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
          {stats.deficitSubjectsCount} mapel kurang · {stats.balancedSubjectsCount} mapel pas
        </p>
      </div>

      {/* 4. Persentase Keterpenuhan */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Tingkat Pemenuhan</span>
          <Award className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {stats.fulfillmentRate}%
          </span>
          <span className="text-xs text-slate-500 font-medium">terisi</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${
              stats.fulfillmentRate >= 95
                ? 'bg-emerald-500'
                : stats.fulfillmentRate >= 80
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, stats.fulfillmentRate)}%` }}
          />
        </div>
      </div>

      {/* 5. Rasio ASN */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Rasio ASN (PNS + PPPK)</span>
          <span className="text-[11px] text-emerald-600 font-semibold font-mono tabular-nums">
            {stats.asnRatio}%
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {stats.totalPns + stats.totalPppk}
          </span>
          <span className="text-xs text-slate-500 font-medium">dari {stats.totalExisting}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {stats.totalGtt > 0
            ? `${stats.totalGtt} guru GTT belum diangkat`
            : '100% Tenaga Pendidik ASN'}
        </p>
      </div>
    </div>
  );
};
