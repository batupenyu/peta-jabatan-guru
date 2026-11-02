import { Teacher, PetaItem } from '../types/petaJabatan';

export interface NipParsedInfo {
  birthDateFormatted: string;
  birthYear: number;
  gender: 'Laki-laki' | 'Perempuan' | 'Tidak diketahui';
  appointmentYear: number | null;
  age: number;
  retirementYear: number;
  yearsToRetirement: number;
  retirementUrgency: 'CRITICAL_1_2_YEARS' | 'WARNING_3_5_YEARS' | 'PRODUCTIVE';
}

export function parseNip(nip: string, referenceYear: number = 2026): NipParsedInfo {
  const clean = nip.replace(/\D/g, '');
  if (clean.length < 8) {
    return {
      birthDateFormatted: '-',
      birthYear: 1990,
      gender: 'Tidak diketahui',
      appointmentYear: null,
      age: 36,
      retirementYear: 2050,
      yearsToRetirement: 24,
      retirementUrgency: 'PRODUCTIVE',
    };
  }

  const yyyy = parseInt(clean.substring(0, 4), 10);
  const mm = parseInt(clean.substring(4, 6), 10);
  const dd = parseInt(clean.substring(6, 8), 10);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const birthDateFormatted = `${dd} ${monthNames[mm - 1] || mm} ${yyyy}`;

  let gender: 'Laki-laki' | 'Perempuan' | 'Tidak diketahui' = 'Tidak diketahui';
  if (clean.length >= 15) {
    const genderDigit = clean.charAt(14);
    if (genderDigit === '1') gender = 'Laki-laki';
    else if (genderDigit === '2') gender = 'Perempuan';
  }

  let appointmentYear: number | null = null;
  if (clean.length >= 12) {
    const appY = parseInt(clean.substring(8, 12), 10);
    if (appY >= 1970 && appY <= referenceYear) {
      appointmentYear = appY;
    }
  }

  const age = referenceYear - yyyy;
  const retirementYear = yyyy + 60; // Batas Usia Pensiun (BUP) Guru = 60 tahun
  const yearsToRetirement = retirementYear - referenceYear;

  let retirementUrgency: 'CRITICAL_1_2_YEARS' | 'WARNING_3_5_YEARS' | 'PRODUCTIVE' = 'PRODUCTIVE';
  if (yearsToRetirement <= 2) {
    retirementUrgency = 'CRITICAL_1_2_YEARS';
  } else if (yearsToRetirement <= 5) {
    retirementUrgency = 'WARNING_3_5_YEARS';
  }

  return {
    birthDateFormatted,
    birthYear: yyyy,
    gender,
    appointmentYear,
    age,
    retirementYear,
    yearsToRetirement,
    retirementUrgency,
  };
}

// Clean normalize mapel string for fuzzy matching
export function normalizeSubjectMatch(sub: string): string {
  return sub
    .toLowerCase()
    .replace(/^guru\s+/i, '')
    .replace(/kepala sekolah\s*\(/i, '')
    .replace(/\)/g, '')
    .replace(/\bdan\b/g, '&')
    .replace(/tik/g, 'informatika')
    .replace(/dan telekomunikasi/g, '')
    .replace(/dan fabrikasi logam/g, '')
    .replace(/bimbingan konseling/g, 'bk')
    .trim();
}

export function matchTeacherToPetaItem(teacher: Teacher, item: PetaItem): boolean {
  // 1. Level match
  const tLevel = teacher.functionalTitle.toLowerCase().trim();
  const iLevel = item.level.toLowerCase().trim();
  if (tLevel !== iLevel) return false;

  // 2. Subject match
  const tSub = normalizeSubjectMatch(teacher.subject);
  const iSub = normalizeSubjectMatch(item.subject);

  if (tSub === iSub) return true;
  if (tSub.includes(iSub) || iSub.includes(tSub)) return true;

  // Special cases
  if (
    (tSub.includes('otomotif') && iSub.includes('otomotif')) ||
    (tSub.includes('listrik') || tSub.includes('ketenagalistrikan')) && (iSub.includes('listrik') || iSub.includes('ketenagalistrikan')) ||
    (tSub.includes('jaringan') || tSub.includes('komputer')) && (iSub.includes('jaringan') || iSub.includes('komputer')) ||
    (tSub.includes('pengelasan') && iSub.includes('pengelasan')) ||
    (tSub.includes('bk') || tSub.includes('konseling')) && (iSub.includes('bk') || iSub.includes('konseling')) ||
    (tSub.includes('ppkn') && iSub.includes('ppkn')) ||
    (tSub.includes('inggris') && iSub.includes('inggris')) ||
    (tSub.includes('indonesia') && iSub.includes('indonesia')) ||
    (tSub.includes('matematika') && iSub.includes('matematika')) ||
    (tSub.includes('agama') && iSub.includes('agama')) ||
    (tSub.includes('penjas') && iSub.includes('penjas')) ||
    (tSub.includes('seni') && iSub.includes('seni')) ||
    (tSub.includes('sejarah') && iSub.includes('sejarah')) ||
    (tSub.includes('ipas') && iSub.includes('ipas')) ||
    (tSub.includes('tik') || tSub.includes('informatika')) && (iSub.includes('tik') || iSub.includes('informatika'))
  ) {
    return true;
  }

  return false;
}

export function syncPetaJabatanWithTeachers(items: PetaItem[], teachers: Teacher[]): PetaItem[] {
  return items.map((item) => {
    // Find all teachers matching this level and subject
    const matched = teachers.filter((t) => matchTeacherToPetaItem(t, item));

    const pnsCount = matched.filter((t) => t.status === 'PNS').length;
    const pppkCount = matched.filter((t) => t.status === 'PPPK').length;
    const gttCount = matched.filter((t) => t.status === 'GTT').length;

    // Use synchronized count if matched teachers exist, or retain manual entry
    const finalPns = matched.length > 0 ? pnsCount : item.pns;
    const finalPppk = matched.length > 0 ? pppkCount : item.pppk;
    const finalGtt = matched.length > 0 ? gttCount : item.gtt;
    const total = finalPns + finalPppk + finalGtt;
    const diff = total - item.abk;
    const status = diff < 0 ? 'KURANG' : diff > 0 ? 'LEBIH' : 'SESUAI';

    return {
      ...item,
      pns: finalPns,
      pppk: finalPppk,
      gtt: finalGtt,
      total,
      diff,
      status,
      assignedTeachers: matched,
    };
  });
}
