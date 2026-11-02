import React, { useState } from 'react';
import { PetaItem, SchoolProfile } from '../types/petaJabatan';
import { exportPetaJabatanToPdf, printViaIsolatedIframe } from '../utils/pdfGenerator';
import { Printer, X, Download, FileCheck, CheckCircle2 } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  items: PetaItem[];
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  school,
  items,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalAbk = items.reduce((acc, i) => acc + i.abk, 0);
  const totalPns = items.reduce((acc, i) => acc + i.pns, 0);
  const totalPppk = items.reduce((acc, i) => acc + i.pppk, 0);
  const totalGtt = items.reduce((acc, i) => acc + i.gtt, 0);
  const totalGuru = totalPns + totalPppk + totalGtt;
  const totalKurang = items
    .filter((i) => i.diff < 0)
    .reduce((acc, i) => acc + Math.abs(i.diff), 0);
  const totalLebih = items
    .filter((i) => i.diff > 0)
    .reduce((acc, i) => acc + i.diff, 0);

  // 1. Direct PDF file generation and download via jsPDF & autoTable
  const handleDownloadPdf = () => {
    try {
      setIsExportingPdf(true);
      exportPetaJabatanToPdf(school, items);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kendala saat membuat file PDF. Mencoba mencetak...');
      handlePrintDialog();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Browser print dialog via isolated iframe (safe for sandboxed iframes)
  const handlePrintDialog = () => {
    try {
      printViaIsolatedIframe('printable-peta-document');
    } catch (e) {
      console.warn('Isolated iframe print failed, trying window.print', e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Pratinjau Dokumen Cetak Peta Jabatan
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              (Standar A4 Landscape BKN / Kemdikbud)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Action: Direct PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="Unduh langsung sebagai berkas file PDF ke perangkat Anda"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>PDF Terunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Membuat PDF...' : 'Unduh Berkas PDF'}</span>
                </>
              )}
            </button>

            {/* Secondary Action: Native Print Dialog */}
            <button
              onClick={handlePrintDialog}
              title="Buka dialog cetak peramban (Printer / Save as PDF)"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Sheet (Matches PDF 1:1) */}
        <div className="p-6 sm:p-10 bg-white text-black font-sans text-xs overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:m-0 flex-1">
          <div id="printable-peta-document">
            {/* Document Header */}
            <div className="text-center mb-6 space-y-1">
              <h1 className="font-bold text-sm sm:text-base tracking-wide uppercase">
                PETA JABATAN TENAGA PENDIDIK
              </h1>
              <h2 className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                SATUAN PENDIDIKAN : {school.name}
              </h2>
              <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase">
                TAHUN {school.year}
              </h3>
            </div>

            {/* Official Document Table */}
            <table className="w-full border-collapse border border-black text-[11px] leading-tight">
              <thead>
                <tr className="border border-black text-center font-bold">
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 w-10 align-middle text-center"
                  >
                    NO.
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 text-center align-middle"
                  >
                    MATA PELAJARAN
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 w-16 align-middle text-center"
                  >
                    JUMLAH<br />ABK
                  </th>
                  <th colSpan={4} className="border border-black p-1 text-center">
                    JUMLAH GURU
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 w-20 align-middle text-center"
                  >
                    LEBIH /<br />KURANG
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black p-1.5 min-w-[120px] align-middle text-center"
                  >
                    KETERANGAN
                  </th>
                </tr>
                <tr className="border border-black text-center font-bold">
                  <th className="border border-black p-1 w-12 text-center">PNS</th>
                  <th className="border border-black p-1 w-12 text-center">PPPK</th>
                  <th className="border border-black p-1 w-12 text-center">GTT</th>
                  <th className="border border-black p-1 w-14 text-center">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const combinedName = `${item.level} - ${item.subject}`;
                  const diffDisplay =
                    item.diff < 0
                      ? Math.abs(item.diff)
                      : item.diff > 0
                      ? `+${item.diff}`
                      : '-';

                  return (
                    <tr key={item.id} className="border border-black">
                      <td className="border border-black p-1 text-center font-mono">
                        {item.number}
                      </td>
                      <td className="border border-black p-1.5 font-medium">
                        {combinedName}
                      </td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.abk}
                      </td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.pns > 0 ? item.pns : '-'}
                      </td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.pppk > 0 ? item.pppk : '-'}
                      </td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.gtt > 0 ? item.gtt : '-'}
                      </td>
                      <td className="border border-black p-1 text-center font-mono font-bold">
                        {item.total > 0 ? item.total : '-'}
                      </td>
                      <td className="border border-black p-1 text-center font-mono font-bold">
                        {diffDisplay}
                      </td>
                      <td className="border border-black p-1.5 text-slate-700">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary Totals Row */}
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan={2} className="border border-black p-1.5 text-center">
                    JUMLAH
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalAbk}
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalPns}
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalPppk}
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalGtt > 0 ? totalGtt : '-'}
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalGuru}
                  </td>
                  <td className="border border-black p-1 text-center font-mono">
                    {totalKurang > 0
                      ? totalKurang
                      : totalLebih > 0
                      ? `+${totalLebih}`
                      : '-'}
                  </td>
                  <td className="border border-black p-1.5 text-center">-</td>
                </tr>
              </tfoot>
            </table>

            {/* Official Signatures Section */}
            <div className="signatures mt-8 grid grid-cols-2 gap-8 text-[11px] leading-snug">
              {/* Left: Mengetahui Kepala Sekolah */}
              <div className="sig-box">
                <p className="font-normal">Mengetahui</p>
                <p className="font-normal">Kepala Sekolah</p>
                <div className="sig-space h-20" />
                <p className="font-bold underline">{school.headmasterName}</p>
                <p className="font-mono">NIP. {school.headmasterNip}</p>
              </div>

              {/* Right: Tanggal & Dibuat Oleh Wakasek */}
              <div className="sig-box text-left pl-12 sm:pl-24">
                <p className="font-normal">
                  {school.location}, {school.date}
                </p>
                <p className="font-normal">Dibuat Oleh,</p>
                <p className="font-normal">{school.makerTitle}</p>
                <div className="sig-space h-16" />
                <p className="font-bold underline">{school.makerName}</p>
                <p className="font-mono">NIP. {school.makerNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
