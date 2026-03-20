export interface NozzleReading {
  nozzleId: string;
  nozzleName: string;
  omr: number;
  cmr: number;
  testing: number;
  writtenNet: number;
}

export interface ShiftEntry {
  bunk: string;
  date: string;
  shift: string;
  pump?: string;
  employee: string;
  speed: number;
  ms: number;
  hsd: number;
  cash: number;
  phonePe: number;
  fleetCard: number;
  expense: number;
  nozzleReadings?: NozzleReading[];
}
