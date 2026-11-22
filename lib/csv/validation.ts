/**
 * Schema Validation for Property, Meter, and Meter Reading CSV rows.
 * Basic, junior-level validation checks.
 */

import type { MeterLookup, MeterRecord } from "./importer-utils";

export interface RowValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ValidatedProperty {
  property_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  irrigated_area: number | null;
  year_built: number;
  occupancy_percent: number;
  number_of_buildings: number;
}

export interface ValidatedMeter {
  meter_id?: number;
  property_id: number;
  meter_name: string;
  meter_type: string | null;
  default_unit: number;
  active_date: string;
  inactive_date: string | null;
}

export interface ValidatedReading {
  meter_id: number;
  start_date: string;
  end_date: string | null;
  usage_quantity: number;
  unit: number;
  cost: number | null;
}

function parseDate(dateStr: string): string | null {
  let year: number;
  let month: number;
  let day: number;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(dateStr);
    if (!slashMatch) return null;

    month = Number(slashMatch[1]);
    day = Number(slashMatch[2]);
    year = Number(slashMatch[3]);
    if (slashMatch[3].length === 2) {
      year += year <= 29 ? 2000 : 1900;
    }
  }

  if (year < 1 || month < 1 || month > 12) return null;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function findUnitId(unitMap: Record<string, number>, unitName: string): number | undefined {
  const normalized = unitName.toLowerCase().trim();
  if (!Object.hasOwn(unitMap, normalized)) return undefined;

  const unitId = unitMap[normalized];
  return typeof unitId === "number" ? unitId : undefined;
}

/**
 * Validates a single Property CSV row.
 */
export function validatePropertyRow(
  raw: Record<string, string>,
  rowIndex: number
): { data?: ValidatedProperty; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];

  const property_name = (raw.property_name || "").trim();
  if (!property_name) {
    errors.push({ row: rowIndex, column: "property_name", message: "Property name is required." });
  }

  const address_line1 = (raw.address_line1 || "").trim();
  if (!address_line1) {
    errors.push({ row: rowIndex, column: "address_line1", message: "Address line 1 is required." });
  }

  const address_line2 = (raw.address_line2 || "").trim() || null;

  const city = (raw.city || "").trim();
  if (!city) {
    errors.push({ row: rowIndex, column: "city", message: "City is required." });
  }

  const state_province = (raw.state_province || "").trim();
  if (!state_province) {
    errors.push({ row: rowIndex, column: "state_province", message: "State/Province is required." });
  }

  const postal_code = (raw.postal_code || "").trim();
  if (!postal_code) {
    errors.push({ row: rowIndex, column: "postal_code", message: "Postal code is required." });
  }

  let irrigated_area: number | null = null;
  if (raw.irrigated_area && raw.irrigated_area.trim() !== "") {
    const val = Number(raw.irrigated_area);
    if (isNaN(val) || val < 0) {
      errors.push({ row: rowIndex, column: "irrigated_area", message: "Irrigated area must be a non-negative number." });
    } else {
      irrigated_area = val;
    }
  }

  const yearBuiltStr = (raw.year_built || "").trim();
  const year_built = Number(yearBuiltStr);
  if (!yearBuiltStr || isNaN(year_built) || year_built < 1600 || year_built > 2200) {
    errors.push({ row: rowIndex, column: "year_built", message: "Year built must be an integer between 1600 and 2200." });
  }

  const occupancyStr = (raw.occupancy_percent || "").trim();
  const occupancy_percent = Number(occupancyStr);
  if (!occupancyStr || isNaN(occupancy_percent) || occupancy_percent < 0 || occupancy_percent > 100) {
    errors.push({ row: rowIndex, column: "occupancy_percent", message: "Occupancy percent must be between 0 and 100." });
  }

  const numBuildingsStr = (raw.number_of_buildings || "").trim();
  const number_of_buildings = Number(numBuildingsStr);
  if (!numBuildingsStr || isNaN(number_of_buildings) || number_of_buildings < 0) {
    errors.push({ row: rowIndex, column: "number_of_buildings", message: "Number of buildings must be a non-negative integer." });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      property_name,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      irrigated_area,
      year_built,
      occupancy_percent,
      number_of_buildings,
    },
    errors: [],
  };
}

