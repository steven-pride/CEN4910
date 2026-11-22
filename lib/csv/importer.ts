/**
 * Asynchronous CSV Ingestion Processor.
 * Implements validation, batching, idempotency, and error manifest creation.
 */

import { parseCsv } from "./parser";
import {
  validatePropertyRow,
  validateMeterRow,
  validateReadingRow,
  RowValidationError,
  ValidatedProperty,
  ValidatedMeter,
  ValidatedReading,
} from "./validation";
import { updateImportJob } from "./jobs";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildMeterLookup,
  checkedDatabaseResult,
  countFailedRows,
  fetchAllPages,
  getMeterUpdateError,
  getMeterWriteMode,
  importRecords,
} from "./importer-utils";
import type { ImportRecord, MeterRecord } from "./importer-utils";

interface UserContext {
  userId?: string;
  role?: string;
  assignedPropertyIds?: number[];
}

/**
 * Loads all meters visible to this import, preserving duplicate names and IDs.
 */
async function loadMetersInScope(
  propertyId: number | undefined,
  userContext: UserContext
): Promise<MeterRecord[]> {
  if (
    userContext.role === "property_manager" &&
    ((propertyId !== undefined && !userContext.assignedPropertyIds?.includes(propertyId)) ||
      (propertyId === undefined && (userContext.assignedPropertyIds?.length ?? 0) === 0))
  ) {
    return [];
  }

  const supabase = createAdminClient();
  return fetchAllPages(async (from, to) => {
    let query = supabase.from("meter").select("meter_id, meter_name, property_id, default_unit");
    if (propertyId !== undefined) {
      query = query.eq("property_id", propertyId);
    } else if (userContext.role === "property_manager") {
      query = query.in("property_id", userContext.assignedPropertyIds ?? []);
    }
    const data = await checkedDatabaseResult(
      query.order("meter_id", { ascending: true }).range(from, to)
    );
    return data ?? [];
  });
}

/**
 * Loads unit lookup map (name -> unit_id).
 */
async function loadUnitMap(): Promise<Record<string, number>> {
  const map: Record<string, number> = Object.create(null);
  const supabase = createAdminClient();
  const data = await checkedDatabaseResult(
    supabase.from("unit").select("unit_id, unit_name")
  );
  if (data && Array.isArray(data)) {
    for (const u of data) {
      if (u.unit_name) {
        map[u.unit_name.toLowerCase().trim()] = u.unit_id;
      }
    }
  }
  return map;
}

/**
 * Processes Property Import
 */
async function processProperties(
  jobId: string,
  rows: Record<string, string>[]
) {
  const supabase = createAdminClient();
  const validRecords: ImportRecord<ValidatedProperty>[] = [];
  const errors: RowValidationError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const { data, errors: rowErrors } = validatePropertyRow(rows[i], rowNum);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else if (data) {
      validRecords.push({ row: rowNum, data });
    }
  }

  let importedCount = 0;
  const CHUNK_SIZE = 500;

  const validationFailedCount = countFailedRows(errors);
  for (let i = 0; i < validRecords.length; i += CHUNK_SIZE) {
    const chunk = validRecords.slice(i, i + CHUNK_SIZE);
    importedCount += await importRecords(chunk, async (item) => {
      // Try to find existing property by (property_name, address_line1, postal_code)
      const existing = await checkedDatabaseResult(
        supabase
          .from("property")
          .select("property_id")
          .eq("property_name", item.property_name)
          .eq("address_line1", item.address_line1)
          .eq("postal_code", item.postal_code)
          .maybeSingle()
      );

      if (existing && existing.property_id) {
        // Update existing
        await checkedDatabaseResult(
          supabase
            .from("property")
            .update({
              address_line2: item.address_line2,
              city: item.city,
              state_province: item.state_province,
              irrigated_area: item.irrigated_area,
              year_built: item.year_built,
              occupancy_percent: item.occupancy_percent,
              number_of_buildings: item.number_of_buildings,
            })
            .eq("property_id", existing.property_id)
        );
      } else {
        // Insert new
        await checkedDatabaseResult(supabase.from("property").insert(item));
      }
    }, errors);

    const processed = Math.min(validationFailedCount + i + chunk.length, rows.length);
    updateImportJob(jobId, {
      progress: Math.floor((processed / rows.length) * 100),
      processedRows: processed,
      importedCount,
      failedCount: countFailedRows(errors),
      errorCount: errors.length,
    });
  }

  return { importedCount, errors };
}

