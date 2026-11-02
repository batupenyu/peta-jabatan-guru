import React, { useState } from 'react';
import { Teacher } from '../types/petaJabatan';
import { parseNip } from '../utils/teacherSync';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface TeacherRosterTableProps {
  teachers: Teacher[];
  onAddTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onSyncToPetaJabatan: () => void;
  isSyncing?: boolean;
}

export const TeacherRosterTable: React.FC<TeacherRosterTableProps> = ({
  teachers,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onSyncToPetaJabatan,
  isSyncing = false,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PNS' | 'PPPK' | 'PPPKPW' | 'GTT'>('ALL');
  const [retirementFilter, setRetirementFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'nip' | 'status' | 'age' | 'retirement'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Parse NIP and compute stats
  const teachersWithInfo = teachers.map((t) => {
    const nipInfo = parseNip(t.nip, 2026);
    return { ...t, nipInfo };
  });

  const totalTeachers = teachers.length;
  const totalPns = teachers.filter((t) => t.status === 'PNS').length;
  const totalPppk = teachers.filter((t) => t.status === 'PPPK').length;
  const totalPppkPw = teachers.filter((t) => t.status === 'PPPKPW').length;
  const totalGtt = teachers.filter((t) => t.status === 'GTT').length;
  const criticalRetirementCount = teachersWithInfo.filter(
    (t) => t.nipInfo.retirementUrgency === 'CRITICAL_1_2_YEARS'
  ).length;
  const warningRetirementCount = teachersWithInfo.filter(
    (t) => t.nipInfo.retirementUrgency === 'WARNING_3_5_YEARS'
  ).length;

  // Filter
  const filtered = teachersWithInfo.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.includes(search) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.functionalTitle.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' ? true : item.status === statusFilter;

    const matchRetirement =
      retirementFilter === 'ALL'
        ? true
        : retirementFilter === 'CRITICAL'
        ? item.nipInfo.retirementUrgency === 'CRITICAL_1_2_YEARS'
        : item.nipInfo.retirementUrgency === 'WARNING_3_5_YEARS';

    return matchSearch && matchStatus && matchRetirement;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'nip') cmp = a.nip.localeCompare(b.nip);
    else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortBy === 'age') cmp = a.nipInfo.age - b.nipInfo.age;
    else if (sortBy === 'retirement') cmp = a.nipInfo.yearsToRetirement - b.nipInfo.yearsToRetirement;

    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field: 'name' | 'nip' | 'status' | 'age' | 'retirement') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Roster */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Total Guru Terdaftar</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">{totalTeachers}</span>
            <span className="text-xs text-slate-500 font-medium">Orang</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Guru PNS</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">{totalPns}</span>
            <span className="text-xs text-slate-500 font-mono">
              ({totalTeachers > 0 ? Math.round((totalPns / totalTeachers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Guru ASN PPPK / PW</span>
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="text-xl font-bold font-mono tabular-nums text-indigo-700">{totalPppk + totalPppkPw}</span>
            <span className="text-xs text-slate-500 font-mono">
              ({totalTeachers > 0 ? Math.round(((totalPppk + totalPppkPw) / totalTeachers) * 100) : 0}%)
            </span>
            {totalPppkPw > 0 && (
              <span className="text-[10px] text-violet-700 bg-violet-50 px-1 py-0.2 rounded font-mono font-medium border border-violet-200">
                {totalPppkPw} PW
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <span className="text-[11px] font-medium text-amber-700 block">Proyeksi Pensiun (1-5 Thn)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-amber-600">
              {criticalRetirementCount + warningRetirementCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">Guru</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIP, mapel..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({totalTeachers})
              </button>
              <button
                onClick={() => setStatusFilter('PNS')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'PNS'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PNS ({totalPns})
              </button>
              <button
                onClick={() => setStatusFilter('PPPK')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'PPPK'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PPPK ({totalPppk})
              </button>
              <button
                onClick={() => setStatusFilter('PPPKPW')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === 'PPPKPW'
                    ? 'bg-white text-violet-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PPPKPW ({totalPppkPw})
              </button>
              {totalGtt > 0 && (
                <button
                  onClick={() => setStatusFilter('GTT')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'GTT'
                      ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  GTT ({totalGtt})
                </button>
              )}
            </div>

            {/* Filter Pensiun */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={retirementFilter}
                onChange={(e) => setRetirementFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2 text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">Semua Usia / Masa Kerja</option>
                <option value="CRITICAL">Pensiun Mendesak (1-2 Tahun)</option>
                <option value="WARNING">Pensiun Mendekati (3-5 Tahun)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSyncToPetaJabatan}
              disabled={isSyncing}
              title="Sinkronkan nama guru ke tabel Peta Jabatan secara otomatis"
              className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sinkronkan ke Peta Jabatan</span>
            </button>
            <button
              onClick={onAddTeacher}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Guru</span>
            </button>
          </div>
        </div>

        {/* Table with Sticky Header on Scroll */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] min-h-[450px] relative border-t border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 shadow-xs">
                <th className="py-2.5 px-3 w-10 text-center sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                  NO
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
                >
                  <div className="flex items-center gap-1">
                    <span>NAMA TENAGA PENDIDIK</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('nip')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
                >
                  <div className="flex items-center gap-1">
                    <span>NIP / NIP PPPK</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="py-2.5 px-3 text-center w-20 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>STATUS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-4 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                  JABATAN
                </th>
                <th className="py-2.5 px-4 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                  MATA PELAJARAN DIAMPUS
                </th>
                <th
                  onClick={() => toggleSort('retirement')}
                  className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
                >
                  <div className="flex items-center gap-1">
                    <span>PROYEKSI PENSIUN (BUP 60)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center w-20 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada guru yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                sorted.map((item, idx) => {
                  const isRetiringSoon = item.nipInfo.yearsToRetirement <= 5;
                  const isCriticalRetirement = item.nipInfo.yearsToRetirement <= 2;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCriticalRetirement
                          ? 'bg-amber-50/40'
                          : isRetiringSoon
                          ? 'bg-orange-50/20'
                          : ''
                      }`}
                    >
                      {/* NO */}
                      <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-500 font-medium">
                        {idx + 1}
                      </td>

                      {/* NAMA */}
                      <td className="py-2 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isHeadmaster && (
                            <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded-xs font-normal">
                              Kepsek
                            </span>
                          )}
                          {item.notes?.includes('Wakasek') && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-xs font-normal">
                              Wakasek
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NIP */}
                      <td className="py-2 px-4 font-mono tabular-nums text-slate-700">
                        {item.nip}
                      </td>

                      {/* STATUS */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-sm ${
                            item.status === 'PNS'
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : item.status === 'PPPK'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : item.status === 'PPPKPW'
                              ? 'bg-violet-50 text-violet-700 border border-violet-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* JABATAN */}
                      <td className="py-2 px-4 text-slate-800 font-medium">
                        {item.functionalTitle}
                      </td>

                      {/* MATA PELAJARAN */}
                      <td className="py-2 px-4 text-slate-800">
                        {item.subject}
                      </td>

                      {/* PROYEKSI PENSIUN */}
                      <td className="py-2 px-4 font-mono tabular-nums">
                        <div className="flex flex-col text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-800">Usia {item.nipInfo.age} Thn</span>
                            <span>·</span>
                            <span
                              className={`font-semibold ${
                                isCriticalRetirement
                                  ? 'text-amber-700 font-bold'
                                  : isRetiringSoon
                                  ? 'text-orange-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              Pensiun {item.nipInfo.retirementYear} ({item.nipInfo.yearsToRetirement} thn lagi)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Lahir: {item.nipInfo.birthDateFormatted} ({item.nipInfo.gender})
                          </span>
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTeacher(item)}
                            title="Edit data guru"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTeacher(item.id)}
                            title="Hapus guru"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
