export type FunctionalLevel =
  | 'Guru Ahli Utama'
  | 'Guru Ahli Madya'
  | 'Guru Ahli Muda'
  | 'Guru Ahli Pertama';

export type JobStatus = 'KURANG' | 'LEBIH' | 'SESUAI';

export type EmployeeStatus = 'PNS' | 'PPPK' | 'GTT';

export interface CalculationDetails {
  rombelCount: number;
  hoursPerWeek: number;
  standardHours: number; // Standar kewajiban guru, misal 24 jam/minggu
  totalWeeklyHours: number;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  status: EmployeeStatus;
  functionalTitle: FunctionalLevel | string;
  subject: string;
  schoolId: string;
  isHeadmaster?: boolean;
  notes?: string;
}

export interface PetaItem {
  id: string;
  number: number;
  level: FunctionalLevel | string;
  subject: string;
  abk: number;
  pns: number;
  pppk: number;
  gtt: number;
  total: number;
  diff: number; // total - abk
  status: JobStatus;
  notes: string;
  calculationDetails?: CalculationDetails;
  assignedTeachers?: Teacher[];
}

export interface SchoolProfile {
  id: string;
  name: string;
  level: 'SMK' | 'SMA' | 'SMP' | 'SD';
  year: string;
  location: string;
  date: string;
  headmasterName: string;
  headmasterNip: string;
  makerTitle: string;
  makerName: string;
  makerNip: string;
  npsn?: string;
  subdistrict?: string;
}

export interface SummaryStats {
  totalAbk: number;
  totalPns: number;
  totalPppk: number;
  totalGtt: number;
  totalExisting: number;
  totalDeficit: number; // total guru kurang
  totalSurplus: number; // total guru lebih
  deficitSubjectsCount: number;
  surplusSubjectsCount: number;
  balancedSubjectsCount: number;
  fulfillmentRate: number; // %
  asnRatio: number; // % PNS+PPPK terhadap total
}
