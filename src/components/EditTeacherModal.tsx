import React, { useState, useEffect } from 'react';
import { Teacher, EmployeeStatus, FunctionalLevel } from '../types/petaJabatan';
import { parseNip } from '../utils/teacherSync';
import { X, Check, User, Clock } from 'lucide-react';

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
  const [rank, setRank] = useState('');
  const [subject, setSubject] = useState('');
  const [teachingHours, setTeachingHours] = useState<number>(24);
  const [additionalHours, setAdditionalHours] = useState<number>(0);
  const [additionalDuties, setAdditionalDuties] = useState('');
  const [teachingAssignments, setTeachingAssignments] = useState('');
  const [isCertified, setIsCertified] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || '');
      setNip(teacher.nip || '');
      setStatus(teacher.status || 'PNS');
      setFunctionalTitle(teacher.functionalTitle || 'Guru Ahli Pertama');
      setRank(teacher.rank || '');
      setSubject(teacher.subject || '');
      setTeachingHours(teacher.teachingHours !== undefined ? teacher.teachingHours : 24);
      setAdditionalHours(teacher.additionalHours !== undefined ? teacher.additionalHours : 0);
      setAdditionalDuties(teacher.additionalDuties || '');
      setTeachingAssignments(teacher.teachingAssignments || '');
      setIsCertified(teacher.isCertified !== undefined ? teacher.isCertified : true);
      setNotes(teacher.notes || '');
    } else {
      setName('');
      setNip('');
      setStatus('PNS');
      setFunctionalTitle('Guru Ahli Pertama');
      setRank('Penata Tk.1 / IIId');
      setSubject('Guru ');
      setTeachingHours(24);
      setAdditionalHours(0);
      setAdditionalDuties('');
      setTeachingAssignments('');
      setIsCertified(true);
      setNotes('');
    }
  }, [teacher, isNew]);

  if (!isOpen) return null;

  const nipInfo = parseNip(nip, 2026);
  const totalWorkload = Number(teachingHours) + Number(additionalHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: teacher?.id,
      name: name.trim(),
      nip: nip.trim() || '-',
      status,
      functionalTitle,
      rank: rank.trim(),
      subject: subject.trim(),
      teachingHours: Number(teachingHours) || 0,
      additionalHours: Number(additionalHours) || 0,
      totalWorkload,
      additionalDuties: additionalDuties.trim(),
      teachingAssignments: teachingAssignments.trim() || subject.trim(),
      isCertified,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {isNew ? 'Tambah Tenaga Pendidik Baru' : 'Edit Data Tenaga Pendidik'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Nama Guru */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar Tenaga Pendidik
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dra. Lismasari, Al Fikri, S.Pd."
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* NIP & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP / NIP PPPK (18 Digit)
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="198108182005012011 atau -"
                className="w-full px-2.5 py-2 font-mono border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
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
                <option value="PPPKPW">PPPKPW (Paruh Waktu)</option>
                <option value="GTT">GTT (Guru Tidak Tetap / Honorer)</option>
              </select>
            </div>
          </div>

          {/* NIP Auto Analysis Preview */}
          {nip.length >= 8 && nip !== '-' && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-[11px] text-slate-600 flex justify-between items-center font-mono">
              <span>Lahir: {nipInfo.birthDateFormatted} ({nipInfo.age} Thn)</span>
              <span className={nipInfo.yearsToRetirement <= 5 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                BUP Pensiun: {nipInfo.retirementYear} ({nipInfo.yearsToRetirement} thn lagi)
              </span>
            </div>
          )}

          {/* Jabatan Fungsional & Pangkat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pangkat / Golongan Ruang
              </label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Contoh: Pembina / IVa, Penata Tk.1 / IIId"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Mapel */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mata Pelajaran (MAPEL) Diampu
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Guru Matematika, Guru Teknik Otomotif, Guru Bahasa Inggris"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* PJM Dapodik Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Beban Jam Mengajar (PJM Dapodik)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Jam Tatap Muka (JTM)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={teachingHours}
                  onChange={(e) => setTeachingHours(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1.5 font-mono text-center border border-slate-200 rounded-md bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tugas Tambahan (JJT)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={additionalHours}
                  onChange={(e) => setAdditionalHours(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1.5 font-mono text-center border border-slate-200 rounded-md bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Total Beban Kerja
                </label>
                <div className="px-2 py-1.5 font-mono font-bold text-center bg-slate-200/70 border border-slate-300 rounded-md text-slate-900">
                  {totalWorkload} JP
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Tugas Tambahan / Ekuivalensi
              </label>
              <input
                type="text"
                value={additionalDuties}
                onChange={(e) => setAdditionalDuties(e.target.value)}
                placeholder="Misal: Wakasek Kurikulum (12 JP), Ka.Bengkel, Wali Kelas"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="certifiedCheck"
                checked={isCertified}
                onChange={(e) => setIsCertified(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="certifiedCheck" className="text-xs text-slate-700 font-medium">
                Pendidik Bersertifikasi (Sertifikasi TPG)
              </label>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan relevan untuk kebutuhan penataan formasi"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
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
