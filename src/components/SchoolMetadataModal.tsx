import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../types/petaJabatan';
import { School, X, Check } from 'lucide-react';

interface SchoolMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  onSave: (updated: SchoolProfile) => void;
  isNew?: boolean;
}

export const SchoolMetadataModal: React.FC<SchoolMetadataModalProps> = ({
  isOpen,
  onClose,
  school,
  onSave,
  isNew = false,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...school });

  useEffect(() => {
    setFormData({ ...school });
  }, [school, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {isNew ? 'Tambah Satuan Pendidikan Baru' : 'Identitas Satuan Pendidikan & Penandatangan'}
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
          {/* Nama Sekolah & Jenjang */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Satuan Pendidikan
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="SMK NEGERI 1 KOBA"
                className="w-full px-3 py-2 border border-slate-200 rounded-md font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenjang
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as 'SMK' | 'SMA' | 'SMP' | 'SD',
                  })
                }
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="SMK">SMK</option>
                <option value="SMA">SMA</option>
                <option value="SMP">SMP</option>
                <option value="SD">SD</option>
              </select>
            </div>
          </div>

          {/* Tahun, Lokasi & Tanggal Dokumen */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kota / Lokasi
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Pangkalpinang"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bulan & Tahun
              </label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Februari 2026"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Kepala Sekolah */}
          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900 block mb-2">
              Penandatangan: Kepala Sekolah
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.headmasterName}
                  onChange={(e) =>
                    setFormData({ ...formData, headmasterName: e.target.value })
                  }
                  placeholder="Syahryanto,S.T.,M.Pd"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.headmasterNip}
                  onChange={(e) =>
                    setFormData({ ...formData, headmasterNip: e.target.value })
                  }
                  placeholder="197708262006041005"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Pembuat Dokumen */}
          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900 block mb-2">
              Penyusun / Pembuat Dokumen
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Jabatan Pembuat</label>
                <input
                  type="text"
                  required
                  value={formData.makerTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, makerTitle: e.target.value })
                  }
                  placeholder="Wakasek Kurikulum"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Nama Pembuat</label>
                <input
                  type="text"
                  required
                  value={formData.makerName}
                  onChange={(e) =>
                    setFormData({ ...formData, makerName: e.target.value })
                  }
                  placeholder="Indra, S.Pd"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">NIP Pembuat</label>
                <input
                  type="text"
                  required
                  value={formData.makerNip}
                  onChange={(e) =>
                    setFormData({ ...formData, makerNip: e.target.value })
                  }
                  placeholder="198907012023211008"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
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
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
