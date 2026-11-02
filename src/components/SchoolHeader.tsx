import React from 'react';
import { SchoolProfile } from '../types/petaJabatan';
import { School, Settings, RotateCcw, Plus, ChevronDown } from 'lucide-react';

interface SchoolHeaderProps {
  currentSchool: SchoolProfile;
  availableSchools: SchoolProfile[];
  onSelectSchool: (id: string) => void;
  onEditSchool: () => void;
  onAddSchool: () => void;
  onResetDefault: () => void;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  currentSchool,
  availableSchools,
  onSelectSchool,
  onEditSchool,
  onAddSchool,
  onResetDefault,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: School identity and selector */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
            <School className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative inline-block">
                <select
                  value={currentSchool.id}
                  onChange={(e) => onSelectSchool(e.target.value)}
                  className="appearance-none font-bold text-slate-900 text-lg sm:text-xl bg-transparent pr-7 cursor-pointer hover:text-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 rounded-sm"
                >
                  {availableSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.year})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Zero-Pill unboxed metadata line */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap font-medium">
              <span>Satuan Pendidikan: {currentSchool.level}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Tahun {currentSchool.year}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{currentSchool.location}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Kepsek: {currentSchool.headmasterName}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions for school configuration */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={onEditSchool}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Identitas & NIP</span>
          </button>
          <button
            onClick={onAddSchool}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah Sekolah</span>
          </button>
          <button
            onClick={onResetDefault}
            title="Muat Ulang Dokumen Asli SMKN 1 Koba"
            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset SMKN 1 Koba</span>
          </button>
        </div>
      </div>
    </div>
  );
};
