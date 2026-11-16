export type Reading = {
  meterReadingId: number;
  startDate: string;
  endDate: string | null;
  usage: number;
  unitId: number;
  unit: string | null;
  cost: number | null;
};

export type UnitOption = {
  unitId: number;
  name: string;
};