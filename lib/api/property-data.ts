import "server-only";
import { apiGet } from "@/lib/api/server-fetch";

export type MeterItem = {
  meterId: number;
  name: string;
  type: string | null;
  defaultUnit: string | null;
  defaultUnitId: number | null; // new
  status: "active" | "inactive" | "pending";
  activeDate: string | null;
  inactiveDate: string | null;
  lastReading: {
    endDate: string | null;
    usage: number;
    unit: string | null;
    cost: number | null;
  } | null;
};

export type MeterPage = {
  items: MeterItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type Analytics = {
  monthly: { month: string; kwh: number }[];
  quarterly: { quarter: string; kwh: number }[];
  currentMonth: { label: string; value: number };
};

const emptyMeters: MeterPage = { items: [], total: 0, page: 1, pageSize: 10 };

const emptyAnalytics: Analytics = {
  monthly: [],
  quarterly: [],
  currentMonth: { label: "", value: 0 },
};

export async function getPropertyMeters(
  id: string,
  { q, page }: { q: string; page: number }
) {
  const params = new URLSearchParams({ q, page: String(page) });

  const data = await apiGet<MeterPage>(
    `/api/properties/${encodeURIComponent(id)}/meters?${params}`
  );

  return data ?? emptyMeters;
}

export async function getPropertyAnalytics(id: string, range: string) {
  const params = new URLSearchParams({ range });

  const data = await apiGet<Analytics>(
    `/api/properties/${encodeURIComponent(id)}/analytics?${params}`
  );

  return data ?? emptyAnalytics;
}