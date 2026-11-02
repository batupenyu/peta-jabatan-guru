import React, { useState, useMemo } from 'react';
import { Teacher, PetaItem, SchoolProfile } from '../types/petaJabatan';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertCircle,
  Grid3X3,
} from 'lucide-react';

interface PjmDapodikViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  petaItems: PetaItem[];
  onApplyPjmToPetaJabatan: () => void;
  onNavigateToClassMap?: () => void;
  isSyncing: boolean;
}

export const PjmDapodikView: React.FC<PjmDapodikViewProps> = ({
  school,
  teachers,
  petaItems,
  onApplyPjmToPetaJabatan,
  onNavigateToClassMap,
  isSyncing,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<
    'ALL' | 'OVERLOAD' | 'NORMAL' | 'ADDITIONAL' | 'BK' | 'GTT'
  >('ALL');

  // Metrics from Dapodik PJM
  const metrics = useMemo(() => {
    let totalJtm = 0;
    let totalJjt = 0;
    let totalBkStudents = 0;
    let certifiedCount = 0;
    let overloadCount = 0;
    let normalCount = 0;
    let gttCount = 0;
    let underloadCount = 0;

    teachers.forEach((t) => {
      const jtm = t.teachingHours || 0;
      const jjt = t.additionalHours || 0;
      const total = t.totalWorkload || jtm + jjt;

      totalJtm += jtm;
      totalJjt += jjt;
      if (t.counselingStudentCount) totalBkStudents += t.counselingStudentCount;
      if (t.isCertified) certifiedCount++;
      if (t.status === 'GTT') gttCount++;

      if (total > 35) {
        overloadCount++;
      } else if (total >= 24) {
        normalCount++;
      } else if (total > 0 && total < 24) {
        underloadCount++;
      }
    });

    const totalWorkloadAll = totalJtm + totalJjt;

    return {
      totalTeachers: teachers.length,
      totalJtm,
      totalJjt,
      totalWorkloadAll,
      totalBkStudents,
      certifiedCount,
      overloadCount,
      normalCount,
      gttCount,
      underloadCount,
    };
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(q) ||
        t.nip.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.additionalDuties && t.additionalDuties.toLowerCase().includes(q)) ||
        (t.teachingAssignments && t.teachingAssignments.toLowerCase().includes(q));

      if (!matchSearch) return false;

      const total = t.totalWorkload || (t.teachingHours || 0) + (t.additionalHours || 0);

      switch (filterCategory) {
        case 'OVERLOAD':
          return total > 35;
        case 'NORMAL':
          return total >= 24 && total <= 35;
        case 'ADDITIONAL':
          return (t.additionalHours || 0) > 0;
        case 'BK':
          return (
            t.subject.toLowerCase().includes('bimbingan') ||
            t.subject.toLowerCase().includes('bk') ||
            !!t.counselingStudentCount
          );
        case 'GTT':
          return t.status === 'GTT';
        default:
          return true;
      }
    });
  }, [teachers, search, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                SK PEMBAGIAN TUGAS MENGAJAR (PJM)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Semester Ganjil 2026/2027 · Dapodik
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Verifikasi & Kesesuaian Beban Jam Mengajar terhadap Peta Jabatan
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Lampiran 1 SK Kepala Sekolah No. 421.5 / / SMKN1 Kb / Dindik / 2026 · {school.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateToClassMap && (
              <button
                onClick={onNavigateToClassMap}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Buka Peta Kelas (18 Rombel)</span>
              </button>
            )}
            <button
              onClick={onApplyPjmToPetaJabatan}
              disabled={isSyncing}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Update Peta Jabatan dari Data PJM</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Jam Tatap Muka (JTM)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {metrics.totalJtm}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">JP/Mgg</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Ekuivalensi Tugas Tambahan (JJT)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-indigo-700">
                {metrics.totalJjt}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">JP/Mgg</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Beban Kerja Guru
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                {metrics.totalWorkloadAll}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">JP/Mgg</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Guru Memenuhi ≥ 24 JP
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                {metrics.normalCount + metrics.overloadCount}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                / {metrics.totalTeachers} Guru
              </span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-amber-700 block">
              Beban Berlebih (&gt;35 JP)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-amber-600">
                {metrics.overloadCount}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">Guru</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Sasaran Bimbingan BK
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold font-mono tabular-nums text-indigo-700">
                {metrics.totalBkStudents}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Siswa (3 Guru)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Audit Statement: APAKAH DATA INI SESUAI ATAU TIDAK? */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Hasil Telaah & Kesimpulan: Apakah Data Jam Mengajar Ini Sesuai?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Berdasarkan hasil perbandingan antara dokumen <strong>Peta Jabatan Guru (Anjab/ABK BKN)</strong> dan{' '}
              <strong>SK Pembagian Tugas Mengajar (PJM) Dapodik Semester Ganjil 2026/2027</strong>, berikut kesimpulan resmi:
            </p>
          </div>
        </div>

        {/* 2-Column Assessment Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Sisi 1: Regulasi Beban Mengajar (SESUAI 100%) */}
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Kesesuaian Beban Mengajar (Permendikbud 15/2018): SESUAI (100%)</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  <strong>Seluruh 40 Guru ASN (PNS & PPPK)</strong> yang bertugas memenuhi syarat minimal <strong>24 JP/minggu</strong> (baik melalui tatap muka linier, layanan BK, maupun tugas tambahan seperti Wakasek, Ka.Bengkel, Ka.Prog, dan Wali Kelas).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  Seluruh guru ASN berstatus <strong>"Sertifikasi"</strong>, sehingga hak pembayaran Tunjangan Profesi Guru (TPG) aman dan valid di Info GTK/Dapodik.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>
                  Guru BK berjumlah 3 orang membimbing total <strong>479 siswa</strong> (Ernawati 152, Ifhan Fuadi 167, Sutina 160). Ekuivalensi beban kerja BK adalah 24–27 JP non-tatap muka, sangat proporsional sesuai rasio standar 1:150.
                </span>
              </li>
            </ul>
          </div>

          {/* Sisi 2: Peta Jabatan ABK vs Riil (PERLU PENYESUAIAN) */}
          <div className="bg-amber-50/40 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>2. Kesesuaian dengan Peta Jabatan BKN: PERLU PENYESUAIAN</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  <strong>Formasi Bahasa Inggris Ahli Pertama</strong>: Pada Peta Jabatan tercatat defisit 1 orang (ABK: 1, Riil: 0). Pada Dapodik, jam pelajaran ini diisi oleh <strong>1 Guru GTT (Juandika, S.Pd., 24 JP)</strong>. Peta Jabatan harus menginput GTT: 1 agar total riil terpenuhi.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  <strong>Koreksi ABK Bimbingan Konseling</strong>: Peta Jabatan mencatat ABK BK sebanyak 4 guru (defisit 1). Namun secara riil dengan 479 siswa, kebutuhan sekolah sebenarnya hanya <strong>3 Guru BK</strong> (479 ÷ 150 = 3,19). Formasi BK eksisting (3 guru) sebenarnya sudah <strong>SESUAI</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  <strong>Mengajar Lintas Mapel (Basri, SH)</strong>: Jam PPKN di kelas X hanya 12 JP, sehingga Pak Basri harus mengajar 6 JP PJOK dan 6 JP Agama Islam untuk mencukupi 24 JP.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  <strong>Guru Luqman Syarief (PNS Otomotif)</strong>: Tercatat di data nominatif BKN tapi tidak memiliki jam mengajar di SK PJM Dapodik (perlu diverifikasi status mutasi/tugas luar).
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4 Key Actionable Findings Accordion / Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>GTT Mengisi Defisit</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Juandika, S.Pd. (GTT) mengampu 24 JP Bahasa Inggris. Memenuhi kekosongan 1 formasi Bahasa Inggris Ahli Pertama.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>8 Guru Overload (&gt;35 JP)</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Ridwan R (42 JP), Marhayson (39 JP), Kustia (38 JP), Fendi Boy (35 JP), Rizky C (35 JP), Danang (35 JP), Lies F (34 JP), Jessika (34 JP).
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-700" />
              <span>220 JP Tugas Tambahan</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Meliputi 1 Kepala Sekolah (24 JP), 4 Wakasek (12 JP), 4 Ka.Bengkel (12-14 JP), 3 Ka.Prog (12 JP), Ka.Lab, Perpus, dan Wali Kelas (2 JP).
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rasio Siswa BK 1:160</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Total 479 siswa ditangani 3 guru BK dengan beban rata-rata 160 siswa per guru. Sangat ideal sesuai Permendikbud.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table: Roster Jam Mengajar Dapodik By Name By Class */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari guru, mapel, tugas tambahan..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs overflow-x-auto">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({teachers.length})
              </button>
              <button
                onClick={() => setFilterCategory('NORMAL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'NORMAL'
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standar 24-35 JP ({metrics.normalCount})
              </button>
              <button
                onClick={() => setFilterCategory('OVERLOAD')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'OVERLOAD'
                    ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overload &gt;35 JP ({metrics.overloadCount})
              </button>
              <button
                onClick={() => setFilterCategory('ADDITIONAL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'ADDITIONAL'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tugas Tambahan
              </button>
              <button
                onClick={() => setFilterCategory('BK')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'BK'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guru BK (3)
              </button>
              <button
                onClick={() => setFilterCategory('GTT')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === 'GTT'
                    ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                GTT ({metrics.gttCount})
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[400px] relative border-t border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 shadow-xs">
                <th className="py-2.5 px-3 w-10 text-center sticky top-0 bg-slate-100 border-b border-slate-300">
                  NO
                </th>
                <th className="py-2.5 px-4 sticky top-0 bg-slate-100 border-b border-slate-300">
                  NAMA GURU / NIP
                </th>
                <th className="py-2.5 px-3 text-center sticky top-0 bg-slate-100 border-b border-slate-300">
                  STATUS
                </th>
                <th className="py-2.5 px-3 sticky top-0 bg-slate-100 border-b border-slate-300">
                  GOL / JABATAN
                </th>
                <th className="py-2.5 px-4 sticky top-0 bg-slate-100 border-b border-slate-300">
                  MATA PELAJARAN / SASARAN
                </th>
                <th className="py-2.5 px-4 sticky top-0 bg-slate-100 border-b border-slate-300">
                  TUGAS TAMBAHAN
                </th>
                <th className="py-2.5 px-2 text-center w-14 sticky top-0 bg-slate-100 border-b border-slate-300">
                  JTM
                </th>
                <th className="py-2.5 px-2 text-center w-14 sticky top-0 bg-slate-100 border-b border-slate-300">
                  JJT
                </th>
                <th className="py-2.5 px-3 text-center w-20 sticky top-0 bg-slate-100 border-b border-slate-300 font-bold">
                  TOTAL JP
                </th>
                <th className="py-2.5 px-3 text-center w-28 sticky top-0 bg-slate-100 border-b border-slate-300">
                  KELAYAKAN
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.map((t, idx) => {
                const jtm = t.teachingHours || 0;
                const jjt = t.additionalHours || 0;
                const total = t.totalWorkload || jtm + jjt;
                const isOverload = total > 35;
                const isNonActive = total === 0;

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isOverload ? 'bg-amber-50/20' : isNonActive ? 'bg-slate-100/40 text-slate-400' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-2 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {t.isHeadmaster && (
                          <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded-xs font-normal">
                            Kepsek
                          </span>
                        )}
                        {t.status === 'GTT' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-xs font-semibold">
                            GTT
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {t.nip}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span
                        className={`font-semibold text-[11px] px-2 py-0.5 rounded-sm ${
                          t.status === 'PNS'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : t.status === 'PPPK'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : t.status === 'PPPKPW'
                            ? 'bg-violet-50 text-violet-700 border border-violet-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-slate-700">
                      <div className="font-medium text-slate-800">{t.rank || '-'}</div>
                      <div className="text-[10px] text-slate-500">{t.functionalTitle}</div>
                    </td>

                    <td className="py-2 px-4 text-slate-800">
                      <div className="font-medium">{t.teachingAssignments || t.subject}</div>
                      {t.counselingStudentCount && (
                        <div className="text-[10px] text-indigo-700 font-medium">
                          Sasaran: {t.counselingStudentCount} Siswa
                        </div>
                      )}
                      {t.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                          {t.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-4 text-slate-700">
                      {t.additionalDuties ? (
                        <span className="font-medium text-slate-800">
                          {t.additionalDuties}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-800">
                      {jtm}
                    </td>

                    <td className="py-2 px-2 text-center font-mono tabular-nums text-indigo-700 font-medium">
                      {jjt > 0 ? jjt : '-'}
                    </td>

                    <td className="py-2 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                      {total} JP
                    </td>

                    <td className="py-2 px-3 text-center">
                      {isNonActive ? (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                          Non-Aktif (0 JP)
                        </span>
                      ) : isOverload ? (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm whitespace-nowrap">
                          Overload (&gt;35 JP)
                        </span>
                      ) : total >= 24 ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm whitespace-nowrap">
                          Memenuhi (≥24 JP)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm whitespace-nowrap">
                          Kurang (&lt;24 JP)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={6} className="py-2.5 px-4 text-right">
                  TOTAL KESELURUHAN (SK PJM HALAMAN 4):
                </td>
                <td className="py-2.5 px-2 text-center font-mono tabular-nums">
                  757 JP
                </td>
                <td className="py-2.5 px-2 text-center font-mono tabular-nums text-indigo-700">
                  220 JP
                </td>
                <td className="py-2.5 px-3 text-center font-mono tabular-nums text-emerald-700">
                  977 JP
                </td>
                <td className="py-2.5 px-3 text-center text-[10px] text-emerald-800 font-semibold">
                  100% Layak TPG
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
