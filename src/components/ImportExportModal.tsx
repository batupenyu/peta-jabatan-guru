import React, { useRef, useState } from 'react';
import { PetaItem, SchoolProfile } from '../types/petaJabatan';
import { generateCsv, parseCsv, normalizePetaItem } from '../utils/calculator';
import { Download, Upload, FileText, Check, AlertCircle, X } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  items: PetaItem[];
  onImportItems: (imported: PetaItem[], school?: SchoolProfile) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  school,
  items,
  onImportItems,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = generateCsv(items, school.name, school.year);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Peta_Jabatan_${school.name.replace(/\s+/g, '_')}_${school.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const exportData = {
      version: '1.0',
      school,
      items,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cadangan_Peta_Jabatan_${school.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload (CSV or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed.items && Array.isArray(parsed.items)) {
            const normalized = parsed.items.map((i: any, idx: number) =>
              normalizePetaItem({ ...i, number: i.number || idx + 1 })
            );
            onImportItems(normalized, parsed.school);
            setImportStatus(`Berhasil mengimpor ${normalized.length} baris formasi dari berkas JSON.`);
            setTimeout(() => {
              onClose();
            }, 1200);
          } else {
            setImportStatus('Format berkas JSON tidak sesuai struktur Peta Jabatan.');
          }
        } else {
          // Assume CSV
          const rawItems = parseCsv(text);
          if (rawItems.length > 0) {
            const normalized = rawItems.map((i, idx) =>
              normalizePetaItem({ ...i, number: idx + 1, subject: i.subject || `Mapel ${idx + 1}` })
            );
            onImportItems(normalized);
            setImportStatus(`Berhasil mengimpor ${normalized.length} baris formasi dari berkas CSV.`);
            setTimeout(() => {
              onClose();
            }, 1200);
          } else {
            setImportStatus('Tidak dapat membaca data formasi dari berkas CSV. Pastikan kolom sesuai.');
          }
        }
      } catch (err: any) {
        setImportStatus(`Gagal membaca berkas: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Ekspor & Impor Data Peta Jabatan
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Export Options */}
          <div>
            <span className="font-semibold text-slate-800 block mb-2">
              Unduh / Ekspor Data
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCsv}
                className="p-3 border border-slate-200 rounded-lg text-left hover:border-slate-400 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Format Excel/CSV</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Kompatibel dengan Microsoft Excel dan Google Sheets.
                </p>
              </button>

              <button
                onClick={handleExportJson}
                className="p-3 border border-slate-200 rounded-lg text-left hover:border-slate-400 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">Cadangan JSON</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Salinan lengkap profil sekolah dan seluruh formasi.
                </p>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-800 block mb-2">
              Unggah / Impor Berkas
            </span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg text-center hover:bg-indigo-50/20 transition-colors flex flex-col items-center justify-center gap-1.5"
            >
              <Upload className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-slate-800">
                Pilih Berkas CSV atau JSON
              </span>
              <span className="text-[11px] text-slate-400">
                Data akan langsung diperbarui ke dalam editor
              </span>
            </button>
          </div>

          {/* Status message */}
          {importStatus && (
            <div className="p-3 bg-slate-100 rounded-md text-xs text-slate-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
