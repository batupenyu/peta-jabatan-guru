import { PetaItem, SummaryStats } from '../types/petaJabatan';

export function normalizePetaItem(
  item: Partial<PetaItem> & { subject: string; number: number }
): PetaItem {
  const pns = Math.max(0, Number(item.pns) || 0);
  const pppk = Math.max(0, Number(item.pppk) || 0);
  const gtt = Math.max(0, Number(item.gtt) || 0);
  const abk = Math.max(0, Number(item.abk) || 0);
  const total = pns + pppk + gtt;
  const diff = total - abk;
  const status = diff < 0 ? 'KURANG' : diff > 0 ? 'LEBIH' : 'SESUAI';

  return {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    number: item.number,
    level: item.level || 'Guru Ahli Pertama',
    subject: item.subject.trim(),
    abk,
    pns,
    pppk,
    gtt,
    total,
    diff,
    status,
    notes: item.notes || '-',
    calculationDetails: item.calculationDetails,
  };
}

export function computeSummary(items: PetaItem[]): SummaryStats {
  let totalAbk = 0;
  let totalPns = 0;
  let totalPppk = 0;
  let totalGtt = 0;
  let totalDeficit = 0;
  let totalSurplus = 0;
  let deficitSubjectsCount = 0;
  let surplusSubjectsCount = 0;
  let balancedSubjectsCount = 0;

  for (const item of items) {
    totalAbk += item.abk;
    totalPns += item.pns;
    totalPppk += item.pppk;
    totalGtt += item.gtt;

    if (item.diff < 0) {
      totalDeficit += Math.abs(item.diff);
      deficitSubjectsCount++;
    } else if (item.diff > 0) {
      totalSurplus += item.diff;
      surplusSubjectsCount++;
    } else {
      balancedSubjectsCount++;
    }
  }

  const totalExisting = totalPns + totalPppk + totalGtt;
  const fulfillmentRate =
    totalAbk > 0 ? Math.min(100, Math.round((totalExisting / totalAbk) * 1000) / 10) : 100;
  const asnTotal = totalPns + totalPppk;
  const asnRatio =
    totalExisting > 0 ? Math.round((asnTotal / totalExisting) * 1000) / 10 : 100;

  return {
    totalAbk,
    totalPns,
    totalPppk,
    totalGtt,
    totalExisting,
    totalDeficit,
    totalSurplus,
    deficitSubjectsCount,
    surplusSubjectsCount,
    balancedSubjectsCount,
    fulfillmentRate,
    asnRatio,
  };
}

export function calculateAbkFromCurriculum(
  rombelCount: number,
  hoursPerWeek: number,
  standardHours: number = 24
) {
  const totalHours = Math.max(0, rombelCount) * Math.max(0, hoursPerWeek);
  const rawAbk = standardHours > 0 ? totalHours / standardHours : 0;
  const calculatedAbk = Math.max(1, Math.ceil(rawAbk));

  return {
    rombelCount,
    hoursPerWeek,
    standardHours,
    totalHours,
    rawAbk: Math.round(rawAbk * 100) / 100,
    calculatedAbk,
  };
}

export function generateCsv(items: PetaItem[], schoolName: string, year: string): string {
  const headers = [
    'NO',
    'JENJANG JABATAN',
    'MATA PELAJARAN',
    'JUMLAH ABK',
    'PNS',
    'PPPK',
    'GTT',
    'TOTAL GURU',
    'LEBIH / KURANG',
    'STATUS',
    'KETERANGAN',
  ];

  const rows = items.map((i) => [
    i.number,
    `"${i.level}"`,
    `"${i.subject.replace(/"/g, '""')}"`,
    i.abk,
    i.pns,
    i.pppk,
    i.gtt,
    i.total,
    i.diff,
    i.status,
    `"${(i.notes || '-').replace(/"/g, '""')}"`,
  ]);

  return [
    `# PETA JABATAN TENAGA PENDIDIK - ${schoolName} (${year})`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}

export function parseCsv(csvText: string): Partial<PetaItem>[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (lines.length < 2) return [];

  // find header line
  const headerIndex = lines.findIndex((l) => l.toUpperCase().includes('MATA PELAJARAN'));
  if (headerIndex === -1) return [];

  const dataLines = lines.slice(headerIndex + 1);
  const items: Partial<PetaItem>[] = [];

  for (let idx = 0; idx < dataLines.length; idx++) {
    const line = dataLines[idx];
    // simple CSV split regex honoring quotes
    const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    if (cols.length >= 4) {
      const clean = (val: string) => (val || '').replace(/^"|"$/g, '').trim();
      const num = parseInt(clean(cols[0]), 10) || idx + 1;
      const levelOrMapel = clean(cols[1]);
      const mapel = clean(cols[2]) || levelOrMapel;
      const abk = parseInt(clean(cols[3]), 10) || 1;
      const pns = parseInt(clean(cols[4]), 10) || 0;
      const pppk = parseInt(clean(cols[5]), 10) || 0;
      const gtt = parseInt(clean(cols[6]), 10) || 0;
      const notes = cols[10] ? clean(cols[10]) : '-';

      items.push({
        number: num,
        level: clean(cols[1]).includes('Guru') ? clean(cols[1]) : 'Guru Ahli Muda',
        subject: mapel,
        abk,
        pns,
        pppk,
        gtt,
        notes,
      });
    }
  }

  return items;
}
