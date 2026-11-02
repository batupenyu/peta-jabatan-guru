import React, { useState } from 'react';
import { PetaItem, SchoolProfile, SummaryStats, Teacher } from '../types/petaJabatan';
import { parseNip } from '../utils/teacherSync';
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Building2,
  Users2,
  ShieldAlert,
  Clock,
  UserCheck,
} from 'lucide-react';

interface AnalysisDashboardProps {
  school: SchoolProfile;
  items: PetaItem[];
  stats: SummaryStats;
  teachers?: Teacher[];
  aiAnalysisText: string | null;
  isAiLoading: boolean;
  onRunAiAnalysis: () => void;
  onNavigateToTeacherRoster?: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  school,
  items,
  stats,
  teachers = [],
  aiAnalysisText,
  isAiLoading,
  onRunAiAnalysis,
  onNavigateToTeacherRoster,
}) => {
  const [copied, setCopied] = useState(false);

  // Group by deficit & surplus
  const deficitItems = items.filter((i) => i.diff < 0);
  const surplusItems = items.filter((i) => i.diff > 0);

  // Parse teachers for retirement analysis
  const teachersWithInfo = teachers.map((t) => ({
    ...t,
    nipInfo: parseNip(t.nip, 2026),
  }));

  const retiringSoonTeachers = teachersWithInfo
    .filter((t) => t.nipInfo.yearsToRetirement <= 5)
    .sort((a, b) => a.nipInfo.yearsToRetirement - b.nipInfo.yearsToRetirement);

  // Level breakdowns
  const levelStats: Record<string, { count: number; pns: number; pppk: number; gtt: number; abk: number }> = {};
  for (const item of items) {
    if (!levelStats[item.level]) {
      levelStats[item.level] = { count: 0, pns: 0, pppk: 0, gtt: 0, abk: 0 };
    }
    levelStats[item.level].count += item.total;
    levelStats[item.level].pns += item.pns;
    levelStats[item.level].pppk += item.pppk;
    levelStats[item.level].gtt += item.gtt;
    levelStats[item.level].abk += item.abk;
  }

  const handleCopyAiAnalysis = () => {
    if (aiAnalysisText) {
      navigator.clipboard.writeText(aiAnalysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status Formasi Sekolah */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Resume Kebutuhan Formasi & Nominatif Guru
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Analisis Kepegawaian & Peta Jabatan {school.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Berdasarkan Analisis Beban Kerja (ABK) Tahun {school.year}, kebutuhan formasi guru tercatat {stats.totalAbk} orang dengan ketersediaan {stats.totalExisting} guru ({teachers.length} guru telah tersinkronisasi by name & by NIP).
            </p>
          </div>
          <button
            onClick={onRunAiAnalysis}
            disabled={isAiLoading}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto shrink-0 shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiLoading ? 'Menyusun Telaah AI...' : 'Generate Telaah Rekomendasi AI'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Defisit vs Proyeksi Pensiun vs Distribusi Jenjang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Mata Pelajaran Defisit (Darurat Formasi) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Mapel Defisit ({deficitItems.length})
              </h3>
            </div>
            <span className="text-xs font-semibold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
              Total Kurang {stats.totalDeficit}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Formasi berikut belum terpenuhi atau belum terisi guru terdaftar:
          </p>

          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
            {deficitItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Formasi Lengkap!</p>
                <p>Tidak ada mata pelajaran yang kekurangan guru.</p>
              </div>
            ) : (
              deficitItems.map((item) => (
                <div key={item.id} className="py-2.5 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block">
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.level}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">
                      Kurang {Math.abs(item.diff)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>ABK: {item.abk}</span>
                    <span>·</span>
                    <span>Eksisting: {item.total} (PNS {item.pns}, PPPK {item.pppk}, GTT {item.gtt})</span>
                  </div>
                  {item.notes && item.notes !== '-' && (
                    <div className="text-[11px] text-amber-700 bg-amber-50/50 p-1.5 rounded-sm">
                      Catatan: {item.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Analisis Proyeksi Pensiun Guru (BUP 60 Tahun Berdasarkan NIP) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Proyeksi Pensiun (1-5 Thn)
              </h3>
            </div>
            {onNavigateToTeacherRoster && (
              <button
                onClick={onNavigateToTeacherRoster}
                className="text-[11px] text-indigo-600 hover:underline"
              >
                Lihat Semua ({teachers.length}) →
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Daftar guru yang mendekati Batas Usia Pensiun (BUP 60 Tahun) berdasarkan data NIP resmi:
          </p>

          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
            {retiringSoonTeachers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Regenerasi Aman</p>
                <p>Tidak ada guru yang pensiun dalam 5 tahun ke depan.</p>
              </div>
            ) : (
              retiringSoonTeachers.map((t) => (
                <div key={t.id} className="py-2.5 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NIP: {t.nip} ({t.status})
                      </span>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-xs ${
                        t.nipInfo.yearsToRetirement <= 2
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Pensiun {t.nipInfo.retirementYear} ({t.nipInfo.yearsToRetirement} thn)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {t.functionalTitle} · {t.subject}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 3: Distribusi Jenjang & Kebijakan Formasi */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Distribusi Jenjang & Kebijakan
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(levelStats).map(([lvl, data]) => {
              const share =
                stats.totalExisting > 0
                  ? Math.round((data.count / stats.totalExisting) * 100)
                  : 0;

              return (
                <div key={lvl} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{lvl}</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {data.count} Guru ({share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tabular-nums pt-0.5">
                    <span>PNS: {data.pns} · PPPK: {data.pppk} · GTT: {data.gtt}</span>
                    <span>Kebutuhan ABK: {data.abk}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border border-slate-200 rounded-lg bg-indigo-50/40 text-xs space-y-1">
            <span className="font-bold text-indigo-950 block">Rekomendasi Suksesi Guru:</span>
            <p className="text-indigo-900 text-[11px]">
              Terdapat <strong>{retiringSoonTeachers.length} guru</strong> yang akan pensiun dalam 1-5 tahun ke depan (termasuk Basri pada 2027 dan Lismasari pada 2028). Usulkan formasi pengganti ke BKD sejak tahun anggaran berjalan.
            </p>
          </div>
        </div>
      </div>

      {/* AI Official Analysis Report Output Section */}
      {aiAnalysisText && (
        <div className="bg-white border border-indigo-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Laporan Telaah Staf & Rekomendasi Kebijakan Resmi (AI Engine)
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Sesuai Standar BKN, Kemdikbudristek, dan Data Nominatif 40 Guru Terdaftar
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyAiAnalysis}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Teks Laporan</span>
                </>
              )}
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/80 p-5 rounded-lg border border-slate-200">
            {aiAnalysisText}
          </div>
        </div>
      )}
    </div>
  );
};
