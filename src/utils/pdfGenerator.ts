import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PetaItem, SchoolProfile } from '../types/petaJabatan';

export function exportPetaJabatanToPdf(
  school: SchoolProfile,
  items: PetaItem[]
): void {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

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

  const diffSummaryText =
    totalKurang > 0 ? `${totalKurang}` : totalLebih > 0 ? `+${totalLebih}` : '-';

  // 1. Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PETA JABATAN TENAGA PENDIDIK', 148.5, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.text(`SATUAN PENDIDIKAN : ${school.name.toUpperCase()}`, 148.5, 22, {
    align: 'center',
  });
  doc.text(`TAHUN ${school.year}`, 148.5, 27, { align: 'center' });

  // 2. Table Head & Body
  const tableRows = items.map((item) => {
    const combinedName = `${item.level} - ${item.subject}`;
    const diffText =
      item.diff < 0
        ? `${Math.abs(item.diff)}`
        : item.diff > 0
        ? `+${item.diff}`
        : '-';

    return [
      item.number.toString(),
      combinedName,
      item.abk.toString(),
      item.pns > 0 ? item.pns.toString() : '-',
      item.pppk > 0 ? item.pppk.toString() : '-',
      item.gtt > 0 ? item.gtt.toString() : '-',
      item.total > 0 ? item.total.toString() : '-',
      diffText,
      item.notes || '-',
    ];
  });

  // Footer Row
  const footerRow = [
    { content: 'JUMLAH', colSpan: 2, styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: totalAbk.toString(), styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: totalPns.toString(), styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: totalPppk.toString(), styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: totalGtt > 0 ? totalGtt.toString() : '-', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: totalGuru.toString(), styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: diffSummaryText, styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
    { content: '-', styles: { halign: 'center' as const } },
  ];

  autoTable(doc, {
    startY: 32,
    head: [
      [
        { content: 'NO.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'MATA PELAJARAN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'JUMLAH\nABK', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'JUMLAH GURU', colSpan: 4, styles: { halign: 'center' } },
        { content: 'LEBIH /\nKURANG', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'KETERANGAN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      ],
      [
        { content: 'PNS', styles: { halign: 'center' } },
        { content: 'PPPK', styles: { halign: 'center' } },
        { content: 'GTT', styles: { halign: 'center' } },
        { content: 'TOTAL', styles: { halign: 'center' } },
      ],
    ],
    body: tableRows,
    foot: [footerRow as any],
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.35,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 110 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
    pageBreak: 'auto',
  });

  // 3. Signatures Section at bottom
  const finalY = (doc as any).lastAutoTable?.finalY || 140;
  const signatureStartY = finalY + 10 > 175 ? 175 : finalY + 10;

  // Check if we need another page for signatures
  if (signatureStartY > 175) {
    doc.addPage();
    drawSignatures(doc, school, 25);
  } else {
    drawSignatures(doc, school, signatureStartY);
  }

  // Save the PDF
  const sanitizedName = school.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Peta_Jabatan_${sanitizedName}_${school.year}.pdf`);
}

function drawSignatures(doc: jsPDF, school: SchoolProfile, startY: number): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Left: Mengetahui Kepala Sekolah
  doc.text('Mengetahui', 30, startY);
  doc.text('Kepala Sekolah', 30, startY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(school.headmasterName, 30, startY + 26);
  // Underline
  const nameWidth = doc.getTextWidth(school.headmasterName);
  doc.line(30, startY + 27, 30 + nameWidth, startY + 27);

  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${school.headmasterNip}`, 30, startY + 31);

  // Right: Wakasek / Maker
  const rightX = 200;
  doc.text(`${school.location}, ${school.date}`, rightX, startY);
  doc.text('Dibuat Oleh,', rightX, startY + 5);
  doc.text(school.makerTitle, rightX, startY + 9);

  doc.setFont('helvetica', 'bold');
  doc.text(school.makerName, rightX, startY + 26);
  // Underline
  const makerWidth = doc.getTextWidth(school.makerName);
  doc.line(rightX, startY + 27, rightX + makerWidth, startY + 27);

  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${school.makerNip}`, rightX, startY + 31);
}

// Print via hidden iframe to reliably escape modal/iframe restrictions
export function printViaIsolatedIframe(printableElementId: string): void {
  const element = document.getElementById(printableElementId);
  if (!element) {
    window.print();
    return;
  }

  const existingFrame = document.getElementById('isolated-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'isolated-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '297mm';
  iframe.style.height = '210mm';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Peta Jabatan</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
          h1, h2, h3 {
            text-align: center;
            margin: 2px 0;
            text-transform: uppercase;
          }
          h1 { font-size: 14px; font-weight: bold; }
          h2 { font-size: 12px; font-weight: bold; }
          h3 { font-size: 12px; font-weight: bold; margin-bottom: 12px; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 6px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px 5px;
            vertical-align: middle;
          }
          th {
            font-weight: bold;
            text-align: center;
          }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .font-bold { font-weight: bold; }
          .signatures {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
            page-break-inside: avoid;
          }
          .sig-box {
            width: 45%;
          }
          .sig-space {
            height: 55px;
          }
          .underline {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print error, fallback to window.print', e);
      window.print();
    }
  }, 350);
}
