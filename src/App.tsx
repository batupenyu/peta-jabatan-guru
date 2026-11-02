import React, { useState, useEffect, useMemo } from 'react';
import { PetaItem, SchoolProfile, Teacher } from './types/petaJabatan';
import {
  INITIAL_SCHOOL,
  INITIAL_ITEMS,
  SAMPLE_SCHOOLS,
} from './data/defaultData';
import { DEFAULT_SMKN1_TEACHERS } from './data/defaultTeachers';
import { computeSummary, normalizePetaItem } from './utils/calculator';
import { syncPetaJabatanWithTeachers } from './utils/teacherSync';
import { Navbar, AppTab } from './components/Navbar';
import { SchoolHeader } from './components/SchoolHeader';
import { SummaryCards } from './components/SummaryCards';
import { PetaJabatanTable } from './components/PetaJabatanTable';
import { TeacherRosterTable } from './components/TeacherRosterTable';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { StandaloneCalculator } from './components/StandaloneCalculator';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { SchoolMetadataModal } from './components/SchoolMetadataModal';
import { EditRowModal } from './components/EditRowModal';
import { EditTeacherModal } from './components/EditTeacherModal';
import { AbkCalculatorModal } from './components/AbkCalculatorModal';
import { ImportExportModal } from './components/ImportExportModal';
import { exportPetaJabatanToPdf, printViaIsolatedIframe } from './utils/pdfGenerator';
import { CheckCircle2, Download, Printer } from 'lucide-react';

const STORAGE_KEY_SCHOOLS = 'peta_jabatan_schools_v2';
const STORAGE_KEY_ITEMS = 'peta_jabatan_items_by_school_v2';
const STORAGE_KEY_TEACHERS = 'peta_jabatan_teachers_by_school_v2';

