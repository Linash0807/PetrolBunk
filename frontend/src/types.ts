export interface NozzleReading {
  nozzleId: string;
  nozzleName: string;
  omr: number;
  cmr: number;
  testing: number;
  writtenNet: number;
}

export interface ExpenseItem {
  name: string;
  amount: number;
}

export interface ShiftEntry {
  _id?: string;
  bunk: string;
  date: string;
  shift: string;
  pump?: string;
  employee: string;
  speed: number;
  ms: number;
  hsd: number;
  cash: number;
  lubricant:number;
  phonePe: number;
  fleetCard: number;
  expense: number;
  expenseItems?: ExpenseItem[];
  nozzleReadings?: NozzleReading[];
}

export interface DailyEntry {
  _id?: string;
  date: string;
  speed: number;
  ms: number;
  hsd: number;
  cash: number;
  lubricant?: number;
  phonePe: number;
  fleetCard: number;
  expense: number;
  expenseItems?: ExpenseItem[];
  nozzleReadings: NozzleReading[];
}
