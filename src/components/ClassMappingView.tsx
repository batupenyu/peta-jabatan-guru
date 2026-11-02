import React, { useState, useMemo } from 'react';
import {
  CLASS_ROMBELS,
  TEACHER_CLASS_MAPPINGS,
  ClassRombel,
  TeacherClassMapping,
} from '../data/pjmClassDistribution';
import {
  Grid3X3,
  Search,
  Filter,
  Users,
  Layers,
  BookOpen,
  UserCheck,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const ClassMappingView: React.FC = () => {
  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'cards' | 'bk'>('matrix');
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 'X' | 'XI' | 'XII'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | 'KEJURUAN' | 'NORMATIF_ADAPTIF' | 'BK'
  >('ALL');
  const [activeClassDetailId, setActiveClassDetailId] = useState<string>('x-tsm');

  // Filter columns based on selectedGrade
  const filteredRombels = useMemo(() => {
    if (selectedGrade === 'ALL') return CLASS_ROMBELS;
    return CLASS_ROMBELS.filter((r) => r.grade === selectedGrade);
  }, [selectedGrade]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return TEACHER_CLASS_MAPPINGS.filter((t) => {
      // Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = t.teacherName.toLowerCase().includes(q);
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchNip = t.nip.includes(q);
        const matchClass = Object.keys(t.hoursByClass).some((cId) =>
          cId.toLowerCase().includes(q)
        );
        if (!matchName && !matchSubject && !matchNip && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [search, selectedCategory]);

  // Active class detail for Mode B
  const selectedClass = useMemo(() => {
    return CLASS_ROMBELS.find((r) => r.id === activeClassDetailId) || CLASS_ROMBELS[0];
  }, [activeClassDetailId]);

  // Teachers teaching in selectedClass
  const teachersInSelectedClass = useMemo(() => {
    return TEACHER_CLASS_MAPPINGS.filter((t) => (t.hoursByClass[selectedClass.id] || 0) > 0)
      .map((t) => ({
        teacher: t,
        hours: t.hoursByClass[selectedClass.id] || 0,
        mapelText: t.mapelDetailsByClass[selectedClass.id] || t.subject,
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [selectedClass]);

  // Total class hours calculated from matrix
  const currentTotalClassHours = useMemo(() => {
    return teachersInSelectedClass.reduce((sum, item) => sum + item.hours, 0);
  }, [teachersInSelectedClass]);

  // Grand total hours per rombel in footer
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    CLASS_ROMBELS.forEach((r) => {
      totals[r.id] = TEACHER_CLASS_MAPPINGS.reduce(
        (sum, t) => sum + (t.hoursByClass[r.id] || 0),
        0
      );
    });
    return totals;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-sm">
                PETA DISTRIBUSI ROMBEL & JAM MENGAJAR
              </span>
              <span className="text-xs text-slate-500 font-medium">
                18 Rombongan Belajar · 757 JP Tatap Muka
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Peta Kelas & Jam Mengajar Tenaga Pendidik
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Visualisasi distribusi penugasan guru di setiap rombel (Kelas X, XI, dan XII) berdasarkan SK Pembagian Tugas Mengajar Juli 2026.
            </p>
          </div>

          {/* Sub Navigation Modes */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matriks Grid Kelas</span>
            </button>
            <button
              onClick={() => setActiveViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eksplorasi per Rombel (18)</span>
            </button>
            <button
              onClick={() => setActiveViewMode('bk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeViewMode === 'bk'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-violet-600" />
              <span>Peta Guru BK (3)</span>
            </button>
          </div>
        </div>

        {/* Level Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Rombongan Belajar
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">18</span>
              <span className="text-xs text-slate-500 font-medium">Kelas</span>
            </div>
            <span className="text-[10px] text-slate-500">7 Kls X · 6 Kls XI · 5 Kls XII</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Jam Tatap Muka (JTM)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-emerald-700">757</span>
              <span className="text-xs text-slate-500 font-medium">JP/Minggu</span>
            </div>
            <span className="text-[10px] text-slate-500">Terdistribusi ke 18 Rombel</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Guru Pengampu di Kelas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-indigo-700">36</span>
              <span className="text-xs text-slate-500 font-medium">Guru Mapel</span>
            </div>
            <span className="text-[10px] text-slate-500">+ 3 Guru BK & 1 Kepsek</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Wali Kelas Terisi
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">18</span>
              <span className="text-xs text-emerald-700 font-medium">/ 18 Lengkap</span>
            </div>
            <span className="text-[10px] text-slate-500">Ekuivalensi 2 JP / Wali Kelas</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: FULL MATRIX GRID */}
      {activeViewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari guru, mapel, rombel..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Filter Tingkat Kelas */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedGrade('ALL')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Kelas (18)
                </button>
                <button
                  onClick={() => setSelectedGrade('X')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'X'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas X (7)
                </button>
                <button
                  onClick={() => setSelectedGrade('XI')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'XI'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas XI (6)
                </button>
                <button
                  onClick={() => setSelectedGrade('XII')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'XII'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas XII (5)
                </button>
              </div>

              {/* Filter Bidang Mapel */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedCategory('KEJURUAN')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === 'KEJURUAN'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kejuruan / Produktif
                </button>
                <button
                  onClick={() => setSelectedCategory('NORMATIF_ADAPTIF')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === 'NORMATIF_ADAPTIF'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Umum / Normatif
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-indigo-50 border border-indigo-300"></span>
              <span>Terisi Jam Tatap Muka</span>
            </div>
          </div>

          {/* Matrix Table with sticky headers */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-290px)] min-h-[460px] relative border-t border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 z-20">
                {/* Level Tier Header */}
                <tr className="bg-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider border-b border-slate-300">
                  <th
                    colSpan={3}
                    className="py-1 px-3 sticky left-0 z-30 bg-slate-200 border-r border-slate-300"
                  >
                    IDENTITAS GURU
                  </th>
                  {selectedGrade === 'ALL' || selectedGrade === 'X' ? (
                    <th
                      colSpan={CLASS_ROMBELS.filter((r) => r.grade === 'X').length}
                      className="py-1 px-2 text-center bg-sky-100 text-sky-900 border-r border-sky-300"
                    >
                      KELAS X (7 ROMBEL)
                    </th>
                  ) : null}
                  {selectedGrade === 'ALL' || selectedGrade === 'XI' ? (
                    <th
                      colSpan={CLASS_ROMBELS.filter((r) => r.grade === 'XI').length}
                      className="py-1 px-2 text-center bg-indigo-100 text-indigo-900 border-r border-indigo-300"
                    >
                      KELAS XI (6 ROMBEL)
                    </th>
                  ) : null}
                  {selectedGrade === 'ALL' || selectedGrade === 'XII' ? (
                    <th
                      colSpan={CLASS_ROMBELS.filter((r) => r.grade === 'XII').length}
                      className="py-1 px-2 text-center bg-violet-100 text-violet-900 border-r border-violet-300"
                    >
                      KELAS XII (5 ROMBEL)
                    </th>
                  ) : null}
                  <th
                    colSpan={3}
                    className="py-1 px-2 text-center bg-slate-300/80 text-slate-900"
                  >
                    BEBAN MENGAJAR (JP)
                  </th>
                </tr>

                {/* Individual Rombel Header */}
                <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 shadow-xs text-[11px]">
                  <th className="py-2.5 px-2 w-8 text-center sticky left-0 z-30 bg-slate-100 border-r border-slate-200">
                    NO
                  </th>
                  <th className="py-2.5 px-3 min-w-[200px] sticky left-8 z-30 bg-slate-100 border-r border-slate-200">
                    NAMA GURU / MAPEL
                  </th>
                  <th className="py-2.5 px-2 text-center w-14 sticky left-[232px] z-30 bg-slate-100 border-r border-slate-300">
                    STATUS
                  </th>

                  {/* Class Columns */}
                  {filteredRombels.map((rombel) => (
                    <th
                      key={rombel.id}
                      className="py-2 px-1 text-center min-w-[58px] border-r border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        setActiveClassDetailId(rombel.id);
                        setActiveViewMode('cards');
                      }}
                      title={`Klik untuk lihat rincian ${rombel.name} (Wali Kelas: ${rombel.homeroomTeacher})`}
                    >
                      <div className="font-bold text-slate-900">{rombel.name}</div>
                      <div className="text-[9px] text-slate-500 font-normal truncate max-w-[54px] mx-auto">
                        {rombel.majorCode}
                      </div>
                    </th>
                  ))}

                  <th className="py-2.5 px-2 text-center w-12 bg-slate-100 border-r border-slate-200 font-bold">
                    JTM
                  </th>
                  <th className="py-2.5 px-2 text-center w-12 bg-slate-100 border-r border-slate-200 text-indigo-700 font-bold">
                    JJT
                  </th>
                  <th className="py-2.5 px-2 text-center w-16 bg-slate-100 font-bold text-emerald-800">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredTeachers.map((t, idx) => {
                  const isBk = t.category === 'BK';
                  const isManajerial = t.category === 'MANAJERIAL';

                  return (
                    <tr key={t.teacherId} className="hover:bg-slate-50/80 transition-colors">
                      {/* NO */}
                      <td className="py-2 px-2 text-center font-mono text-slate-500 sticky left-0 z-10 bg-white border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* NAMA GURU & MAPEL */}
                      <td className="py-2 px-3 sticky left-8 z-10 bg-white border-r border-slate-200">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate max-w-[180px]">{t.teacherName}</span>
                          {t.status === 'GTT' && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded-xs font-semibold">
                              GTT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {t.subject}
                        </div>
                        {t.additionalDuties && (
                          <div className="text-[9px] text-indigo-700 truncate max-w-[180px] font-medium">
                            • {t.additionalDuties}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-2 px-1 text-center sticky left-[232px] z-10 bg-white border-r border-slate-300">
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.2 rounded-xs ${
                            t.status === 'PNS'
                              ? 'bg-slate-100 text-slate-800'
                              : t.status === 'PPPK'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Class columns */}
                      {filteredRombels.map((rombel) => {
                        const hours = t.hoursByClass[rombel.id] || 0;
                        const detail = t.mapelDetailsByClass[rombel.id];

                        if (isBk) {
                          return (
                            <td
                              key={rombel.id}
                              className="py-2 px-1 text-center border-r border-slate-100 bg-violet-50/10 text-slate-300 text-[10px]"
                            >
                              -
                            </td>
                          );
                        }

                        if (isManajerial) {
                          return (
                            <td
                              key={rombel.id}
                              className="py-2 px-1 text-center border-r border-slate-100 bg-slate-50/30 text-slate-300 text-[10px]"
                            >
                              -
                            </td>
                          );
                        }

                        return (
                          <td
                            key={rombel.id}
                            className={`py-2 px-1 text-center border-r border-slate-100 transition-colors ${
                              hours > 0
                                ? hours >= 12
                                  ? 'bg-indigo-100 text-indigo-900 font-bold'
                                  : hours >= 6
                                  ? 'bg-indigo-50 text-indigo-800 font-semibold'
                                  : 'bg-indigo-50/50 text-indigo-700 font-medium'
                                : 'text-slate-300'
                            }`}
                            title={
                              hours > 0
                                ? `${t.teacherName} di ${rombel.name}: ${detail || `${hours} JP`}`
                                : undefined
                            }
                          >
                            {hours > 0 ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-mono text-xs">{hours}</span>
                                {hours >= 12 && (
                                  <span className="text-[8px] uppercase tracking-tighter opacity-80">
                                    DPK
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-200">·</span>
                            )}
                          </td>
                        );
                      })}

                      {/* JTM */}
                      <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-800 border-r border-slate-200">
                        {t.totalJtm}
                      </td>

                      {/* JJT */}
                      <td className="py-2 px-1 text-center font-mono tabular-nums text-indigo-700 font-medium border-r border-slate-200">
                        {t.totalJjt > 0 ? t.totalJjt : '-'}
                      </td>

                      {/* TOTAL */}
                      <td className="py-2 px-1 text-center font-mono tabular-nums font-bold text-slate-900">
                        {t.totalBeban} JP
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Matrix Footer Totals */}
              <tfoot className="sticky bottom-0 z-20 bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 shadow-xs">
                <tr>
                  <td
                    colSpan={3}
                    className="py-2 px-3 text-right sticky left-0 z-30 bg-slate-100 border-r border-slate-300 text-[11px]"
                  >
                    JUMLAH JAM TATAP MUKA PER KELAS:
                  </td>

                  {filteredRombels.map((rombel) => (
                    <td
                      key={rombel.id}
                      className="py-2 px-1 text-center font-mono tabular-nums text-indigo-800 bg-slate-100 border-r border-slate-200"
                    >
                      {columnTotals[rombel.id] || rombel.totalWeeklyHours}
                    </td>
                  ))}

                  <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-900 border-r border-slate-200">
                    757
                  </td>
                  <td className="py-2 px-1 text-center font-mono tabular-nums text-indigo-700 border-r border-slate-200">
                    220
                  </td>
                  <td className="py-2 px-1 text-center font-mono tabular-nums text-emerald-800 font-bold">
                    977
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASS CARDS EXPLORER (18 CLASSES) */}
      {activeViewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 18 Class Selector Grid */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                <span>Pilih Rombongan Belajar (18 Rombel)</span>
                <span className="text-xs font-mono font-normal text-slate-500">
                  Total 18 Kelas
                </span>
              </h3>

              {/* Grouped by Grade */}
              <div className="space-y-4 text-xs">
                {/* Kelas X */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas X (7 Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CLASS_ROMBELS.filter((r) => r.grade === 'X').map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setActiveClassDetailId(r.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          activeClassDetailId === r.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm">{r.name}</div>
                        <div
                          className={`text-[10px] truncate ${
                            activeClassDetailId === r.id ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {r.homeroomTeacher.split(',')[0]}
                        </div>
                        <div
                          className={`mt-1 font-mono text-[10px] ${
                            activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {columnTotals[r.id] || r.totalWeeklyHours} JP / Mgg
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kelas XI */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas XI (6 Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CLASS_ROMBELS.filter((r) => r.grade === 'XI').map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setActiveClassDetailId(r.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          activeClassDetailId === r.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm">{r.name}</div>
                        <div
                          className={`text-[10px] truncate ${
                            activeClassDetailId === r.id ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {r.homeroomTeacher.split(',')[0]}
                        </div>
                        <div
                          className={`mt-1 font-mono text-[10px] ${
                            activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {columnTotals[r.id] || r.totalWeeklyHours} JP / Mgg
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kelas XII */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas XII (5 Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CLASS_ROMBELS.filter((r) => r.grade === 'XII').map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setActiveClassDetailId(r.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          activeClassDetailId === r.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm">{r.name}</div>
                        <div
                          className={`text-[10px] truncate ${
                            activeClassDetailId === r.id ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {r.homeroomTeacher.split(',')[0]}
                        </div>
                        <div
                          className={`mt-1 font-mono text-[10px] ${
                            activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {columnTotals[r.id] || r.totalWeeklyHours} JP / Mgg
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Breakdown of Selected Class */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
              {/* Header Class Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">{selectedClass.name}</span>
                    <span className="text-xs px-2 py-0.5 font-medium rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                      Tingkat {selectedClass.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Program Keahlian: <strong>{selectedClass.major}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">
                      Total Beban Rombel
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {currentTotalClassHours || selectedClass.totalWeeklyHours} JP
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">
                    <span className="text-[10px] uppercase font-semibold text-indigo-700 block">
                      Wali Kelas
                    </span>
                    <span className="text-xs font-bold block">{selectedClass.homeroomTeacher}</span>
                  </div>
                </div>
              </div>

              {/* Teachers List in this Class */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Daftar Guru Pengampu & Jam Mapel di {selectedClass.name}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({teachersInSelectedClass.length} Guru Pengampu)
                  </span>
                </h4>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {teachersInSelectedClass.map((item, idx) => (
                    <div
                      key={item.teacher.teacherId}
                      className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-mono text-xs text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{item.teacher.teacherName}</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded-xs font-mono ${
                                item.teacher.status === 'PNS'
                                  ? 'bg-slate-200 text-slate-800'
                                  : item.teacher.status === 'PPPK'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-amber-100 text-amber-800 font-bold'
                              }`}
                            >
                              {item.teacher.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-indigo-700 font-medium">
                            {item.mapelText}
                          </div>
                          <div className="text-[10px] text-slate-500">NIP: {item.teacher.nip}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                          {item.hours} JP
                        </span>
                        <span className="text-[10px] text-slate-500 block">/ Minggu</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: BK (COUNSELING) MAP */}
      {activeViewMode === 'bk' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-violet-50 text-violet-700 border border-violet-200 rounded-sm">
                LAMPIRAN 1 SK HALAMAN 5
              </span>
              <span className="text-xs text-slate-500">
                Sasaran Siswa Bimbingan dan Konseling SMKN 1 Koba
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Pemetaan Distribusi Siswa Asuh Guru BK per Tingkat
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Guru Bimbingan Konseling (BK) dihitung berdasarkan jumlah sasaran siswa asuh (ekuivalensi 24 JP = 150 siswa per regulasi Permendikbud).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEACHER_CLASS_MAPPINGS.filter((t) => t.category === 'BK').map((bk) => (
              <div
                key={bk.teacherId}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{bk.teacherName}</h3>
                    <p className="text-xs text-slate-500 font-mono">NIP: {bk.nip}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-violet-100 text-violet-800">
                      {bk.status} · {bk.subject}
                    </span>
                  </div>
                </div>

                {/* Student breakdown per grade */}
                {bk.counselingDetails && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Siswa Asuh Kelas X:</span>
                      <span className="font-mono font-bold">{bk.counselingDetails.classX} Siswa</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Siswa Asuh Kelas XI:</span>
                      <span className="font-mono font-bold">{bk.counselingDetails.classXI} Siswa</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Siswa Asuh Kelas XII:</span>
                      <span className="font-mono font-bold">{bk.counselingDetails.classXII} Siswa</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Total Seluruh Siswa:</span>
                      <span className="text-base font-bold font-mono text-indigo-700">
                        {bk.counselingDetails.totalStudents} Siswa
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-900">
                      <span className="text-[11px] font-medium">Beban Kerja Ekuivalen:</span>
                      <span className="font-bold font-mono">
                        {bk.counselingDetails.equivalentHours} JP Non-Tatap Muka
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Analisis Proporsionalitas Rasio Siswa BK SMKN 1 Koba</span>
            </div>
            <p className="leading-relaxed">
              Total populasi siswa SMKN 1 Koba adalah <strong>479 siswa</strong> (Kelas X: 201, Kelas XI: 135, Kelas XII: 143). Berdasarkan Permendikbudrasio 1:150, keberadaan 3 guru BK saat ini (Ernawati 152 siswa, Ifhan Fuadi 167 siswa, Sutina 160 siswa) adalah <strong>sangat ideal dan seimbang</strong> dengan rata-rata beban 160 siswa per guru dan memenuhi beban kerja ekuivalen 24–27 JP per minggu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
