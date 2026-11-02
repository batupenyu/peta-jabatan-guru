import React, { useState } from 'react';
import { PetaItem } from '../types/petaJabatan';
import {
  Search,
  Plus,
  Calculator,
  Edit2,
  Trash2,
  Copy,
  ArrowUpDown,
  Filter,
  Users,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface PetaJabatanTableProps {
  items: PetaItem[];
  onUpdateItem: (id: string, updates: Partial<PetaItem>) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onAddItem: () => void;
  onOpenCalculatorFor: (item: PetaItem) => void;
  onEditItemModal: (item: PetaItem) => void;
  onNavigateToTeacherRoster?: () => void;
}

export const PetaJabatanTable: React.FC<PetaJabatanTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onAddItem,
  onOpenCalculatorFor,
  onEditItemModal,
  onNavigateToTeacherRoster,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'number' | 'subject' | 'abk' | 'diff'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.level.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.assignedTeachers || []).some(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.nip.includes(search)
      );

    const matchStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'KURANG'
        ? item.diff < 0
        : statusFilter === 'LEBIH'
        ? item.diff > 0
        : statusFilter === 'SESUAI'
        ? item.diff === 0
        : statusFilter === 'HAS_GTT'
        ? item.gtt > 0
        : true;

    const matchLevel = levelFilter === 'ALL' ? true : item.level === levelFilter;

    return matchSearch && matchStatus && matchLevel;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'number') cmp = a.number - b.number;
    else if (sortBy === 'subject') cmp = a.subject.localeCompare(b.subject);
    else if (sortBy === 'abk') cmp = a.abk - b.abk;
    else if (sortBy === 'diff') cmp = a.diff - b.diff;

    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field: 'number' | 'subject' | 'abk' | 'diff') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  // Grand totals
  const totalAbk = items.reduce((acc, i) => acc + i.abk, 0);
  const totalPns = items.reduce((acc, i) => acc + i.pns, 0);
  const totalPppk = items.reduce((acc, i) => acc + i.pppk, 0);
  const totalGtt = items.reduce((acc, i) => acc + i.gtt, 0);
  const grandTotal = totalPns + totalPppk + totalGtt;
  const totalKurang = items
    .filter((i) => i.diff < 0)
    .reduce((acc, i) => acc + Math.abs(i.diff), 0);
  const totalLebih = items
    .filter((i) => i.diff > 0)
    .reduce((acc, i) => acc + i.diff, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mapel, jenjang, atau nama guru..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Status Filter Segmented Buttons */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('KURANG')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'KURANG'
                  ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kurang Formasi ({items.filter((i) => i.diff < 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('LEBIH')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'LEBIH'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lebih ({items.filter((i) => i.diff > 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('SESUAI')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'SESUAI'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sesuai / Pas ({items.filter((i) => i.diff === 0).length})
            </button>
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="Guru Ahli Madya">Guru Ahli Madya</option>
              <option value="Guru Ahli Muda">Guru Ahli Muda</option>
              <option value="Guru Ahli Pertama">Guru Ahli Pertama</option>
              <option value="Guru Ahli Utama">Guru Ahli Utama</option>
            </select>
          </div>
        </div>

        {/* Right: Add new row action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddItem}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris</span>
          </button>
        </div>
      </div>

      {/* High-density Data Table with Sticky Header on Scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] min-h-[450px] relative border-t border-slate-200">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 shadow-xs">
              <th
                onClick={() => toggleSort('number')}
                className="py-2.5 px-3 w-12 text-center cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>NO</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('subject')}
                className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
              >
                <div className="flex items-center gap-1">
                  <span>JENJANG & MATA PELAJARAN</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('abk')}
                className="py-2.5 px-3 text-center w-28 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>JUMLAH ABK</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center w-20 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                PNS
              </th>
              <th className="py-2.5 px-3 text-center w-20 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                PPPK
              </th>
              <th className="py-2.5 px-3 text-center w-20 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                GTT
              </th>
              <th className="py-2.5 px-3 text-center w-24 bg-slate-200/70 sticky top-0 z-20 border-b border-slate-300 shadow-xs">
                TOTAL
              </th>
              <th
                onClick={() => toggleSort('diff')}
                className="py-2.5 px-3 text-center w-28 cursor-pointer hover:bg-slate-200/80 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>LEBIH / KURANG</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 min-w-[160px] sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                KETERANGAN / GURU PENGAMPU
              </th>
              <th className="py-2.5 px-3 text-center w-28 sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
                AKSI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <p className="font-medium text-slate-600">
                      Tidak ada data yang cocok dengan filter
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Coba ubah kata kunci pencarian atau bersihkan filter status.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const isUnder = item.diff < 0;
                const isOver = item.diff > 0;
                const isExpanded = expandedRowId === item.id;
                const teachers = item.assignedTeachers || [];

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-colors ${
                        isUnder
                          ? 'bg-amber-50/30'
                          : isOver
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      {/* NO */}
                      <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-500 font-medium">
                        {item.number}
                      </td>

                      {/* MATA PELAJARAN + JENJANG */}
                      <td className="py-2 px-4">
                        <div className="flex items-start gap-1.5">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            title="Tampilkan daftar nama guru pengampu"
                            className="mt-0.5 text-slate-400 hover:text-slate-800"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {item.subject}
                              {teachers.length > 0 && (
                                <span className="text-[10px] text-indigo-600 font-normal">
                                  ({teachers.length} guru)
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {item.level}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* JUMLAH ABK */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={item.abk}
                            onChange={(e) =>
                              onUpdateItem(item.id, {
                                abk: Math.max(0, parseInt(e.target.value, 10) || 0),
                              })
                            }
                            className="w-12 text-center font-mono tabular-nums font-bold text-slate-800 bg-white border border-slate-200 rounded-sm py-1 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                          />
                          <button
                            onClick={() => onOpenCalculatorFor(item)}
                            title="Hitung ABK otomatis via Rombel & Jam Tatap Muka"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-sm"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* PNS */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.pns}
                          onChange={(e) =>
                            onUpdateItem(item.id, {
                              pns: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-12 text-center font-mono tabular-nums text-slate-800 bg-white border border-slate-200 rounded-sm py-1 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                        />
                      </td>

                      {/* PPPK */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.pppk}
                          onChange={(e) =>
                            onUpdateItem(item.id, {
                              pppk: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-12 text-center font-mono tabular-nums text-slate-800 bg-white border border-slate-200 rounded-sm py-1 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                        />
                      </td>

                      {/* GTT */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.gtt}
                          onChange={(e) =>
                            onUpdateItem(item.id, {
                              gtt: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-12 text-center font-mono tabular-nums text-slate-800 bg-white border border-slate-200 rounded-sm py-1 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                        />
                      </td>

                      {/* TOTAL */}
                      <td className="py-2 px-3 text-center bg-slate-100/50">
                        <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                          {item.total}
                        </span>
                      </td>

                      {/* LEBIH / KURANG */}
                      <td className="py-2 px-3 text-center">
                        {isUnder ? (
                          <span className="font-mono tabular-nums font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                            {Math.abs(item.diff)} (Kurang)
                          </span>
                        ) : isOver ? (
                          <span className="font-mono tabular-nums font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                            +{item.diff} (Lebih)
                          </span>
                        ) : (
                          <span className="font-mono tabular-nums text-slate-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* KETERANGAN */}
                      <td className="py-2 px-4">
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              onUpdateItem(item.id, { notes: e.target.value })
                            }
                            placeholder="Catatan formasi..."
                            className="w-full text-xs text-slate-700 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-slate-300 rounded-sm px-1.5 py-1 focus:outline-hidden"
                          />
                          {teachers.length === 0 && item.abk > 0 && (
                            <span className="text-[10px] text-amber-600 font-medium px-1">
                              ⚠️ Formasi belum terisi guru terdata
                            </span>
                          )}
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditItemModal(item)}
                            title="Edit baris lengkap"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateItem(item.id)}
                            title="Duplikasi baris"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Hapus baris"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Teacher Roster Row */}
                    {isExpanded && (
                      <tr className="bg-indigo-50/40 border-b border-indigo-100">
                        <td colSpan={10} className="px-6 py-3">
                          <div className="text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Guru Pengampu Terdaftar ({teachers.length} orang):</span>
                              </span>
                              {onNavigateToTeacherRoster && (
                                <button
                                  onClick={onNavigateToTeacherRoster}
                                  className="text-[11px] text-indigo-700 hover:underline font-medium"
                                >
                                  Buka Tab Data Guru Lengkap →
                                </button>
                              )}
                            </div>

                            {teachers.length === 0 ? (
                              <div className="p-3 bg-white border border-amber-200 rounded-md text-amber-800 text-[11px] flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  Belum ada nama guru yang terdata untuk formasi {item.level} - {item.subject}. Posisi ini berstatus kosong / butuh pengadaan pegawai.
                                </span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {teachers.map((t) => (
                                  <div
                                    key={t.id}
                                    className="p-2.5 bg-white border border-slate-200 rounded-md space-y-1 shadow-2xs"
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-bold text-slate-900">
                                        {t.name}
                                      </span>
                                      <span
                                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded-xs font-semibold ${
                                          t.status === 'PNS'
                                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                        }`}
                                      >
                                        {t.status}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      NIP: {t.nip}
                                    </div>
                                    <div className="text-[10px] text-slate-600">
                                      {t.subject}
                                    </div>
                                    {t.notes && (
                                      <div className="text-[10px] text-indigo-700 font-medium">
                                        • {t.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* Table Grand Totals with Sticky Bottom */}
          <tfoot className="sticky bottom-0 z-20 shadow-[0_-2px_6px_rgba(0,0,0,0.06)]">
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <td colSpan={2} className="py-3 px-4 text-right tracking-wider uppercase text-xs sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                JUMLAH TOTAL
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {totalAbk}
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {totalPns}
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {totalPppk}
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {totalGtt}
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm bg-slate-200/80 sticky bottom-0 z-20 border-t-2 border-slate-300">
                {grandTotal}
              </td>
              <td className="py-3 px-3 text-center font-mono tabular-nums text-sm sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {totalKurang > 0 ? (
                  <span className="text-amber-700">Kurang {totalKurang}</span>
                ) : totalLebih > 0 ? (
                  <span className="text-blue-700">Lebih {totalLebih}</span>
                ) : (
                  <span className="text-emerald-700">Pas (0)</span>
                )}
              </td>
              <td colSpan={2} className="py-3 px-4 text-xs text-slate-600 font-normal sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300">
                {items.length} Formasi Guru tercatat
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