/**
 * Processes Meter Import
 */
async function processMeters(
  jobId: string,
  rows: Record<string, string>[],
  userContext: UserContext,
  unitMap: Record<string, number>,
  propertyId?: number
) {
  const supabase = createAdminClient();
  const meterLookup = buildMeterLookup(await loadMetersInScope(propertyId, userContext));
  const validRecords: ImportRecord<ValidatedMeter>[] = [];
  const errors: RowValidationError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const { data, errors: rowErrors } = validateMeterRow(rows[i], rowNum, unitMap, propertyId);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else if (data) {
      // Check Property Manager permissions if assignedPropertyIds is specified
      if (
        userContext.role === "property_manager" &&
        !userContext.assignedPropertyIds?.includes(data.property_id)
      ) {
        errors.push({
          row: rowNum,
          column: "property_id",
          message: `Not authorized to manage property ID ${data.property_id}.`,
        });
      } else if (data.meter_id !== undefined) {
        const updateError = getMeterUpdateError(meterLookup, data.meter_id, data.property_id);
        if (updateError) {
          errors.push({ row: rowNum, column: "meter_id", message: updateError });
        } else {
          validRecords.push({ row: rowNum, data });
        }
      } else {
        validRecords.push({ row: rowNum, data });
      }
    }
  }

  let importedCount = 0;
  const CHUNK_SIZE = 500;

  const validationFailedCount = countFailedRows(errors);
  for (let i = 0; i < validRecords.length; i += CHUNK_SIZE) {
    const chunk = validRecords.slice(i, i + CHUNK_SIZE);
    importedCount += await importRecords(chunk, async (item) => {
      if (getMeterWriteMode(item.meter_id) === "update") {
        await checkedDatabaseResult(
          supabase
            .from("meter")
            .update({
              meter_name: item.meter_name,
              meter_type: item.meter_type,
              default_unit: item.default_unit,
              active_date: item.active_date,
              inactive_date: item.inactive_date,
            })
            .eq("meter_id", item.meter_id as number)
            .eq("property_id", item.property_id)
        );
      } else {
        await checkedDatabaseResult(supabase.from("meter").insert({
          property_id: item.property_id,
          meter_name: item.meter_name,
          meter_type: item.meter_type,
          default_unit: item.default_unit,
          active_date: item.active_date,
          inactive_date: item.inactive_date,
        }));
      }
    }, errors);

    const processed = Math.min(validationFailedCount + i + chunk.length, rows.length);
    updateImportJob(jobId, {
      progress: Math.floor((processed / rows.length) * 100),
      processedRows: processed,
      importedCount,
      failedCount: countFailedRows(errors),
      errorCount: errors.length,
    });
  }

  return { importedCount, errors };
}

/**
 * Processes Meter Reading Import
 */
