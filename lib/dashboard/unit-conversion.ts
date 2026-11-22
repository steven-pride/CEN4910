export type UnitConversionRow = {
  unit_id: number;
  unit_name: string;
  conversion_value: number | string | null;
  base_unit_id: number | null;
};

export type UnitEnergyFactor = {
  unitId: number;
  kbtuPerUnit: number | null;
};

const KBTU_PER_KWH = 3.412141633;

function positiveNumber(value: number | string | null): number | null {
  if (value === null || value === "") return null;
  const converted = Number(value);
  return Number.isFinite(converted) && converted > 0 ? converted : null;
}

function energyFactor(unitId: number, units: Map<number, UnitConversionRow>): number | null {
  let unit = units.get(unitId);
  let factor = KBTU_PER_KWH;
  const visited = new Set<number>();

  while (unit) {
    const currentUnitId = Number(unit.unit_id);
    if (visited.has(currentUnitId)) return null;
    visited.add(currentUnitId);

    if (unit.unit_name.trim().toLowerCase() === "kwh" && unit.base_unit_id === null) {
      return factor;
    }

    const conversion = positiveNumber(unit.conversion_value);
    if (unit.base_unit_id === null || conversion === null) return null;

    factor *= conversion;
    if (!Number.isFinite(factor)) return null;
    unit = units.get(Number(unit.base_unit_id));
  }

  return null;
}

export function calculateUnitEnergyFactors(units: UnitConversionRow[]): UnitEnergyFactor[] {
  const unitsById = new Map(units.map((unit) => [Number(unit.unit_id), unit]));
  return units.map((unit) => ({
    unitId: Number(unit.unit_id),
    kbtuPerUnit: energyFactor(Number(unit.unit_id), unitsById),
  }));
}