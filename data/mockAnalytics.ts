
/**
 * DEMONSTRATION DATA ONLY
 * Based on Jacob's database model.
 * Supabase integration will be added later.
 */

export type Benchmark = {
  name: string;
  value: number;
  percent: number;
  detail: string;
  status: "good" | "danger" | "normal";
};

const TARGET_EUI = 65;
const CHART_MAX_EUI = 120;
const KBTU_PER_KWH = 3.412142;

// Mock data: property
export const properties = [
  { property_id: 1, property_name: "Empire State Tower" },
  { property_id: 2, property_name: "Midtown Plaza" },
  { property_id: 3, property_name: "Hudson Yards 4" },
  { property_id: 4, property_name: "Pacific Heights Center" },
  { property_id: 5, property_name: "Boston Harbor Plaza" },
  { property_id: 6, property_name: "Metro Financial" },
];

// Mock data: property_use
// Areas are expressed in square feet.
export const propertyUses = [
  { property_id: 1, gross_floor_area: 200000 },
  { property_id: 2, gross_floor_area: 180000 },
  { property_id: 3, gross_floor_area: 340000 },
  { property_id: 4, gross_floor_area: 125000 },
  { property_id: 5, gross_floor_area: 410000 },
  { property_id: 6, gross_floor_area: 280000 },
];

// Mock data: meter
const meters = properties.map((property) => ({
  meter_id: property.property_id,
  property_id: property.property_id,
  meter_name: "Electric Meter",
  meter_type: "electricity",
  default_unit: 1,
}));

// Mock data: unit
const units = [
  { unit_id: 1, unit_name: "kWh" },
];

// Mock data: meter_reading
// One annual electricity reading per property for 2025.
const annualUsageKwh = [
  3177000,
  2733000,
  7910000,
  2272000,
  7750000,
  7246000,
];

const meterReadings = annualUsageKwh.map((usage, index) => ({
  meter_reading_id: index + 1,
  meter_id: index + 1,
  start_date: "2025-01-01",
  end_date: "2025-12-31",
  usage_quantity: usage,
  unit: 1,
}));

// Calculate building EUI dynamically
export const benchmarks: Benchmark[] = properties.map((property) => {
  const area = propertyUses
    .filter((use) => use.property_id === property.property_id)
    .reduce((sum, use) => sum + use.gross_floor_area, 0);

  const meterIds = meters
    .filter((meter) => meter.property_id === property.property_id)
    .map((meter) => meter.meter_id);

  const annualKwh = meterReadings
    .filter(
      (reading) =>
        meterIds.includes(reading.meter_id) &&
        reading.start_date === "2025-01-01" &&
        reading.end_date === "2025-12-31" &&
        units.some(
          (unit) =>
            unit.unit_id === reading.unit &&
            unit.unit_name === "kWh"
        )
    )
    .reduce((sum, reading) => sum + reading.usage_quantity, 0);

  const eui = area > 0
    ? (annualKwh * KBTU_PER_KWH) / area
    : 0;

  const deviation = ((eui - TARGET_EUI) / TARGET_EUI) * 100;

  const status: Benchmark["status"] =
    deviation > 0
      ? "danger"
      : deviation <= -10
        ? "good"
        : "normal";

  return {
    name: property.property_name,
    value: eui,
    percent: Math.min(100, Math.max(0, (eui / CHART_MAX_EUI) * 100)),
    detail: `${deviation > 0 ? "+" : ""}${deviation.toFixed(1)}% vs Target`,
    status,
  };
});

// Existing mock analytics, retained for other components.
// These values are not yet calculated from meter readings.
export async function getAnalytics(_id: string, _range: string) {
  const kwh = [
    380, 395, 410, 430, 455, 470,
    482, 465, 440, 425, 410, 412,
  ].map((v) => v * 1000);

  const months = [
    "Oct", "Nov", "Dec", "Jan",
    "Feb", "Mar", "Apr", "May",
    "Jun", "Jul", "Aug", "Sep",
  ];

  return {
    monthly: months.map((month, i) => ({
      month,
      kwh: kwh[i],
    })),
    quarterly: [
      { quarter: "Q1", kwh: 420000 },
      { quarter: "Q2", kwh: 455000 },
      { quarter: "Q3", kwh: 505000 },
      { quarter: "Q4", kwh: 390000 },
    ],
  };

}

// AGREGA EL NUEVO CÓDIGO DEBAJO DE ESTA LÍNEA

/**
 * Portfolio statistics calculated from mock data.
 * Based on Jacob's database model.
 */
export const portfolioStats = {
  totalProperties: properties.length,

  grossFloorArea: propertyUses.reduce(
    (sum, propertyUse) =>
      sum + propertyUse.gross_floor_area,
    0
  ),

  averageEui:
    benchmarks.length > 0
      ? benchmarks.reduce(
          (sum, building) => sum + building.value,
          0
        ) / benchmarks.length
      : null,

  averageOccupancy: null as number | null,

  averageEnergyScore: null as number | null,
};