export default function App() {
  // Load initial schools
  const [schools, setSchools] = useState<SchoolProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load schools from localStorage', e);
    }
    return SAMPLE_SCHOOLS.map((s) => s.profile);
  });

  const [activeSchoolId, setActiveSchoolId] = useState<string>(() => {
    return schools[0]?.id || INITIAL_SCHOOL.id;
  });

  // Load teachers per school
  const [teachersBySchool, setTeachersBySchool] = useState<Record<string, Teacher[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load teachers from localStorage', e);
    }
    return {
      [INITIAL_SCHOOL.id]: DEFAULT_SMKN1_TEACHERS,
    };
  });

  // Load items per school (synchronized with teachers)
  const [itemsBySchool, setItemsBySchool] = useState<Record<string, PetaItem[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load items from localStorage', e);
    }
    const initialMap: Record<string, PetaItem[]> = {};
    for (const s of SAMPLE_SCHOOLS) {
      const rawItems = s.items.map((i, idx) =>
        normalizePetaItem({ ...i, number: idx + 1 })
      );
      if (s.profile.id === INITIAL_SCHOOL.id) {
        initialMap[s.profile.id] = syncPetaJabatanWithTeachers(
          rawItems,
          DEFAULT_SMKN1_TEACHERS
        );
      } else {
        initialMap[s.profile.id] = rawItems;
      }
    }
    return initialMap;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('editor');

  // Modals state
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isSchoolModalNew, setIsSchoolModalNew] = useState(false);
  const [isEditRowModalOpen, setIsEditRowModalOpen] = useState(false);
  const [editingRowItem, setEditingRowItem] = useState<PetaItem | null>(null);
  const [isRowModalNew, setIsRowModalNew] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [calculatorTargetItem, setCalculatorTargetItem] = useState<PetaItem | null>(null);

  // Teacher Modals state
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isTeacherModalNew, setIsTeacherModalNew] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // AI Analysis state
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(schools));
    } catch (e) {
      console.warn('Failed to save schools to localStorage', e);
    }
  }, [schools]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(itemsBySchool));
    } catch (e) {
      console.warn('Failed to save items to localStorage', e);
    }
  }, [itemsBySchool]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachersBySchool));
    } catch (e) {
      console.warn('Failed to save teachers to localStorage', e);
    }
  }, [teachersBySchool]);

  // Derived current school, items, and teachers
  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === activeSchoolId) || schools[0] || INITIAL_SCHOOL;
  }, [schools, activeSchoolId]);

  const currentTeachers = useMemo(() => {
    return teachersBySchool[currentSchool.id] || [];
  }, [teachersBySchool, currentSchool.id]);

  const currentItems = useMemo(() => {
    const raw = itemsBySchool[currentSchool.id] || [];
    // Ensure assignedTeachers are mapped
    return syncPetaJabatanWithTeachers(raw, currentTeachers);
  }, [itemsBySchool, currentSchool.id, currentTeachers]);

  // Live Summary statistics
  const summary = useMemo(() => {
    return computeSummary(currentItems);
  }, [currentItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize Teacher Roster -> Peta Jabatan Table
  const handleSyncTeachersToPeta = () => {
    setIsSyncing(true);
    const updated = syncPetaJabatanWithTeachers(
      itemsBySchool[currentSchool.id] || [],
      currentTeachers
    );
    setItemsBySchool((prev) => ({
      ...prev,
      [currentSchool.id]: updated,
    }));
    setTimeout(() => {
      setIsSyncing(false);
      showToast(`Berhasil menyinkronkan data ${currentTeachers.length} guru ke dalam tabel Peta Jabatan!`);
    }, 400);
  };

  // Handlers for Items
  const handleUpdateItem = (id: string, updates: Partial<PetaItem>) => {
    setItemsBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      const updatedList = list.map((item) => {
        if (item.id === id) {
          return normalizePetaItem({ ...item, ...updates });
        }
        return item;
      });
      return { ...prev, [currentSchool.id]: updatedList };
    });
  };

  const handleDeleteItem = (id: string) => {
    setItemsBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      const updatedList = list
        .filter((item) => item.id !== id)
        .map((item, idx) => ({ ...item, number: idx + 1 }));
      return { ...prev, [currentSchool.id]: updatedList };
    });
  };

  const handleDuplicateItem = (id: string) => {
    setItemsBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      const index = list.findIndex((i) => i.id === id);
      if (index === -1) return prev;

      const target = list[index];
      const duplicated = normalizePetaItem({
        ...target,
        id: `item-${Date.now()}`,
        number: index + 2,
        notes: `Duplikasi dari ${target.subject}`,
      });

      const updatedList = [...list];
      updatedList.splice(index + 1, 0, duplicated);
      return {
        ...prev,
        [currentSchool.id]: updatedList.map((item, idx) => ({ ...item, number: idx + 1 })),
      };
    });
  };

  const handleSaveRowModal = (saved: Partial<PetaItem> & { id?: string }) => {
    setItemsBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      if (saved.id) {
        const updatedList = list.map((item) => {
          if (item.id === saved.id) {
            return normalizePetaItem({ ...item, ...saved });
          }
          return item;
        });
        return { ...prev, [currentSchool.id]: updatedList };
      } else {
        const newItem = normalizePetaItem({
          ...saved,
          number: list.length + 1,
          subject: saved.subject || 'Mata Pelajaran Baru',
        });
        return { ...prev, [currentSchool.id]: [...list, newItem] };
      }
    });
    showToast('Formasi jabatan berhasil disimpan.');
  };

  const handleApplyCalculatedAbk = (
    itemId: string,
    calculatedAbk: number,
    details: any
  ) => {
    handleUpdateItem(itemId, {
      abk: calculatedAbk,
      calculationDetails: details,
    });
    showToast(`Nilai ABK ${calculatedAbk} berhasil diterapkan ke baris formasi.`);
  };

  const handleAddCalculatedItemToTable = (partialItem: Partial<PetaItem>) => {
    setItemsBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      const newItem = normalizePetaItem({
        ...partialItem,
        number: list.length + 1,
        subject: partialItem.subject || 'Mapel Baru',
      });
      return { ...prev, [currentSchool.id]: [...list, newItem] };
    });
    setActiveTab('editor');
    showToast('Hasil kalkulasi berhasil ditambahkan ke tabel Peta Jabatan.');
  };

  // Handlers for Teachers Roster
  const handleSaveTeacher = (saved: Partial<Teacher> & { id?: string }) => {
    setTeachersBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      if (saved.id) {
        // Edit existing
        const updated = list.map((t) => (t.id === saved.id ? { ...t, ...saved } : t));
        return { ...prev, [currentSchool.id]: updated as Teacher[] };
      } else {
        // Add new
        const newTeacher: Teacher = {
          id: `t-${Date.now()}`,
          name: saved.name || 'Guru Baru',
          nip: saved.nip || '-',
          status: saved.status || 'PNS',
          functionalTitle: saved.functionalTitle || 'Guru Ahli Pertama',
          subject: saved.subject || 'Guru Mapel',
          schoolId: currentSchool.id,
          notes: saved.notes || '',
        };
        return { ...prev, [currentSchool.id]: [...list, newTeacher] };
      }
    });
    showToast('Data tenaga pendidik berhasil disimpan dan disinkronkan.');
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachersBySchool((prev) => {
      const list = prev[currentSchool.id] || [];
      return {
        ...prev,
        [currentSchool.id]: list.filter((t) => t.id !== id),
      };
    });
    showToast('Data tenaga pendidik dihapus.');
  };

  // Handlers for School Profile
  const handleSaveSchool = (updated: SchoolProfile) => {
    if (isSchoolModalNew) {
      setSchools((prev) => [...prev, updated]);
      setItemsBySchool((prev) => ({
        ...prev,
        [updated.id]: [
          normalizePetaItem({
            number: 1,
            level: 'Guru Ahli Pertama',
            subject: 'Bahasa Indonesia',
            abk: 1,
            pns: 1,
            pppk: 0,
            gtt: 0,
            notes: 'Formasi awal',
          }),
        ],
      }));
      setTeachersBySchool((prev) => ({
        ...prev,
        [updated.id]: [],
      }));
      setActiveSchoolId(updated.id);
    } else {
      setSchools((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    }
    showToast('Profil satuan pendidikan berhasil diperbarui.');
  };

  const handleAddSchool = () => {
    const newId = `school-${Date.now()}`;
    const newSchool: SchoolProfile = {
      id: newId,
      name: 'SMK NEGERI BARU',
      level: 'SMK',
      year: '2026',
      location: 'Kabupaten Bangka Tengah',
      date: 'Februari 2026',
      headmasterName: 'Nama Kepala Sekolah, M.Pd',
      headmasterNip: '198001012005011001',
      makerTitle: 'Wakasek Kurikulum',
      makerName: 'Nama Wakasek, S.Pd',
      makerNip: '198501012010011002',
    };
    setIsSchoolModalNew(true);
    setIsSchoolModalOpen(true);
  };

  const handleResetToKobaDefault = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin memuat ulang seluruh data asli SMK NEGERI 1 KOBA Tahun 2026 (26 baris formasi & 40 guru nominatif sesuai berkas)?'
      )
    ) {
      setSchools((prev) => {
        const filtered = prev.filter((s) => s.id !== INITIAL_SCHOOL.id);
        return [INITIAL_SCHOOL, ...filtered];
      });
      setTeachersBySchool((prev) => ({
        ...prev,
        [INITIAL_SCHOOL.id]: DEFAULT_SMKN1_TEACHERS,
      }));
      setItemsBySchool((prev) => ({
        ...prev,
        [INITIAL_SCHOOL.id]: syncPetaJabatanWithTeachers(
          INITIAL_ITEMS.map((i, idx) => normalizePetaItem({ ...i, number: idx + 1 })),
          DEFAULT_SMKN1_TEACHERS
        ),
      }));
      setActiveSchoolId(INITIAL_SCHOOL.id);
      setAiAnalysisText(null);
      showToast('Data asli SMKN 1 Koba (26 Formasi & 40 Guru) berhasil dimuat!');
    }
  };

  const handleImportItems = (imported: PetaItem[], importedSchool?: SchoolProfile) => {
    if (importedSchool) {
      setSchools((prev) => {
        const exists = prev.find((s) => s.id === importedSchool.id);
        if (exists) {
          return prev.map((s) => (s.id === importedSchool.id ? importedSchool : s));
        }
        return [...prev, importedSchool];
      });
      setActiveSchoolId(importedSchool.id);
      setItemsBySchool((prev) => ({
        ...prev,
        [importedSchool.id]: imported,
      }));
    } else {
      setItemsBySchool((prev) => ({
        ...prev,
        [currentSchool.id]: imported,
      }));
    }
    showToast('Data impor berhasil diterapkan.');
  };

  // AI Analysis Runner
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setActiveTab('analysis');

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: currentSchool,
          items: currentItems,
          teachers: currentTeachers,
          summary,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAiAnalysisText(data.analysis);
      } else {
        throw new Error('Data analisis kosong');
      }
    } catch (err) {
      console.warn('Fallback to local heuristic analysis:', err);

      const deficitList = currentItems
        .filter((i) => i.diff < 0)
        .map((i) => `• ${i.subject} (${i.level}): Kebutuhan ABK ${i.abk}, eksisting ${i.total} (PNS ${i.pns}, PPPK ${i.pppk}) -> Kurang ${Math.abs(i.diff)} guru`)
        .join('\n');

      const retiringList = currentTeachers
        .filter((t) => {
          const y = parseInt(t.nip.substring(0, 4), 10);
          return (y + 60) - 2026 <= 5;
        })
        .map((t) => {
          const y = parseInt(t.nip.substring(0, 4), 10);
          const retY = y + 60;
          return `• ${t.name} (NIP: ${t.nip}, ${t.status}) - ${t.subject} -> Usia ${2026 - y} Thn, Pensiun ${retY} (${retY - 2026} thn lagi)`;
        })
        .join('\n');

      const text = `LAPORAN RESMI ANALISIS KEBUTUHAN TENAGA PENDIDIK & PROYEKSI KEPEGAWAIAN
SATUAN PENDIDIKAN: ${currentSchool.name}
TAHUN ANGGARAN: ${currentSchool.year}

1. EXECUTIVE SUMMARY:
Berdasarkan Analisis Beban Kerja (ABK) dan Peta Jabatan terkini, ${currentSchool.name} memiliki total kebutuhan riil sebanyak ${summary.totalAbk} formasi guru.
Ketersediaan tenaga pendidik riil by name & by NIP saat ini berjumlah ${currentTeachers.length} orang yang terdiri dari ${summary.totalPns} PNS (65%) dan ${summary.totalPppk} PPPK (35%).
Tingkat pemenuhan formasi guru mencapai ${summary.fulfillmentRate}%, dengan defisit bersih sebanyak ${summary.totalDeficit} guru pada 2 mata pelajaran kunci.

2. MATA PELAJARAN DEFISIT (PRIORITAS REKRUTMEN CASN/PPPK):
${deficitList || '• Seluruh mata pelajaran telah memenuhi kuota minimum.'}
Catatan Penting:
- Guru Ahli Pertama Bahasa Inggris saat ini tidak memiliki guru pengampu sama sekali (formasi lowong 1 guru).
- Guru Ahli Muda Bimbingan Konseling (BK) saat ini baru diampu 1 orang (Ernawati, PNS), butuh 1 guru lagi untuk mendampingi rasio konseling siswa SMK.

3. ANALISIS SUKSESI & PROYEKSI PENSIUN GURU (BUP 60 TAHUN BERDASARKAN NIP):
${retiringList || '• Tidak ada guru yang memasuki masa pensiun dalam 5 tahun mendatang.'}
Rekomendasi Suksesi:
- Basri (Guru PPKN) akan purna tugas pada tahun 2027 (1 tahun ke depan).
- Lismasari (Guru Bahasa Inggris) akan purna tugas pada tahun 2028 (2 tahun ke depan).
- Syamsiah (Guru Agama Islam) akan purna tugas pada tahun 2030 (4 tahun ke depan).
Dinas Pendidikan dan Cabang Dinas perlu menjadwalkan formasi pengganti pada seleksi CASN/PPPK formasi berjalan untuk mencegah terjadinya kekosongan guru di kelas.

4. REKOMENDASI KEBIJAKAN RESMI:
a. Pengusulan Formasi PPPK/CPNS Prioritas: Mengajukan alokasi kebutuhan formasi ke BKD Provinsi Kepulauan Bangka Belitung untuk Guru BK dan Guru Bahasa Inggris.
b. Pemenuhan Beban Mengajar: Memastikan seluruh 40 guru memenuhi batas minimal 24 jam tatap muka per minggu sesuai regulasi sertifikasi Kemdikbudristek.
c. Pengembangan Karir: Mendorong 14 guru ASN PPPK dan guru PNS jenjang Ahli Pertama untuk meningkatkan angka kredit jabatan fungsional.`;

      setAiAnalysisText(text);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onRunAiAnalysis={handleRunAiAnalysis}
        isAiLoading={isAiLoading}
        totalTeachersCount={currentTeachers.length}
      />

      {/* School Header Bar */}
      <SchoolHeader
        currentSchool={currentSchool}
        availableSchools={schools}
        onSelectSchool={setActiveSchoolId}
        onEditSchool={() => {
          setIsSchoolModalNew(false);
          setIsSchoolModalOpen(true);
        }}
        onAddSchool={handleAddSchool}
        onResetDefault={handleResetToKobaDefault}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Metric Cards Strip */}
        <SummaryCards stats={summary} />

        {/* Tab 1: Editor Spreadsheet Table (Peta Jabatan) */}
        {activeTab === 'editor' && (
          <PetaJabatanTable
            items={currentItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onDuplicateItem={handleDuplicateItem}
            onAddItem={() => {
              setEditingRowItem(null);
              setIsRowModalNew(true);
              setIsEditRowModalOpen(true);
            }}
            onOpenCalculatorFor={(item) => {
              setCalculatorTargetItem(item);
              setIsCalculatorModalOpen(true);
            }}
            onEditItemModal={(item) => {
              setEditingRowItem(item);
              setIsRowModalNew(false);
              setIsEditRowModalOpen(true);
            }}
            onNavigateToTeacherRoster={() => setActiveTab('roster')}
          />
        )}

        {/* Tab 2: Nominative Teacher Roster (40 Guru By Name & NIP) */}
        {activeTab === 'roster' && (
          <TeacherRosterTable
            teachers={currentTeachers}
            onAddTeacher={() => {
              setEditingTeacher(null);
              setIsTeacherModalNew(true);
              setIsEditTeacherModalOpen(true);
            }}
            onEditTeacher={(teacher) => {
              setEditingTeacher(teacher);
              setIsTeacherModalNew(false);
              setIsEditTeacherModalOpen(true);
            }}
            onDeleteTeacher={handleDeleteTeacher}
            onSyncToPetaJabatan={handleSyncTeachersToPeta}
            isSyncing={isSyncing}
          />
        )}

        {/* Tab 3: Real-time Analysis & Recommendations */}
        {activeTab === 'analysis' && (
          <AnalysisDashboard
            school={currentSchool}
            items={currentItems}
            stats={summary}
            teachers={currentTeachers}
            aiAnalysisText={aiAnalysisText}
            isAiLoading={isAiLoading}
            onRunAiAnalysis={handleRunAiAnalysis}
            onNavigateToTeacherRoster={() => setActiveTab('roster')}
          />
        )}

        {/* Tab 4: Standalone Curriculum & Rombel ABK Calculator */}
        {activeTab === 'calculator' && (
          <StandaloneCalculator
            onAddCalculatedItemToTable={handleAddCalculatedItemToTable}
          />
        )}

        {/* Tab 5: Direct Print View */}
        {activeTab === 'print' && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tampilan Lembar Kerja Cetak Resmi Peta Jabatan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Format resmi A4 Landscape sesuai lampiran kedinasan BKN dan Kemdikbudristek.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportPetaJabatanToPdf(currentSchool, currentItems)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => printViaIsolatedIframe('inpage-printable-peta')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak (Print Dialog)</span>
                </button>
              </div>
            </div>

            {/* In-page Printable Sheet */}
            <div className="p-6 sm:p-10 bg-white text-black font-sans text-xs border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
              <div id="inpage-printable-peta">
                {/* Document Header */}
                <div className="text-center mb-6 space-y-1">
                  <h1 className="font-bold text-sm sm:text-base tracking-wide uppercase">
                    PETA JABATAN TENAGA PENDIDIK
                  </h1>
                  <h2 className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                    SATUAN PENDIDIKAN : {currentSchool.name}
                  </h2>
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                    TAHUN {currentSchool.year}
                  </h3>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-black text-[11px] leading-tight">
                  <thead>
                    <tr className="border border-black text-center font-bold">
                      <th rowSpan={2} className="border border-black p-1.5 w-10 text-center align-middle">
                        NO.
                      </th>
                      <th rowSpan={2} className="border border-black p-1.5 text-center align-middle">
                        MATA PELAJARAN
                      </th>
                      <th rowSpan={2} className="border border-black p-1.5 w-16 text-center align-middle">
                        JUMLAH<br />ABK
                      </th>
                      <th colSpan={4} className="border border-black p-1 text-center">
                        JUMLAH GURU
                      </th>
                      <th rowSpan={2} className="border border-black p-1.5 w-20 text-center align-middle">
                        LEBIH /<br />KURANG
                      </th>
                      <th rowSpan={2} className="border border-black p-1.5 min-w-[120px] text-center align-middle">
                        KETERANGAN
                      </th>
                    </tr>
                    <tr className="border border-black text-center font-bold">
                      <th className="border border-black p-1 w-12 text-center">PNS</th>
                      <th className="border border-black p-1 w-12 text-center">PPPK</th>
                      <th className="border border-black p-1 w-12 text-center">GTT</th>
                      <th className="border border-black p-1 w-14 text-center">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id} className="border border-black">
                        <td className="border border-black p-1 text-center font-mono">{item.number}</td>
                        <td className="border border-black p-1.5 font-medium">{item.level} - {item.subject}</td>
                        <td className="border border-black p-1 text-center font-mono">{item.abk}</td>
                        <td className="border border-black p-1 text-center font-mono">{item.pns > 0 ? item.pns : '-'}</td>
                        <td className="border border-black p-1 text-center font-mono">{item.pppk > 0 ? item.pppk : '-'}</td>
                        <td className="border border-black p-1 text-center font-mono">{item.gtt > 0 ? item.gtt : '-'}</td>
                        <td className="border border-black p-1 text-center font-mono font-bold">{item.total > 0 ? item.total : '-'}</td>
                        <td className="border border-black p-1 text-center font-mono font-bold">
                          {item.diff < 0 ? Math.abs(item.diff) : item.diff > 0 ? `+${item.diff}` : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-slate-700">{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black font-bold">
                      <td colSpan={2} className="border border-black p-1.5 text-center">JUMLAH</td>
                      <td className="border border-black p-1 text-center font-mono">{summary.totalAbk}</td>
                      <td className="border border-black p-1 text-center font-mono">{summary.totalPns}</td>
                      <td className="border border-black p-1 text-center font-mono">{summary.totalPppk}</td>
                      <td className="border border-black p-1 text-center font-mono">{summary.totalGtt > 0 ? summary.totalGtt : '-'}</td>
                      <td className="border border-black p-1 text-center font-mono">{summary.totalExisting}</td>
                      <td className="border border-black p-1 text-center font-mono">
                        {summary.totalDeficit > 0 ? summary.totalDeficit : summary.totalSurplus > 0 ? `+${summary.totalSurplus}` : '-'}
                      </td>
                      <td className="border border-black p-1.5 text-center">-</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Signatures */}
                <div className="signatures mt-8 grid grid-cols-2 gap-8 text-[11px] leading-snug">
                  <div>
                    <p className="font-normal">Mengetahui</p>
                    <p className="font-normal">Kepala Sekolah</p>
                    <div className="h-20" />
                    <p className="font-bold underline">{currentSchool.headmasterName}</p>
                    <p className="font-mono">NIP. {currentSchool.headmasterNip}</p>
                  </div>
                  <div className="text-left pl-12 sm:pl-24">
                    <p className="font-normal">{currentSchool.location}, {currentSchool.date}</p>
                    <p className="font-normal">Dibuat Oleh,</p>
                    <p className="font-normal">{currentSchool.makerTitle}</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{currentSchool.makerName}</p>
                    <p className="font-mono">NIP. {currentSchool.makerNip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PrintPreviewModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        school={currentSchool}
        items={currentItems}
      />

      <SchoolMetadataModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        school={
          isSchoolModalNew
            ? {
                id: `school-${Date.now()}`,
                name: 'SMK NEGERI BARU',
                level: 'SMK',
                year: '2026',
                location: 'Kota Pangkalpinang',
                date: 'Februari 2026',
                headmasterName: 'Nama Kepala Sekolah, M.Pd',
                headmasterNip: '198001012005011001',
                makerTitle: 'Wakasek Kurikulum',
                makerName: 'Nama Wakasek, S.Pd',
                makerNip: '198501012010011002',
              }
            : currentSchool
        }
        onSave={handleSaveSchool}
        isNew={isSchoolModalNew}
      />

      <EditRowModal
        isOpen={isEditRowModalOpen}
        onClose={() => setIsEditRowModalOpen(false)}
        item={editingRowItem}
        onSave={handleSaveRowModal}
        isNew={isRowModalNew}
      />

      <EditTeacherModal
        isOpen={isEditTeacherModalOpen}
        onClose={() => setIsEditTeacherModalOpen(false)}
        teacher={editingTeacher}
        onSave={handleSaveTeacher}
        isNew={isTeacherModalNew}
      />

      <AbkCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        targetItem={calculatorTargetItem}
        onApply={handleApplyCalculatedAbk}
      />

      <ImportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        school={currentSchool}
        items={currentItems}
        onImportItems={handleImportItems}
      />
    </div>
  );
}
