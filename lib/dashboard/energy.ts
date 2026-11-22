/**
 * Main Dashboard read-only energy calculations.
 * The APIs already expose properties, meters, readings, property-use data,
 * and backend-calculated energy unit factors.
 *
 * EUI here is the OBSERVED energy for the last three FULL calendar months
 * divided by gross floor area. It is NOT annualized and must never be
 * compared to an annual ENERGY STAR/EUI benchmark.
 */
export type PropertyUseRow = {
  property_id: number;
  gross_floor_area: number | string | null;
  weekly_operating_hours: number | string | null;
};

export type UnitEnergyFactorRow = {
  unitId: number;
  kbtuPerUnit: number | null;
};

export type UnitRow = {
  unit_id: number;
  unit_name: string;
};

export type MeterRow = {
  meterId: number;
  propertyId: number;
  meterName: string;
  meterType: string | null;
  defaultUnit: number | null;
};

export type ReadingRow = {
  meterReadingId: number;
  meterId: number;
  startDate: string | null;
  endDate: string | null;
  usageQuantity: number | string | null;
  unit: number | null;
};

export type EnergySummary = {
  grossFloorArea: number;
  weeklyOperatingHours: number | null;
  /** Total observed kBtu; division is delegated to the existing /api/math/eui endpoint. */
  observedKbtu: number | null;
};

function numeric(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const converted = Number(value);
  return Number.isFinite(converted) && converted >= 0 ? converted : null;
}

export function getLastCompletedMonths(now: Date = new Date()): string[] {
  return [3, 2, 1].map((offset) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    return d.toISOString().slice(0, 7);
  });
}

export function getMonthLabel(months: string[]): string {
  const format = (month: string) => new Intl.DateTimeFormat("en-US", {
    month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
  return months.length ? `${format(months[0])} – ${format(months[months.length - 1])}` : "";
}

function lastDayOfMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

export function summarizeEnergyForProperty(
  propertyId: number,
  uses: PropertyUseRow[],
  meters: MeterRow[],
  readings: ReadingRow[],
  units: Array<UnitEnergyFactorRow | UnitRow>,
  months: string[],
): EnergySummary {
  const relevantUses = uses.filter((use) => Number(use.property_id) === propertyId);
  const grossFloorArea = relevantUses.reduce(
    (sum, use) => sum + (numeric(use.gross_floor_area) ?? 0), 0
  );

  // For mixed-use buildings, weight weekly hours by each use's floor area.
  const hoursWithArea = relevantUses
    .map((use) => ({ hours: numeric(use.weekly_operating_hours), area: numeric(use.gross_floor_area) }))
    .filter((x): x is { hours: number; area: number } => x.hours !== null && x.area !== null && x.area > 0);
  const totalHoursArea = hoursWithArea.reduce((sum, row) => sum + row.area, 0);
  const weeklyOperatingHours = totalHoursArea > 0
    ? hoursWithArea.reduce((sum, row) => sum + row.hours * row.area, 0) / totalHoursArea
    : null;

  const relevantMeters = meters.filter((meter) => Number(meter.propertyId) === propertyId);
  const unitMap = new Map<number, number | null>();
  for (const unit of units) {
    if ("kbtuPerUnit" in unit) {
      unitMap.set(Number(unit.unitId), unit.kbtuPerUnit);
    } else {
      unitMap.set(Number(unit.unit_id), null);
    }
  }
  const energyMeters = relevantMeters.filter((meter) => {
    const kind = (meter.meterType || "").toLowerCase();
    return kind.includes("electric") || kind.includes("gas");
  });
  if (grossFloorArea <= 0 || !months.length || !energyMeters.length) {
    return { grossFloorArea, weeklyOperatingHours, observedKbtu: null };
  }

  let totalKbtu = 0;
  for (const meter of energyMeters) {
    for (const month of months) {
      // Require a COMPLETE calendar-month reading, exactly one per meter/month.
      // Partial, overlapping, or missing periods cannot be used for comparisons.
      const validReadings = readings.filter((reading) =>
        Number(reading.meterId) === Number(meter.meterId) &&
        reading.startDate === `${month}-01` &&
        reading.endDate === lastDayOfMonth(month)
      );
      if (validReadings.length !== 1) {
        return { grossFloorArea, weeklyOperatingHours, observedKbtu: null };
      }
      const reading = validReadings[0];
      const usage = numeric(reading.usageQuantity);
      const unitId = reading.unit ?? meter.defaultUnit;
      const factor = unitId === null ? null : unitMap.get(Number(unitId)) ?? null;
      if (usage === null || factor === null || !Number.isFinite(factor) || factor <= 0) {
        return { grossFloorArea, weeklyOperatingHours, observedKbtu: null };
      }
      totalKbtu += usage * factor;
    }
  }
  return { grossFloorArea, weeklyOperatingHours, observedKbtu: totalKbtu };
}
