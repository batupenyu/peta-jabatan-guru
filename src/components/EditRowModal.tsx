import React, { useState, useEffect } from 'react';
import { FunctionalLevel, PetaItem } from '../types/petaJabatan';
import { X, Check, BookOpen } from 'lucide-react';

interface EditRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PetaItem | null;
  onSave: (saved: Partial<PetaItem> & { id?: string }) => void;
  isNew: boolean;
}

export const EditRowModal: React.FC<EditRowModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  isNew,
}) => {
  const [level, setLevel] = useState<FunctionalLevel | string>('Guru Ahli Pertama');
  const [subject, setSubject] = useState('');
  const [abk, setAbk] = useState(1);
  const [pns, setPns] = useState(0);
  const [pppk, setPppk] = useState(0);
  const [gtt, setGtt] = useState(0);
  const [notes, setNotes] = useState('-');

  useEffect(() => {
    if (item) {
      setLevel(item.level || 'Guru Ahli Pertama');
      setSubject(item.subject || '');
      setAbk(item.abk ?? 1);
      setPns(item.pns ?? 0);
      setPppk(item.pppk ?? 0);
      setGtt(item.gtt ?? 0);
      setNotes(item.notes || '-');
    } else {
      setLevel('Guru Ahli Pertama');
      setSubject('');
      setAbk(1);
      setPns(0);
      setPppk(0);
      setGtt(0);
      setNotes('-');
    }
  }, [item, isNew]);

  if (!isOpen) return null;

  const total = pns + pppk + gtt;
  const diff = total - abk;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onSave({
      id: item?.id,
      level,
      subject: subject.trim(),
      abk,
      pns,
      pppk,
      gtt,
      notes: notes.trim() || '-',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            {isNew ? 'Tambah Formasi Jabatan Baru' : 'Edit Formasi Jabatan'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Jenjang Jabatan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenjang Jabatan Fungsional Guru
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="Guru Ahli Utama">Guru Ahli Utama (IV/d - IV/e)</option>
              <option value="Guru Ahli Madya">Guru Ahli Madya (IV/a - IV/c)</option>
              <option value="Guru Ahli Muda">Guru Ahli Muda (III/c - III/d)</option>
              <option value="Guru Ahli Pertama">Guru Ahli Pertama (III/a - III/b)</option>
            </select>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mata Pelajaran / Tugas Mengajar
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Matematika, Bahasa Inggris, Teknik Otomotif..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* ABK and Existing Staff Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kebutuhan ABK
              </label>
              <input
                type="number"
                min="0"
                value={abk}
                onChange={(e) => setAbk(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md font-mono tabular-nums font-bold text-slate-900 text-center focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Guru PNS
              </label>
              <input
                type="number"
                min="0"
                value={pns}
                onChange={(e) => setPns(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 text-center focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Guru PPPK
              </label>
              <input
                type="number"
                min="0"
                value={pppk}
                onChange={(e) => setPppk(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 text-center focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Guru GTT (Honorer)
              </label>
              <input
                type="number"
                min="0"
                value={gtt}
                onChange={(e) => setGtt(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md font-mono tabular-nums text-slate-900 text-center focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Quick Preview of Calculation */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between">
            <span className="text-slate-600 font-medium">
              Total Guru: <strong className="font-mono text-slate-900">{total}</strong> (PNS: {pns}, PPPK: {pppk}, GTT: {gtt})
            </span>
            <span
              className={`font-mono font-semibold px-2 py-0.5 rounded-sm text-xs ${
                diff < 0
                  ? 'bg-amber-100 text-amber-800'
                  : diff > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {diff < 0 ? `Kurang ${Math.abs(diff)}` : diff > 0 ? `Lebih ${diff}` : 'Sesuai / Pas'}
            </span>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keterangan / Rencana Tindak Lanjut
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Formasi kosong perlu seleksi PPPK, mendekati pensiun, dsb."
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Formasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