async function processReadings(
  jobId: string,
  rows: Record<string, string>[],
  userContext: UserContext,
  unitMap: Record<string, number>,
  propertyId?: number
) {
  const supabase = createAdminClient();
  if (
    propertyId !== undefined &&
    userContext.role === "property_manager" &&
    !userContext.assignedPropertyIds?.includes(propertyId)
  ) {
    return {
      importedCount: 0,
      errors: rows.map((_, index) => ({
        row: index + 1,
        column: "property_id",
        message: `Not authorized to access property ID ${propertyId}.`,
      })),
    };
  }

  const meterLookup = buildMeterLookup(await loadMetersInScope(propertyId, userContext));
  const validRecords: ImportRecord<ValidatedReading>[] = [];
  const errors: RowValidationError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const { data, errors: rowErrors } = validateReadingRow(rows[i], rowNum, unitMap, meterLookup);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else if (data) {
      validRecords.push({ row: rowNum, data });
    }
  }

  let importedCount = 0;
  const CHUNK_SIZE = 500;

  const validationFailedCount = countFailedRows(errors);
  for (let i = 0; i < validRecords.length; i += CHUNK_SIZE) {
    const chunk = validRecords.slice(i, i + CHUNK_SIZE);
    importedCount += await importRecords(chunk, async (item) => {
      // Natural key: (meter_id, start_date)
      const existing = await checkedDatabaseResult(
        supabase
          .from("meter_reading")
          .select("meter_reading_id")
          .eq("meter_id", item.meter_id)
          .eq("start_date", item.start_date)
          .maybeSingle()
      );

      if (existing && existing.meter_reading_id) {
        await checkedDatabaseResult(
          supabase
            .from("meter_reading")
            .update({
              end_date: item.end_date,
              usage_quantity: item.usage_quantity,
              unit: item.unit,
              cost: item.cost,
            })
            .eq("meter_reading_id", existing.meter_reading_id)
        );
      } else {
        await checkedDatabaseResult(supabase.from("meter_reading").insert(item));
      }
    }, errors);

    const processed = Math.min(validationFailedCount + i + chunk.length, rows.length);
    updateImportJob(jobId, {
      progress: Math.floor((processed / rows.length) * 100),
      processedRows: processed,
      importedCount,
      failedCount: countFailedRows(errors),
      errorCount: errors.length,
    });
  }

  return { importedCount, errors };
}

/**
 * Main Async Job Runner.
 */
export async function runImportJobAsync(
  jobId: string,
  type: "properties" | "meters" | "readings",
  csvText: string,
  userContext: UserContext = {},
  propertyId?: number
): Promise<void> {
  let totalRows = 0;
  try {
    updateImportJob(jobId, { status: "processing", progress: 5 });

    const { rows } = parseCsv(csvText);

    if (rows.length === 0) {
      updateImportJob(jobId, {
        status: "failed",
        progress: 100,
        totalRows: 0,
        processedRows: 0,
        importedCount: 0,
        failedCount: 0,
        errorCount: 1,
        errors: [{ row: 0, column: "file", message: "CSV file is empty or contains no data rows." }],
      });
      return;
    }

    updateImportJob(jobId, { totalRows: rows.length, progress: 10 });
    totalRows = rows.length;

    const unitMap = type === "properties" ? {} : await loadUnitMap();

    let result: { importedCount: number; errors: RowValidationError[] };

    if (type === "properties") {
      result = await processProperties(jobId, rows);
    } else if (type === "meters") {
      result = await processMeters(jobId, rows, userContext, unitMap, propertyId);
    } else {
      result = await processReadings(jobId, rows, userContext, unitMap, propertyId);
    }

    const finalStatus = result.importedCount > 0 ? "completed" : "failed";

    updateImportJob(jobId, {
      status: finalStatus,
      progress: 100,
      totalRows: rows.length,
      processedRows: rows.length,
      importedCount: result.importedCount,
      failedCount: countFailedRows(result.errors),
      errorCount: result.errors.length,
      errors: result.errors.slice(0, 50), // keep top 50 in memory
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected job failure";
    updateImportJob(jobId, {
      status: "failed",
      progress: 100,
      totalRows,
      processedRows: 0,
      importedCount: 0,
      failedCount: totalRows,
      errorCount: 1,
      errors: [{ row: 0, column: "general", message: msg }],
    });
  }
}
