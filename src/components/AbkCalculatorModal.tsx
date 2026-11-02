import React, { useState, useEffect } from 'react';
import { PetaItem } from '../types/petaJabatan';
import { calculateAbkFromCurriculum } from '../utils/calculator';
import { Calculator, X, Check, HelpCircle, BookOpen } from 'lucide-react';

interface AbkCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: PetaItem | null;
  onApply: (itemId: string, calculatedAbk: number, details: any) => void;
}

export const AbkCalculatorModal: React.FC<AbkCalculatorModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onApply,
}) => {
  const [rombelCount, setRombelCount] = useState<number>(12); // e.g. 4 kelas X, 4 kelas XI, 4 kelas XII = 12 rombel
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(4);
  const [standardHours, setStandardHours] = useState<number>(24);
  const [subjectPreset, setSubjectPreset] = useState<string>('custom');

  useEffect(() => {
    if (targetItem) {
      if (targetItem.calculationDetails) {
        setRombelCount(targetItem.calculationDetails.rombelCount);
        setHoursPerWeek(targetItem.calculationDetails.hoursPerWeek);
        setStandardHours(targetItem.calculationDetails.standardHours || 24);
      } else {
        // Guess default based on subject name
        const lower = targetItem.subject.toLowerCase();
        if (lower.includes('matematika') || lower.includes('indonesia')) {
          setHoursPerWeek(4);
        } else if (lower.includes('inggris') || lower.includes('sejarah') || lower.includes('agama')) {
          setHoursPerWeek(3);
        } else if (lower.includes('kejuruan') || lower.includes('teknik') || lower.includes('otomotif') || lower.includes('jaringan') || lower.includes('pengelasan')) {
          setHoursPerWeek(8);
        } else if (lower.includes('konseling') || lower.includes('bk')) {
          setHoursPerWeek(4); // Or 1:150 students
        }
      }
    }
  }, [targetItem]);

  if (!isOpen || !targetItem) return null;

  const result = calculateAbkFromCurriculum(rombelCount, hoursPerWeek, standardHours);

  const applyPreset = (preset: string) => {
    setSubjectPreset(preset);
    if (preset === 'merdeka-normatif-2') {
      setHoursPerWeek(2);
    } else if (preset === 'merdeka-dasar-3') {
      setHoursPerWeek(3);
    } else if (preset === 'merdeka-wajib-4') {
      setHoursPerWeek(4);
    } else if (preset === 'smk-kejuruan-8') {
      setHoursPerWeek(8);
    } else if (preset === 'smk-kejuruan-12') {
      setHoursPerWeek(12);
    }
  };

  const handleApply = () => {
    onApply(targetItem.id, result.calculatedAbk, {
      rombelCount,
      hoursPerWeek,
      standardHours,
      totalWeeklyHours: result.totalHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kalkulator Kebutuhan ABK Guru
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {targetItem.subject} ({targetItem.level})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Preset Buttons */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Preset Struktur Kurikulum (JTM per Minggu):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('merdeka-normatif-2')}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  hoursPerWeek === 2
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                2 Jam/mg (PPKn/Seni)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('merdeka-dasar-3')}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  hoursPerWeek === 3
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                3 Jam/mg (B. Inggris/Sejarah)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('merdeka-wajib-4')}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  hoursPerWeek === 4
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                4 Jam/mg (Matematika/B. Indo)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('smk-kejuruan-8')}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  hoursPerWeek === 8
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                8 Jam/mg (Konsentrasi SMK)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('smk-kejuruan-12')}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  hoursPerWeek === 12
                    ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                12 Jam/mg (Praktik Blok SMK)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Rombel */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Jumlah Rombel (Kelas)
              </label>
              <input
                type="number"
                min="1"
                value={rombelCount}
                onChange={(e) => setRombelCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Total kelas yang diajar
              </span>
            </div>

            {/* JTM */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                JTM / Minggu / Rombel
              </label>
              <input
                type="number"
                min="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Jam tatap muka per kelas
              </span>
            </div>

            {/* Standar Jam */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kewajiban Jam / Guru
              </label>
              <input
                type="number"
                min="18"
                max="40"
                value={standardHours}
                onChange={(e) => setStandardHours(Math.max(18, parseInt(e.target.value, 10) || 24))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standar BKN/UU: 24 jam/mg
              </span>
            </div>
          </div>

          {/* Live Calculation Result Surface */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Total Jam Kebutuhan Sekolah:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {rombelCount} rombel × {hoursPerWeek} jam = {result.totalHours} jam/minggu
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Rasio Beban Guru Riil:</span>
              <span className="font-mono tabular-nums text-slate-700">
                {result.totalHours} ÷ {standardHours} = {result.rawAbk} formasi
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Kebutuhan ABK Rekomendasi:
                </span>
                <span className="text-[10px] text-slate-500">
                  Pembulatan ke atas sesuai standar formasi Kemdikbud
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
                  {result.calculatedAbk}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">guru</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Nilai ABK saat ini di tabel: <strong className="text-slate-700 font-mono">{targetItem.abk}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Nilai ({result.calculatedAbk})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