/**
 * Validates a single Meter CSV row.
 */
export function validateMeterRow(
  raw: Record<string, string>,
  rowIndex: number,
  unitMap: Record<string, number> = {},
  contextPropertyId?: number
): { data?: ValidatedMeter; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];

  let property_id = contextPropertyId;
  if (!property_id || isNaN(property_id) || property_id <= 0) {
    const propertyIdStr = (raw.property_id || "").trim();
    if (propertyIdStr) {
      property_id = Number(propertyIdStr);
    }
  }

  if (!property_id || isNaN(property_id) || property_id <= 0) {
    errors.push({ row: rowIndex, column: "property_id", message: "Valid Property ID is required." });
  }

  const meter_name = (raw.meter_name || "").trim();
  if (!meter_name) {
    errors.push({ row: rowIndex, column: "meter_name", message: "Meter name is required." });
  }

  const meter_type = (raw.meter_type || "").trim() || null;

  let meter_id: number | undefined;
  const meterIdStr = (raw.meter_id || "").trim();
  if (meterIdStr) {
    const parsedMeterId = Number(meterIdStr);
    if (!Number.isSafeInteger(parsedMeterId) || parsedMeterId <= 0) {
      errors.push({ row: rowIndex, column: "meter_id", message: "Meter ID must be a positive integer." });
    } else {
      meter_id = parsedMeterId;
    }
  }

  const unitStr = (raw.default_unit || raw.unit || "").trim();
  let default_unit = 0;
  if (!unitStr) {
    errors.push({ row: rowIndex, column: "default_unit", message: "Default unit is required." });
  } else {
    const lower = unitStr.toLowerCase();
    const unitId = findUnitId(unitMap, lower);
    if (unitId !== undefined) {
      default_unit = unitId;
    } else {
      errors.push({
        row: rowIndex,
        column: "default_unit",
        message: `Unit '${unitStr}' not found in unit table.`,
      });
    }
  }

  const active_date = parseDate((raw.active_date || "").trim());
  if (!active_date) {
    errors.push({
      row: rowIndex,
      column: "active_date",
      message: "Active date must be a valid YYYY-MM-DD or month-first M/D/YYYY or M/D/YY date.",
    });
  }

  let inactive_date: string | null = null;
  if (raw.inactive_date && raw.inactive_date.trim() !== "") {
    const val = parseDate(raw.inactive_date.trim());
    if (!val) {
      errors.push({
        row: rowIndex,
        column: "inactive_date",
        message: "Inactive date must be a valid YYYY-MM-DD or month-first M/D/YYYY or M/D/YY date.",
      });
    } else if (active_date && val < active_date) {
      errors.push({ row: rowIndex, column: "inactive_date", message: "Inactive date cannot be earlier than active date." });
    } else {
      inactive_date = val;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const data: ValidatedMeter = {
    property_id: property_id as number,
    meter_name,
    meter_type,
    default_unit,
    active_date: active_date as string,
    inactive_date,
  };
  if (meter_id !== undefined) data.meter_id = meter_id;

  return {
    data,
    errors: [],
  };
}

/**
 * Validates a single Meter Reading CSV row.
 */
export function validateReadingRow(
  raw: Record<string, string>,
  rowIndex: number,
  unitMap: Record<string, number> = {},
  meterLookup: MeterLookup = { byId: new Map(), byName: new Map() }
): { data?: ValidatedReading; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];

  let meter_id = 0;
  let resolvedMeter: MeterRecord | undefined;
  const meterNameStr = (raw.meter_name || raw.meter || "").trim();
  const meterIdStr = (raw.meter_id || "").trim();

  if (meterIdStr) {
    const id = Number(meterIdStr);
    if (!Number.isSafeInteger(id) || id <= 0) {
      errors.push({ row: rowIndex, column: "meter_id", message: "Meter ID must be a positive integer." });
    } else {
      const meter = meterLookup.byId.get(id);
      if (!meter) {
        errors.push({
          row: rowIndex,
          column: "meter_id",
          message: `Meter ID ${id} was not found or is outside the authorized property scope.`,
        });
      } else if (meterNameStr && meter.meter_name.toLowerCase().trim() !== meterNameStr.toLowerCase()) {
        errors.push({
          row: rowIndex,
          column: "meter_name",
          message: `Meter name '${meterNameStr}' does not match meter ID ${id}.`,
        });
      } else {
        meter_id = id;
        resolvedMeter = meter;
      }
    }
  } else if (meterNameStr) {
    const matchingIds = meterLookup.byName.get(meterNameStr.toLowerCase()) ?? [];
    if (matchingIds.length === 1) {
      meter_id = matchingIds[0];
      resolvedMeter = meterLookup.byId.get(meter_id);
    } else if (matchingIds.length > 1) {
      errors.push({
        row: rowIndex,
        column: "meter_name",
        message: `Meter name '${meterNameStr}' matches multiple meters. Provide meter_id to select the correct meter.`,
      });
    } else {
      errors.push({
        row: rowIndex,
        column: "meter_name",
        message: `Meter '${meterNameStr}' not found for this property.`,
      });
    }
  } else {
    errors.push({
      row: rowIndex,
      column: "meter_name",
      message: "meter_name or meter_id is required.",
    });
  }

  const start_date = parseDate((raw.start_date || "").trim());
  if (!start_date) {
    errors.push({
      row: rowIndex,
      column: "start_date",
      message: "Start date must be a valid YYYY-MM-DD or month-first M/D/YYYY or M/D/YY date.",
    });
  }

  let end_date: string | null = null;
  if (raw.end_date && raw.end_date.trim() !== "") {
    const val = parseDate(raw.end_date.trim());
    if (!val) {
      errors.push({
        row: rowIndex,
        column: "end_date",
        message: "End date must be a valid YYYY-MM-DD or month-first M/D/YYYY or M/D/YY date.",
      });
    } else if (start_date && val < start_date) {
      errors.push({ row: rowIndex, column: "end_date", message: "end_date cannot precede start_date." });
    } else {
      end_date = val;
    }
  }

  const usageStr = (raw.usage_quantity || "").trim();
  const usage_quantity = Number(usageStr);
  if (!usageStr || isNaN(usage_quantity) || usage_quantity < 0) {
    errors.push({ row: rowIndex, column: "usage_quantity", message: "Expected non-negative number for usage_quantity." });
  }

  const unitStr = (raw.unit || "").trim();
  let unit = 0;
  const meterDefaultUnit = resolvedMeter?.default_unit;
  if (unitStr) {
    const lower = unitStr.toLowerCase();
    const unitId = findUnitId(unitMap, lower);
    if (unitId !== undefined) {
      unit = unitId;
    } else {
      errors.push({
        row: rowIndex,
        column: "unit",
        message: `Unit '${unitStr}' not found in unit table.`,
      });
    }
  } else if (typeof meterDefaultUnit === "number" && Number.isSafeInteger(meterDefaultUnit) && meterDefaultUnit > 0) {
    unit = meterDefaultUnit;
  } else {
    errors.push({
      row: rowIndex,
      column: "unit",
      message: resolvedMeter
        ? "Meter default unit is unavailable; provide a unit."
        : "Meter could not be resolved, so its default unit cannot be used.",
    });
  }

  let cost: number | null = null;
  if (raw.cost && raw.cost.trim() !== "") {
    const val = Number(raw.cost);
    if (isNaN(val) || val < 0) {
      errors.push({ row: rowIndex, column: "cost", message: "Cost must be a non-negative number." });
    } else {
      cost = val;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      meter_id,
      start_date: start_date as string,
      end_date,
      usage_quantity,
      unit,
      cost,
    },
    errors: [],
  };
}
