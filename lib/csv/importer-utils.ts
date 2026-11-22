import type { RowValidationError } from "./validation";

export interface ImportRecord<T> {
  row: number;
  data: T;
}

export interface MeterRecord {
  meter_id: number;
  property_id: number;
  meter_name: string;
  default_unit?: number | null;
}

export interface MeterLookup {
  byId: Map<number, MeterRecord>;
  byName: Map<string, number[]>;
}

interface DatabaseResult<T> {
  data: T;
  error: { message?: string } | null;
}

export async function checkedDatabaseResult<T>(
  result: PromiseLike<DatabaseResult<T>>
): Promise<T> {
  const { data, error } = await result;
  if (error) {
    const message = error.message?.trim() || "Database operation failed.";
    throw new Error(message);
  }
  return data;
}

export function buildMeterLookup(meters: MeterRecord[]): MeterLookup {
  const byId = new Map<number, MeterRecord>();
  const byName = new Map<string, number[]>();

  for (const meter of meters) {
    byId.set(meter.meter_id, meter);
    const normalizedName = meter.meter_name.toLowerCase().trim();
    const meterIds = byName.get(normalizedName) ?? [];
    meterIds.push(meter.meter_id);
    byName.set(normalizedName, meterIds);
  }

  return { byId, byName };
}

export function getMeterWriteMode(meterId?: number | null): "insert" | "update" {
  return meterId === undefined || meterId === null ? "insert" : "update";
}

export function getMeterUpdateError(
  meterLookup: MeterLookup,
  meterId: number,
  propertyId: number
): string | null {
  const meter = meterLookup.byId.get(meterId);
  if (!meter) {
    return `Meter ID ${meterId} was not found or is outside the authorized scope.`;
  }
  if (meter.property_id !== propertyId) {
    return `Meter ID ${meterId} belongs to property ${meter.property_id}, not property ${propertyId}.`;
  }
  return null;
}

export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  pageSize = 1000
): Promise<T[]> {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
    throw new Error("Page size must be a positive integer.");
  }

  const records: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);
    records.push(...page);
    if (page.length < pageSize) return records;
  }
}

export function countFailedRows(errors: RowValidationError[]): number {
  return new Set(errors.filter((error) => error.row > 0).map((error) => error.row)).size;
}

export async function importRecords<T>(
  records: ImportRecord<T>[],
  persist: (data: T) => Promise<void>,
  errors: RowValidationError[]
): Promise<number> {
  let importedCount = 0;

  for (const record of records) {
    try {
      await persist(record.data);
      importedCount++;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Database write error";
      errors.push({ row: record.row, column: "database", message });
    }
  }

  return importedCount;
}
