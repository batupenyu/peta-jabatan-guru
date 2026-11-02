import React, { useState, useEffect } from 'react';
import { Teacher, EmployeeStatus, FunctionalLevel } from '../types/petaJabatan';
import { parseNip } from '../utils/teacherSync';
import { X, Check, User } from 'lucide-react';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (saved: Partial<Teacher> & { id?: string }) => void;
  isNew: boolean;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSave,
  isNew,
}) => {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('PNS');
  const [functionalTitle, setFunctionalTitle] = useState<FunctionalLevel | string>('Guru Ahli Pertama');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || '');
      setNip(teacher.nip || '');
      setStatus(teacher.status || 'PNS');
      setFunctionalTitle(teacher.functionalTitle || 'Guru Ahli Pertama');
      setSubject(teacher.subject || '');
      setNotes(teacher.notes || '');
    } else {
      setName('');
      setNip('');
      setStatus('PNS');
      setFunctionalTitle('Guru Ahli Pertama');
      setSubject('Guru ');
      setNotes('');
    }
  }, [teacher, isNew]);

  if (!isOpen) return null;

  const nipInfo = parseNip(nip, 2026);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nip.trim()) return;

    onSave({
      id: teacher?.id,
      name: name.trim(),
      nip: nip.trim(),
      status,
      functionalTitle,
      subject: subject.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {isNew ? 'Tambah Tenaga Pendidik Baru' : 'Edit Data Tenaga Pendidik'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Nama */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Indra, S.Pd"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* NIP & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                NIP / NIP PPPK (18 Digit)
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/\s+/g, ''))}
                placeholder="198907012023211008"
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Kepegawaian
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="PPPKPW">PPPKPW</option>
                <option value="GTT">GTT (Honorer)</option>
              </select>
            </div>
          </div>

          {/* NIP Auto Analysis Preview */}
          {nip.length >= 8 && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-[11px] text-slate-600 flex justify-between items-center font-mono">
              <span>Lahir: {nipInfo.birthDateFormatted} ({nipInfo.age} Thn)</span>
              <span className={nipInfo.yearsToRetirement <= 5 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                BUP Pensiun: {nipInfo.retirementYear} ({nipInfo.yearsToRetirement} thn lagi)
              </span>
            </div>
          )}

          {/* Jabatan Fungsional */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jabatan Fungsional Guru
            </label>
            <select
              value={functionalTitle}
              onChange={(e) => setFunctionalTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="Guru Ahli Madya">Guru Ahli Madya</option>
              <option value="Guru Ahli Muda">Guru Ahli Muda</option>
              <option value="Guru Ahli Pertama">Guru Ahli Pertama</option>
              <option value="Guru Ahli Utama">Guru Ahli Utama</option>
            </select>
          </div>

          {/* Mapel */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mata Pelajaran (MAPEL)
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Guru Matematika, Guru Teknik Otomotif"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan / Tugas Tambahan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Wakasek Kurikulum, Kepala Bengkel, Wali Kelas"
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
              <span>Simpan Guru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
