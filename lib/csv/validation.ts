/**
 * Schema Validation for Property, Meter, and Meter Reading CSV rows.
 * Basic, junior-level validation checks.
 */

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

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
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

  const unitStr = (raw.default_unit || raw.unit || "").trim();
  let default_unit = 0;
  if (!unitStr) {
    errors.push({ row: rowIndex, column: "default_unit", message: "Default unit is required." });
  } else {
    const lower = unitStr.toLowerCase();
    if (unitMap[lower]) {
      default_unit = unitMap[lower];
    } else {
      errors.push({
        row: rowIndex,
        column: "default_unit",
        message: `Unit '${unitStr}' not found in unit table.`,
      });
    }
  }

  const active_date = (raw.active_date || "").trim();
  if (!active_date || !isValidDate(active_date)) {
    errors.push({ row: rowIndex, column: "active_date", message: "Active date must be in YYYY-MM-DD format." });
  }

  let inactive_date: string | null = null;
  if (raw.inactive_date && raw.inactive_date.trim() !== "") {
    const val = raw.inactive_date.trim();
    if (!isValidDate(val)) {
      errors.push({ row: rowIndex, column: "inactive_date", message: "Inactive date must be in YYYY-MM-DD format." });
    } else if (active_date && isValidDate(active_date) && val < active_date) {
      errors.push({ row: rowIndex, column: "inactive_date", message: "Inactive date cannot be earlier than active date." });
    } else {
      inactive_date = val;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      property_id: property_id as number,
      meter_name,
      meter_type,
      default_unit,
      active_date,
      inactive_date,
    },
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
  meterMap: Record<string, number> = {}
): { data?: ValidatedReading; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];

  let meter_id = 0;
  const meterNameStr = (raw.meter_name || raw.meter || "").trim();
  const meterIdStr = (raw.meter_id || "").trim();

  if (meterNameStr) {
    const lower = meterNameStr.toLowerCase();
    if (meterMap[lower]) {
      meter_id = meterMap[lower];
    } else {
      errors.push({
        row: rowIndex,
        column: "meter_name",
        message: `Meter '${meterNameStr}' not found for this property.`,
      });
    }
  } else if (meterIdStr) {
    const id = Number(meterIdStr);
    if (!isNaN(id) && id > 0) {
      meter_id = id;
    } else {
      errors.push({
        row: rowIndex,
        column: "meter_name",
        message: "Valid meter_name is required.",
      });
    }
  } else {
    errors.push({
      row: rowIndex,
      column: "meter_name",
      message: "meter_name is required.",
    });
  }

  const start_date = (raw.start_date || "").trim();
  if (!start_date || !isValidDate(start_date)) {
    errors.push({ row: rowIndex, column: "start_date", message: "Start date must be in YYYY-MM-DD format." });
  }

  let end_date: string | null = null;
  if (raw.end_date && raw.end_date.trim() !== "") {
    const val = raw.end_date.trim();
    if (!isValidDate(val)) {
      errors.push({ row: rowIndex, column: "end_date", message: "End date must be in YYYY-MM-DD format." });
    } else if (start_date && isValidDate(start_date) && val < start_date) {
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

  const unitStr = (raw.unit || raw.default_unit || "").trim();
  let unit = 0;
  if (!unitStr) {
    errors.push({ row: rowIndex, column: "unit", message: "Unit is required." });
  } else {
    const lower = unitStr.toLowerCase();
    if (unitMap[lower]) {
      unit = unitMap[lower];
    } else {
      errors.push({
        row: rowIndex,
        column: "unit",
        message: `Unit '${unitStr}' not found in unit table.`,
      });
    }
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
      start_date,
      end_date,
      usage_quantity,
      unit,
      cost,
    },
    errors: [],
  };
}
