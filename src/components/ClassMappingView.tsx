import React, { useState, useMemo, useEffect } from 'react';
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
  Building2,
  CheckCircle2,
  Edit2,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Briefcase
} from 'lucide-react';

const STORAGE_KEY_ROMBELS = 'peta_jabatan_rombels_v2';
const STORAGE_KEY_CLASS_MAPPINGS = 'peta_jabatan_class_mappings_v2';

export const ClassMappingView: React.FC = () => {
  // Load state from localStorage or fallback to defaults
  const [rombels, setRombels] = useState<ClassRombel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROMBELS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load rombels from localStorage', e);
    }
    return CLASS_ROMBELS;
  });

  const [teacherMappings, setTeacherMappings] = useState<TeacherClassMapping[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASS_MAPPINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load class mappings from localStorage', e);
    }
    return TEACHER_CLASS_MAPPINGS;
  });

  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'cards' | 'bk'>('matrix');
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 'X' | 'XI' | 'XII'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | 'KEJURUAN' | 'NORMATIF_ADAPTIF' | 'BK'
  >('ALL');
  const [activeClassDetailId, setActiveClassDetailId] = useState<string>('x-tsm');

  // Modals state
  const [editingCell, setEditingCell] = useState<{
    teacher: TeacherClassMapping;
    rombel: ClassRombel;
    hours: number;
    detail: string;
  } | null>(null);

  const [editingRombel, setEditingRombel] = useState<{
    isNew: boolean;
    rombel: Partial<ClassRombel>;
  } | null>(null);

  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [selectedTeacherIdToAssign, setSelectedTeacherIdToAssign] = useState('');
  const [assignedHoursInput, setAssignedHoursInput] = useState(4);
  const [assignedDetailInput, setAssignedDetailInput] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROMBELS, JSON.stringify(rombels));
    } catch (e) {
      console.warn('Failed to save rombels', e);
    }
  }, [rombels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASS_MAPPINGS, JSON.stringify(teacherMappings));
    } catch (e) {
      console.warn('Failed to save teacher mappings', e);
    }
  }, [teacherMappings]);

  // Ensure active class exists
  useEffect(() => {
    if (!rombels.some((r) => r.id === activeClassDetailId) && rombels.length > 0) {
      setActiveClassDetailId(rombels[0].id);
    }
  }, [rombels, activeClassDetailId]);

  // Filter columns based on selectedGrade
  const filteredRombels = useMemo(() => {
    if (selectedGrade === 'ALL') return rombels;
    return rombels.filter((r) => r.grade === selectedGrade);
  }, [rombels, selectedGrade]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teacherMappings.filter((t) => {
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
  }, [teacherMappings, search, selectedCategory]);

  // Active class detail for Mode B
  const selectedClass = useMemo(() => {
    return rombels.find((r) => r.id === activeClassDetailId) || rombels[0] || CLASS_ROMBELS[0];
  }, [rombels, activeClassDetailId]);

  // Teachers teaching in selectedClass
  const teachersInSelectedClass = useMemo(() => {
    if (!selectedClass) return [];
    return teacherMappings
      .filter((t) => (t.hoursByClass[selectedClass.id] || 0) > 0)
      .map((t) => ({
        teacher: t,
        hours: t.hoursByClass[selectedClass.id] || 0,
        mapelText: t.mapelDetailsByClass[selectedClass.id] || t.subject,
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [teacherMappings, selectedClass]);

  // Total class hours calculated from matrix
  const currentTotalClassHours = useMemo(() => {
    return teachersInSelectedClass.reduce((sum, item) => sum + item.hours, 0);
  }, [teachersInSelectedClass]);

  // Grand total hours per rombel in footer
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    rombels.forEach((r) => {
      totals[r.id] = teacherMappings.reduce(
        (sum, t) => sum + (t.hoursByClass[r.id] || 0),
        0
      );
    });
    return totals;
  }, [rombels, teacherMappings]);

  // Overall metrics
  const overallMetrics = useMemo(() => {
    let totalJtm = 0;
    teacherMappings.forEach((t) => {
      totalJtm += t.totalJtm;
    });
    return {
      totalRombels: rombels.length,
      totalJtm,
      activeTeachersCount: teacherMappings.filter((t) => t.totalJtm > 0).length,
    };
  }, [rombels, teacherMappings]);

  // Save Hours in Cell
  const handleSaveCellHours = (
    teacherId: string,
    rombelId: string,
    newHours: number,
    detail: string
  ) => {
    setTeacherMappings((prev) => {
      return prev.map((t) => {
        if (t.teacherId !== teacherId) return t;

        const updatedHours = { ...t.hoursByClass };
        const updatedDetails = { ...t.mapelDetailsByClass };

        if (newHours <= 0) {
          delete updatedHours[rombelId];
          delete updatedDetails[rombelId];
        } else {
          updatedHours[rombelId] = newHours;
          updatedDetails[rombelId] = detail.trim() || `${t.subject} (${newHours})`;
        }

        const totalJtm = Object.values(updatedHours).reduce((sum, h) => sum + h, 0);
        const totalBeban = totalJtm + (t.totalJjt || 0);

        return {
          ...t,
          hoursByClass: updatedHours,
          mapelDetailsByClass: updatedDetails,
          totalJtm,
          totalBeban,
        };
      });
    });

    const teacher = teacherMappings.find((t) => t.teacherId === teacherId);
    const rombel = rombels.find((r) => r.id === rombelId);
    showToast(
      `Alokasi ${teacher?.teacherName || 'Guru'} di ${rombel?.name || 'Kelas'} diset ke ${newHours} JP.`
    );
    setEditingCell(null);
  };

  // Save Rombel Metadata
  const handleSaveRombel = (rombelData: Partial<ClassRombel>) => {
    if (!rombelData.name?.trim()) return;

    if (editingRombel?.isNew) {
      const newId = `rombel-${Date.now()}`;
      const newRombel: ClassRombel = {
        id: newId,
        name: rombelData.name.trim(),
        grade: rombelData.grade || 'X',
        major: rombelData.major?.trim() || 'Umum',
        majorCode: (rombelData.majorCode?.trim() || 'UMUM') as any,
        homeroomTeacher: rombelData.homeroomTeacher?.trim() || '-',
        totalWeeklyHours: rombelData.totalWeeklyHours || 36,
      };

      setRombels((prev) => [...prev, newRombel]);
      setActiveClassDetailId(newId);
      showToast(`Rombel baru "${newRombel.name}" berhasil ditambahkan.`);
    } else {
      setRombels((prev) =>
        prev.map((r) => (r.id === rombelData.id ? ({ ...r, ...rombelData } as ClassRombel) : r))
      );
      showToast(`Data kelas "${rombelData.name}" berhasil diperbarui.`);
    }

    setEditingRombel(null);
  };

  // Delete Rombel
  const handleDeleteRombel = (rombelId: string) => {
    const target = rombels.find((r) => r.id === rombelId);
    if (!target) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus rombel "${target.name}"? Seluruh alokasi jam di kelas ini akan dihapus.`
      )
    ) {
      setRombels((prev) => prev.filter((r) => r.id !== rombelId));

      // Clean up hours from teachers
      setTeacherMappings((prev) =>
        prev.map((t) => {
          if (!t.hoursByClass[rombelId]) return t;
          const updatedHours = { ...t.hoursByClass };
          const updatedDetails = { ...t.mapelDetailsByClass };
          delete updatedHours[rombelId];
          delete updatedDetails[rombelId];

          const totalJtm = Object.values(updatedHours).reduce((sum, h) => sum + h, 0);
          const totalBeban = totalJtm + (t.totalJjt || 0);

          return {
            ...t,
            hoursByClass: updatedHours,
            mapelDetailsByClass: updatedDetails,
            totalJtm,
            totalBeban,
          };
        })
      );

      showToast(`Rombel "${target.name}" telah dihapus.`);
    }
  };

  // Reset to Default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengembalikan seluruh data peta kelas dan jam mengajar ke standar awal SK PJM Dapodik?'
      )
    ) {
      setRombels(CLASS_ROMBELS);
      setTeacherMappings(TEACHER_CLASS_MAPPINGS);
      localStorage.removeItem(STORAGE_KEY_ROMBELS);
      localStorage.removeItem(STORAGE_KEY_CLASS_MAPPINGS);
      showToast('Data Peta Kelas berhasil di-reset ke dokumen resmi SK PJM.');
    }
  };

  // Assign New Teacher to Class
  const handleAssignTeacherToClass = () => {
    if (!selectedTeacherIdToAssign || !selectedClass) return;

    handleSaveCellHours(
      selectedTeacherIdToAssign,
      selectedClass.id,
      assignedHoursInput,
      assignedDetailInput
    );

    setIsAssignTeacherOpen(false);
    setSelectedTeacherIdToAssign('');
    setAssignedHoursInput(4);
    setAssignedDetailInput('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-sm">
                PETA DISTRIBUSI ROMBEL & JAM MENGAJAR
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Dapat Diedit & Disesuaikan Real-time
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Peta Kelas & Jam Mengajar Tenaga Pendidik
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Klik pada sel matriks atau kartu kelas untuk mengedit jumlah jam (JP), menambah rombel, dan menugaskan guru.
            </p>
          </div>

          {/* Action buttons & View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
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
                <span>Eksplorasi per Rombel ({rombels.length})</span>
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

            <button
              onClick={() =>
                setEditingRombel({
                  isNew: true,
                  rombel: {
                    name: 'X BARU',
                    grade: 'X',
                    major: 'Program Keahlian Baru',
                    majorCode: 'TSM' as any,
                    homeroomTeacher: '-',
                    totalWeeklyHours: 36,
                  },
                })
              }
              className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rombel</span>
            </button>

            <button
              onClick={handleResetToDefault}
              title="Reset seluruh perubahan ke data resmi SK PJM"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
              <span className="text-xl font-bold font-mono text-slate-900">{rombels.length}</span>
              <span className="text-xs text-slate-500 font-medium">Kelas Aktif</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {rombels.filter((r) => r.grade === 'X').length} Kls X ·{' '}
              {rombels.filter((r) => r.grade === 'XI').length} Kls XI ·{' '}
              {rombels.filter((r) => r.grade === 'XII').length} Kls XII
            </span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Total Jam Tatap Muka (JTM)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-emerald-700">
                {overallMetrics.totalJtm}
              </span>
              <span className="text-xs text-slate-500 font-medium">JP / Minggu</span>
            </div>
            <span className="text-[10px] text-slate-500">Total terhitung otomatis</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Guru Aktif Mengajar di Kelas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-indigo-700">
                {overallMetrics.activeTeachersCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 41 Pendidik</span>
            </div>
            <span className="text-[10px] text-slate-500">Memiliki alokasi jam tatap muka</span>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Status Edit Peta Kelas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-emerald-600">Aktif</span>
              <span className="text-xs text-slate-500 font-medium">· Real-time</span>
            </div>
            <span className="text-[10px] text-slate-500">Klik sel mana saja untuk ubah JP</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: FULL MATRIX GRID WITH CLICK-TO-EDIT */}
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
                  Semua Kelas ({rombels.length})
                </button>
                <button
                  onClick={() => setSelectedGrade('X')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'X'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas X ({rombels.filter((r) => r.grade === 'X').length})
                </button>
                <button
                  onClick={() => setSelectedGrade('XI')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'XI'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas XI ({rombels.filter((r) => r.grade === 'XI').length})
                </button>
                <button
                  onClick={() => setSelectedGrade('XII')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedGrade === 'XII'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas XII ({rombels.filter((r) => r.grade === 'XII').length})
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
                  Kejuruan
                </button>
                <button
                  onClick={() => setSelectedCategory('NORMATIF_ADAPTIF')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedCategory === 'NORMATIF_ADAPTIF'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Umum
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Edit2 className="w-3 h-3 text-indigo-600" />
                <span>Klik sel mana saja untuk ubah/tambah jam</span>
              </span>
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
                      colSpan={rombels.filter((r) => r.grade === 'X').length}
                      className="py-1 px-2 text-center bg-sky-100 text-sky-900 border-r border-sky-300"
                    >
                      KELAS X ({rombels.filter((r) => r.grade === 'X').length} ROMBEL)
                    </th>
                  ) : null}
                  {selectedGrade === 'ALL' || selectedGrade === 'XI' ? (
                    <th
                      colSpan={rombels.filter((r) => r.grade === 'XI').length}
                      className="py-1 px-2 text-center bg-indigo-100 text-indigo-900 border-r border-indigo-300"
                    >
                      KELAS XI ({rombels.filter((r) => r.grade === 'XI').length} ROMBEL)
                    </th>
                  ) : null}
                  {selectedGrade === 'ALL' || selectedGrade === 'XII' ? (
                    <th
                      colSpan={rombels.filter((r) => r.grade === 'XII').length}
                      className="py-1 px-2 text-center bg-violet-100 text-violet-900 border-r border-violet-300"
                    >
                      KELAS XII ({rombels.filter((r) => r.grade === 'XII').length} ROMBEL)
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
                      className="py-2 px-1 text-center min-w-[62px] border-r border-slate-200 bg-slate-50 hover:bg-slate-200/70 transition-colors group relative cursor-pointer"
                      onClick={() => {
                        setActiveClassDetailId(rombel.id);
                        setActiveViewMode('cards');
                      }}
                      title={`Klik untuk lihat & edit rombel ${rombel.name} (Wali: ${rombel.homeroomTeacher})`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-700">
                          {rombel.name}
                        </span>
                        <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[9px] text-slate-500 font-normal truncate max-w-[58px] mx-auto">
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

                      {/* Class columns (Interactive cells) */}
                      {filteredRombels.map((rombel) => {
                        const hours = t.hoursByClass[rombel.id] || 0;
                        const detail = t.mapelDetailsByClass[rombel.id] || '';

                        if (isBk || isManajerial) {
                          return (
                            <td
                              key={rombel.id}
                              className="py-2 px-1 text-center border-r border-slate-100 bg-slate-50/20 text-slate-300 text-[10px]"
                            >
                              -
                            </td>
                          );
                        }

                        return (
                          <td
                            key={rombel.id}
                            onClick={() =>
                              setEditingCell({
                                teacher: t,
                                rombel,
                                hours,
                                detail: detail || `${t.subject} (${hours || 4})`,
                              })
                            }
                            className={`py-2 px-1 text-center border-r border-slate-100 cursor-pointer transition-colors group relative ${
                              hours > 0
                                ? hours >= 12
                                  ? 'bg-indigo-100 text-indigo-900 font-bold hover:bg-indigo-200'
                                  : hours >= 6
                                  ? 'bg-indigo-50 text-indigo-800 font-semibold hover:bg-indigo-100'
                                  : 'bg-indigo-50/50 text-indigo-700 font-medium hover:bg-indigo-100/70'
                                : 'hover:bg-slate-100/80 text-slate-200'
                            }`}
                            title={`Klik untuk ubah alokasi jam ${t.teacherName} di ${rombel.name}`}
                          >
                            {hours > 0 ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-mono text-xs">{hours}</span>
                                <span className="text-[8px] opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity">
                                  edit
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <span className="text-slate-200 group-hover:hidden">·</span>
                                <Plus className="w-3 h-3 text-slate-400 hidden group-hover:inline opacity-70" />
                              </div>
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
                      {columnTotals[rombel.id] || 0}
                    </td>
                  ))}

                  <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-900 border-r border-slate-200">
                    {overallMetrics.totalJtm}
                  </td>
                  <td className="py-2 px-1 text-center font-mono tabular-nums text-indigo-700 border-r border-slate-200">
                    220
                  </td>
                  <td className="py-2 px-1 text-center font-mono tabular-nums text-emerald-800 font-bold">
                    {overallMetrics.totalJtm + 220}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASS CARDS EXPLORER WITH EDITING & TEACHER ASSIGNMENT */}
      {activeViewMode === 'cards' && selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 18 Class Selector Grid */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Rombel ({rombels.length} Kelas)
                </h3>
                <button
                  onClick={() =>
                    setEditingRombel({
                      isNew: true,
                      rombel: {
                        name: 'X BARU',
                        grade: 'X',
                        major: 'Program Keahlian Baru',
                        majorCode: 'TSM' as any,
                        homeroomTeacher: '-',
                        totalWeeklyHours: 36,
                      },
                    })
                  }
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1 border border-indigo-200"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Rombel</span>
                </button>
              </div>

              {/* Grouped by Grade */}
              <div className="space-y-4 text-xs">
                {/* Kelas X */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas X ({rombels.filter((r) => r.grade === 'X').length} Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rombels
                      .filter((r) => r.grade === 'X')
                      .map((r) => (
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
                            {r.homeroomTeacher?.split(',')[0] || '-'}
                          </div>
                          <div
                            className={`mt-1 font-mono text-[10px] ${
                              activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                            }`}
                          >
                            {columnTotals[r.id] || 0} JP / Mgg
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Kelas XI */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas XI ({rombels.filter((r) => r.grade === 'XI').length} Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rombels
                      .filter((r) => r.grade === 'XI')
                      .map((r) => (
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
                            {r.homeroomTeacher?.split(',')[0] || '-'}
                          </div>
                          <div
                            className={`mt-1 font-mono text-[10px] ${
                              activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                            }`}
                          >
                            {columnTotals[r.id] || 0} JP / Mgg
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Kelas XII */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kelas XII ({rombels.filter((r) => r.grade === 'XII').length} Rombel)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rombels
                      .filter((r) => r.grade === 'XII')
                      .map((r) => (
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
                            {r.homeroomTeacher?.split(',')[0] || '-'}
                          </div>
                          <div
                            className={`mt-1 font-mono text-[10px] ${
                              activeClassDetailId === r.id ? 'text-emerald-400' : 'text-emerald-700'
                            }`}
                          >
                            {columnTotals[r.id] || 0} JP / Mgg
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Breakdown & Editing of Selected Class */}
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
                    <button
                      onClick={() =>
                        setEditingRombel({
                          isNew: false,
                          rombel: selectedClass,
                        })
                      }
                      title="Edit Nama Kelas, Jurusan, atau Wali Kelas"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
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
                      {currentTotalClassHours} JP
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

              {/* Action Toolbar for Class Details */}
              <div className="flex items-center justify-between pt-1">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Daftar Guru Pengampu di {selectedClass.name}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({teachersInSelectedClass.length} Guru)
                  </span>
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAssignTeacherOpen(true);
                      setSelectedTeacherIdToAssign('');
                      setAssignedHoursInput(4);
                      setAssignedDetailInput('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tugaskan Guru ke Kelas Ini</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRombel(selectedClass.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors"
                    title="Hapus Rombel Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Teachers List in this Class */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {teachersInSelectedClass.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Belum ada guru yang ditugaskan mengajar di kelas ini.
                    <br />
                    <button
                      onClick={() => setIsAssignTeacherOpen(true)}
                      className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      + Tugaskan guru sekarang
                    </button>
                  </div>
                ) : (
                  teachersInSelectedClass.map((item, idx) => (
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
                          <div className="text-[10px] text-slate-500">
                            NIP: {item.teacher.nip} · Total Beban Guru: {item.teacher.totalBeban} JP
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                            {item.hours} JP
                          </span>
                          <span className="text-[10px] text-slate-500 block">/ Minggu</span>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setEditingCell({
                                teacher: item.teacher,
                                rombel: selectedClass,
                                hours: item.hours,
                                detail: item.mapelText,
                              })
                            }
                            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded transition-colors"
                            title="Edit Jumlah Jam & Rincian Mapel"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus penugasan ${item.teacher.teacherName} dari ${selectedClass.name}?`
                                )
                              ) {
                                handleSaveCellHours(
                                  item.teacher.teacherId,
                                  selectedClass.id,
                                  0,
                                  ''
                                );
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus dari Kelas Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
            {teacherMappings
              .filter((t) => t.category === 'BK')
              .map((bk) => (
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

                  {bk.counselingDetails && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Siswa Asuh Kelas X:</span>
                        <span className="font-mono font-bold">
                          {bk.counselingDetails.classX} Siswa
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Siswa Asuh Kelas XI:</span>
                        <span className="font-mono font-bold">
                          {bk.counselingDetails.classXI} Siswa
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Siswa Asuh Kelas XII:</span>
                        <span className="font-mono font-bold">
                          {bk.counselingDetails.classXII} Siswa
                        </span>
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
              Total populasi siswa SMKN 1 Koba adalah <strong>479 siswa</strong> (Kelas X: 201, Kelas XI: 135, Kelas XII: 143). Berdasarkan Permendikbud rasio 1:150, keberadaan 3 guru BK saat ini sudah <strong>sangat ideal dan seimbang</strong> dengan rata-rata beban 160 siswa per guru dan memenuhi beban kerja ekuivalen 24–27 JP per minggu.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: EDIT JAM MENGAJAR DI KELAS (CELL) ================= */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ubah Jam Mengajar di Kelas
                </h3>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCellHours(
                  editingCell.teacher.teacherId,
                  editingCell.rombel.id,
                  editingCell.hours,
                  editingCell.detail
                );
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {editingCell.teacher.teacherName}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                    {editingCell.teacher.status}
                  </span>
                </div>
                <div className="text-slate-600">
                  Rombel Target: <strong>{editingCell.rombel.name}</strong> ({editingCell.rombel.major})
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Beban Guru Saat Ini: {editingCell.teacher.totalBeban} JP
                </div>
              </div>

              {/* Input Jam */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Jam Tatap Muka (JP / Minggu)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="48"
                    required
                    value={editingCell.hours}
                    onChange={(e) =>
                      setEditingCell({
                        ...editingCell,
                        hours: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-24 px-3 py-2 font-mono text-center font-bold text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                  <span className="text-slate-500">Jam Pelajaran (JP)</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 mr-1">Pilihan Cepat:</span>
                  {[0, 2, 3, 4, 5, 6, 8, 12, 14, 18].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setEditingCell({ ...editingCell, hours: h })}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        editingCell.hours === h
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : h === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {h === 0 ? '0 (Kosongkan)' : `${h} JP`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rincian Mapel */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={editingCell.detail}
                  onChange={(e) =>
                    setEditingCell({
                      ...editingCell,
                      detail: e.target.value,
                    })
                  }
                  placeholder={`Contoh: ${editingCell.teacher.subject} (${editingCell.hours})`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                {editingCell.hours > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCellHours(
                        editingCell.teacher.teacherId,
                        editingCell.rombel.id,
                        0,
                        ''
                      );
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Hapus Penugasan (0 JP)
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT / TAMBAH ROMBEL ================= */}
      {editingRombel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingRombel.isNew ? 'Tambah Rombongan Belajar Baru' : 'Edit Data Rombel'}
                </h3>
              </div>
              <button
                onClick={() => setEditingRombel(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRombel(editingRombel.rombel);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Rombel / Kelas
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRombel.rombel.name || ''}
                    onChange={(e) =>
                      setEditingRombel({
                        ...editingRombel,
                        rombel: { ...editingRombel.rombel, name: e.target.value },
                      })
                    }
                    placeholder="Contoh: X TSM, XI TKJ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={editingRombel.rombel.grade || 'X'}
                    onChange={(e) =>
                      setEditingRombel({
                        ...editingRombel,
                        rombel: {
                          ...editingRombel.rombel,
                          grade: e.target.value as 'X' | 'XI' | 'XII',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Program Keahlian / Jurusan
                </label>
                <input
                  type="text"
                  required
                  value={editingRombel.rombel.major || ''}
                  onChange={(e) =>
                    setEditingRombel({
                      ...editingRombel,
                      rombel: { ...editingRombel.rombel, major: e.target.value },
                    })
                  }
                  placeholder="Contoh: Teknik Kendaraan Ringan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Singkatan Jurusan
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRombel.rombel.majorCode || ''}
                    onChange={(e) =>
                      setEditingRombel({
                        ...editingRombel,
                        rombel: {
                          ...editingRombel.rombel,
                          majorCode: e.target.value.toUpperCase() as any,
                        },
                      })
                    }
                    placeholder="Contoh: TKR, TITL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Jam Mingguan (JP)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={editingRombel.rombel.totalWeeklyHours || 36}
                    onChange={(e) =>
                      setEditingRombel({
                        ...editingRombel,
                        rombel: {
                          ...editingRombel.rombel,
                          totalWeeklyHours: parseInt(e.target.value, 10) || 36,
                        },
                      })
                    }
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Wali Kelas
                </label>
                <input
                  type="text"
                  value={editingRombel.rombel.homeroomTeacher || ''}
                  onChange={(e) =>
                    setEditingRombel({
                      ...editingRombel,
                      rombel: {
                        ...editingRombel.rombel,
                        homeroomTeacher: e.target.value,
                      },
                    })
                  }
                  placeholder="Nama Lengkap & Gelar Wali Kelas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRombel(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Rombel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ASSIGN NEW TEACHER TO CLASS ================= */}
      {isAssignTeacherOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tugaskan Guru ke {selectedClass.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignTeacherOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAssignTeacherToClass();
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Select Teacher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Tenaga Pendidik
                </label>
                <select
                  required
                  value={selectedTeacherIdToAssign}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTeacherIdToAssign(tId);
                    const t = teacherMappings.find((item) => item.teacherId === tId);
                    if (t) {
                      setAssignedDetailInput(`${t.subject} (${assignedHoursInput})`);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
                >
                  <option value="">-- Pilih Guru Sekolah --</option>
                  {teacherMappings
                    .filter((t) => t.category !== 'BK' && t.category !== 'MANAJERIAL')
                    .map((t) => (
                      <option key={t.teacherId} value={t.teacherId}>
                        {t.teacherName} ({t.status}) · {t.subject} (Total: {t.totalBeban} JP)
                      </option>
                    ))}
                </select>
              </div>

              {/* Hours input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alokasi Jam Tatap Muka di {selectedClass.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="36"
                    required
                    value={assignedHoursInput}
                    onChange={(e) => {
                      const h = parseInt(e.target.value, 10) || 1;
                      setAssignedHoursInput(h);
                      const t = teacherMappings.find(
                        (item) => item.teacherId === selectedTeacherIdToAssign
                      );
                      if (t) {
                        setAssignedDetailInput(`${t.subject} (${h})`);
                      }
                    }}
                    className="w-24 px-3 py-2 font-mono text-center font-bold border border-slate-300 rounded-md text-slate-900"
                  />
                  <span className="text-slate-500">JP / Minggu</span>
                </div>
              </div>

              {/* Subject Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran yang Diajarkan
                </label>
                <input
                  type="text"
                  required
                  value={assignedDetailInput}
                  onChange={(e) => setAssignedDetailInput(e.target.value)}
                  placeholder="Contoh: Matematika (4), Bahasa Inggris (4)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignTeacherOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedTeacherIdToAssign}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tugaskan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
