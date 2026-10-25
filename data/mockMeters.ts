import readings, { type Reading } from '@/data/mockReadings'

export type Meter = {
  id: string;
  code: string;
  hardware: string;
  type: "electric" | "gas" | "water";
  typeLabel: string;
  zone: string;
  location: string;
  active: boolean;
  readings: Reading[];
};

const ALL: Meter[] = [
  { id: "m1", code: "EM-10492", hardware: "Schneider ION9000 (IP: 10.240.12.8)", type: "electric", typeLabel: "Electric Main Feed", zone: "Basements & Chillers", location: "Sub-Station East / Vault B-2", active: true, readings: [...readings] },
  { id: "m2", code: "GM-20411", hardware: "Honeywell Rotary Gas (Modbus 04)", type: "gas", typeLabel: "Natural Gas Boiler", zone: "Central Plant", location: "Sub-Level 2 Thermal Unit", active: true, readings: [...readings] },
  { id: "m3", code: "WM-88210", hardware: "Badger Ultrasonic Flow E-Series", type: "water", typeLabel: "City Water Inflow", zone: "Tower Supply", location: "Riser 4 North Primary", active: true, readings: [...readings] },
];

export async function getMeters(_id: string, { q, page }: { q: string; page: number }) {
  const filtered = ALL.filter((m) => `${m.code} ${m.zone}`.toLowerCase().includes(q.toLowerCase()));
  const pageSize = 3;
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}