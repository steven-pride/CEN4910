export type Reading = {
  id: string;
  date: string;
  quantity: number;
  unit: string;
  cost: number;
  audit: "verified" | "audited";
};

const readings = [
  { id: "r1", date: "2024-09-01", quantity: 412500, unit: "kWh", cost: 51562.5, audit: "verified" },
  { id: "r2", date: "2024-08-01", quantity: 438200, unit: "kWh", cost: 54775, audit: "verified" },
  { id: "r3", date: "2024-07-01", quantity: 455100, unit: "kWh", cost: 56887.5, audit: "audited" },
  { id: "r4", date: "2024-06-01", quantity: 390400, unit: "kWh", cost: 48800, audit: "verified" },
] as const;

export default readings;