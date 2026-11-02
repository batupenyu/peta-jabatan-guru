import React, { useState } from 'react';
import { calculateAbkFromCurriculum } from '../utils/calculator';
import { Calculator, Plus, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { PetaItem } from '../types/petaJabatan';

interface StandaloneCalculatorProps {
  onAddCalculatedItemToTable: (item: Partial<PetaItem>) => void;
}

export const StandaloneCalculator: React.FC<StandaloneCalculatorProps> = ({
  onAddCalculatedItemToTable,
}) => {
  const [subjectName, setSubjectName] = useState('Matematika');
  const [level, setLevel] = useState('Guru Ahli Pertama');
  const [rombelX, setRombelX] = useState(4);
  const [rombelXI, setRombelXI] = useState(4);
  const [rombelXII, setRombelXII] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [standardHours, setStandardHours] = useState(24);
  const [existingPns, setExistingPns] = useState(1);
  const [existingPppk, setExistingPppk] = useState(0);
  const [existingGtt, setExistingGtt] = useState(0);
  const [notes, setNotes] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const totalRombel = rombelX + rombelXI + rombelXII;
  const result = calculateAbkFromCurriculum(totalRombel, hoursPerWeek, standardHours);
  const totalGuru = existingPns + existingPppk + existingGtt;
  const diff = totalGuru - result.calculatedAbk;

  const handleAdd = () => {
    onAddCalculatedItemToTable({
      level,
      subject: subjectName,
      abk: result.calculatedAbk,
      pns: existingPns,
      pppk: existingPppk,
      gtt: existingGtt,
      notes: notes || `Dihitung dari ${totalRombel} rombel × ${hoursPerWeek} jam`,
      calculationDetails: {
        rombelCount: totalRombel,
        hoursPerWeek,
        standardHours,
        totalWeeklyHours: result.totalHours,
      },
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Kalkulator Analisis Beban Kerja (ABK) Guru
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hitung kebutuhan formasi guru secara akurat berdasarkan regulasi Permendikbudristek No. 25 & BKN. Rumus standar:{' '}
              <span className="font-mono font-semibold text-slate-700">
                ABK = Pembulatan Ke Atas (Total Rombel × JTM per Minggu ÷ 24 Jam)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input parameters */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            1. Data Mata Pelajaran & Rombongan Belajar
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mata Pelajaran
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenjang Jabatan
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="Guru Ahli Madya">Guru Ahli Madya</option>
              <option value="Guru Ahli Muda">Guru Ahli Muda</option>
              <option value="Guru Ahli Pertama">Guru Ahli Pertama</option>
              <option value="Guru Ahli Utama">Guru Ahli Utama</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rombongan Belajar per Tingkat Kelas:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Kelas X</span>
                <input
                  type="number"
                  min="0"
                  value={rombelX}
                  onChange={(e) => setRombelX(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Kelas XI</span>
                <input
                  type="number"
                  min="0"
                  value={rombelXI}
                  onChange={(e) => setRombelXI(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Kelas XII</span>
                <input
                  type="number"
                  min="0"
                  value={rombelXII}
                  onChange={(e) => setRombelXII(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">
              Total: {totalRombel} Rombongan Belajar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jam Tatap Muka (JTM/mg)
              </label>
              <input
                type="number"
                min="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-center"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standar Beban Kerja (Jam)
              </label>
              <input
                type="number"
                min="18"
                max="40"
                value={standardHours}
                onChange={(e) => setStandardHours(Math.max(18, parseInt(e.target.value, 10) || 24))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-center"
              />
            </div>
          </div>

          {/* Eksisting */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 mb-1">
              Guru Eksisting Saat Ini
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">PNS</span>
                <input
                  type="number"
                  min="0"
                  value={existingPns}
                  onChange={(e) => setExistingPns(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">PPPK</span>
                <input
                  type="number"
                  min="0"
                  value={existingPppk}
                  onChange={(e) => setExistingPppk(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">GTT</span>
                <input
                  type="number"
                  min="0"
                  value={existingGtt}
                  onChange={(e) => setExistingGtt(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time calculation output card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between text-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              2. Hasil Perhitungan Kebutuhan Riil
            </h3>

            <div className="mt-4 space-y-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Total Jam Kebutuhan:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {totalRombel} × {hoursPerWeek} = {result.totalHours} jam/minggu
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Rasio Riil Guru:</span>
                <span className="font-mono text-slate-700">
                  {result.totalHours} ÷ {standardHours} = {result.rawAbk} formasi
                </span>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 text-sm block">
                    Kebutuhan ABK Final:
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    Standar formasi BKN dibulatkan ke atas
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-indigo-700">
                    {result.calculatedAbk}
                  </span>
                  <span className="text-xs text-indigo-700 ml-1 font-semibold">Guru</span>
                </div>
              </div>

              {/* Status formasi */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Guru Eksisting:</span>
                  <span className="font-mono font-bold text-slate-900">{totalGuru} orang</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-600 font-semibold">Status Formasi:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-sm ${
                      diff < 0
                        ? 'bg-amber-100 text-amber-800'
                        : diff > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {diff < 0 ? `Defisit ${Math.abs(diff)} Guru` : diff > 0 ? `Surplus ${diff} Guru` : 'Sesuai (Ideal)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleAdd}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan Hasil Kalkulasi Ini ke Tabel Peta Jabatan</span>
            </button>
            {addedSuccess && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-center text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Berhasil ditambahkan ke daftar tabel formasi!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
