"use client";

import { useEffect, useState } from "react";
import {
  BuildingOfficeIcon, UserIcon, BoltIcon, Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import PortfolioHeader from "@/app/ui/PortfolioHeader";
import PortfolioMetrics, { type MetricItem } from "@/app/ui/PortfolioMetrics";
import BuildingBenchmarkCard from "@/app/ui/BuildingBenchmarkCard";
import ManagedPropertiesTable from "@/app/ui/ManagedPropertiesTable";
import type { DashboardProperty } from "@/data/dashboardProperties";
import {
  getLastCompletedMonths,
  getMonthLabel,
  summarizeEnergyForProperty,
  type MeterRow, type ReadingRow, type PropertyUseRow, type UnitRow,
} from "@/lib/dashboard/energy";

// Shapes from Ishrak's existing GET endpoints.
type ApiProperty = {
  propertyId: number;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  occupancyPercent: number | null;
};

type PaginatedResponse<T> = {
  data?: T[];
  pagination?: { totalPages: number; totalCount: number };
  error?: string;
};

async function loadAllApiRows<T>(resource: string, signal: AbortSignal): Promise<T[]> {
  const pageSize = 100;
  const records: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await fetch(`${resource}?page=${page}&pageSize=${pageSize}`, {
      method: "GET", cache: "no-store", signal,
    });
    const body = (await response.json()) as PaginatedResponse<T>;
    if (!response.ok) throw new Error(body.error || `${resource}: HTTP ${response.status}`);
    if (!Array.isArray(body.data) || !Number.isInteger(body.pagination?.totalPages) ||
        (body.pagination?.totalPages ?? 0) < 1) {
      throw new Error(`Unexpected response from ${resource}`);
    }
    if (page === 1) totalPages = body.pagination!.totalPages;
    records.push(...body.data);
    page++;
  } while (page <= totalPages);
  return records;
}

// There is no property_use or unit GET endpoint in the team's existing API.
// Read ONLY these two lookup tables through the signed-in Supabase browser
// client. RLS applies; no service-role credentials or new API is introduced.
async function loadSupabaseRows<T>(
  table: "property_use" | "unit", columns: string, signal: AbortSignal,
): Promise<T[]> {
  const supabase = createClient();
  const pageSize = 500;
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select(columns)
      .range(from, from + pageSize - 1).abortSignal(signal);
    if (error) throw new Error(`${table}: ${error.message}`);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
    from += pageSize;
  }
}

// Reuse the EUI calculator already maintained in the team's API.
// The input energy is kBtu from the three complete calendar months.
async function calculateObservedEui(kbtu: number, sqft: number, signal: AbortSignal): Promise<number> {
  const response = await fetch(
    `/api/math/eui/var1/${encodeURIComponent(String(kbtu))}/var2/${encodeURIComponent(String(sqft))}`,
    { method: "GET", cache: "no-store", signal },
  );
  const body = (await response.json()) as { value?: number; error?: string };
  if (!response.ok || typeof body.value !== "number" || !Number.isFinite(body.value)) {
    throw new Error(body.error || "EUI calculator returned an invalid result");
  }
  return body.value;
}

function formatAddress(property: ApiProperty): string | null {
  const location = [property.city, property.stateProvince].filter(Boolean).join(", ");
  return [property.addressLine1, property.addressLine2, location, property.postalCode]
    .filter(Boolean).join(", ") || null;
}

export default function LivePortfolioDashboard() {
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplementalWarnings, setSupplementalWarnings] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      setSupplementalWarnings([]);
      try {
        const [propertiesResult, usesResult, metersResult, readingsResult, unitsResult] =
          await Promise.allSettled([
            loadAllApiRows<ApiProperty>("/api/properties", controller.signal),
            loadSupabaseRows<PropertyUseRow>("property_use", "property_id,gross_floor_area,weekly_operating_hours", controller.signal),
            loadAllApiRows<MeterRow>("/api/meters", controller.signal),
            loadAllApiRows<ReadingRow>("/api/readings", controller.signal),
            loadSupabaseRows<UnitRow>("unit", "unit_id,unit_name", controller.signal),
          ]);
        if (controller.signal.aborted) return;
        if (propertiesResult.status === "rejected") throw propertiesResult.reason;

        const warnings: string[] = [];
        const safely = <T,>(result: PromiseSettledResult<T[]>, label: string): T[] => {
          if (result.status === "fulfilled") return result.value;
          const message = result.reason instanceof Error ? result.reason.message : "unavailable";
          warnings.push(`${label}: ${message}`);
          return [];
        };
        const uses = safely(usesResult, "Property-use data");
        const meters = safely(metersResult, "Meter data");
        const readings = safely(readingsResult, "Meter readings");
        const units = safely(unitsResult, "Energy units");
        const periodMonths = getLastCompletedMonths();

        // EUI requires all four resources to load without errors.
        const energyDataAvailable = [usesResult, metersResult, readingsResult, unitsResult]
          .every((result) => result.status === "fulfilled");
        const mapped: DashboardProperty[] = await Promise.all(propertiesResult.value.map(async (property) => {
          const values = summarizeEnergyForProperty(
            property.propertyId, uses, meters, readings, units, periodMonths,
          );
          let observedEui: number | null = null;
          if (energyDataAvailable && values.observedKbtu !== null && values.grossFloorArea > 0) {
            try {
              observedEui = await calculateObservedEui(values.observedKbtu, values.grossFloorArea, controller.signal);
            } catch (caught) {
              if (!controller.signal.aborted) {
                const message = caught instanceof Error ? caught.message : "unknown calculator error";
                warnings.push(`EUI for ${property.name}: ${message}`);
              }
            }
          }
          return {
            propertyId: property.propertyId,
            name: property.name,
            address: formatAddress(property),
            grossFloorArea: usesResult.status === "fulfilled" ? values.grossFloorArea : 0,
            weeklyOperatingHours: usesResult.status === "fulfilled" ? values.weeklyOperatingHours : null,
            occupancyPercent: property.occupancyPercent === null || !Number.isFinite(Number(property.occupancyPercent))
              ? null : Number(property.occupancyPercent),
            eui: observedEui,
          };
        }));
        if (controller.signal.aborted) return;
        setProperties(mapped);
        setMonths(periodMonths);
        setSupplementalWarnings(warnings);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught.message : "Unable to load properties.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [reload]);

  const occupancies = properties.map((p) => p.occupancyPercent)
    .filter((value): value is number => value !== null);
  const avgOccupancy = occupancies.length
    ? occupancies.reduce((total, value) => total + value, 0) / occupancies.length : null;

  const knownAreas = properties.filter((property) => property.grossFloorArea > 0);
  const totalFloorArea = knownAreas.reduce((total, property) => total + property.grossFloorArea, 0);
  const euiProperties = properties.filter((property) => property.eui !== null);
  const averageObservedEui = euiProperties.length
    ? euiProperties.reduce((sum, property) => sum + (property.eui ?? 0), 0) / euiProperties.length : null;
  const period = getMonthLabel(months);
  const metrics: MetricItem[] = [
    {
      title: "Gross Floor Area", value: knownAreas.length ? totalFloorArea.toLocaleString("en-US") : "—",
      suffix: "sq ft", description: knownAreas.length
        ? `Recorded area for ${knownAreas.length} of ${properties.length} properties`
        : "No property-use floor area available",
      icon: <BuildingOfficeIcon className="h-4 w-4" />,
    },
    {
      title: "Avg Portfolio Occupancy", value: avgOccupancy !== null ? `${avgOccupancy.toFixed(1)}%` : "—",
      description: avgOccupancy !== null
        ? `Calculated from ${occupancies.length} properties with occupancy data`
        : "No occupancy data available", icon: <UserIcon className="h-4 w-4" />,
    },
    {
      title: "Avg Observed EUI", value: averageObservedEui !== null ? averageObservedEui.toFixed(1) : "—",
      suffix: "kBtu/sq ft", description: averageObservedEui !== null
        ? `${period}; ${euiProperties.length} buildings, 3 complete months (not annualized)`
        : `No complete electricity/gas readings for ${period}`,
      icon: <BoltIcon className="h-4 w-4" />,
    },
    {
      title: "Avg Energy Score", value: "—", suffix: "/100",
      description: "No energy-score data source defined yet",
      icon: <Cog6ToothIcon className="h-4 w-4" />,
    },
  ];

  const compared = euiProperties.map((property) => ({
    name: property.name,
    value: property.eui!,
    percent: 0,
    detail: "Observed energy in completed months (not annualized)",
    status: "normal" as const,
  }));

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <div className="flex min-h-screen">
        <div className="min-w-0 flex w-full lg:ml-56.25">
          <main className="w-full px-4 py-5 md:px-6 lg:px-7">
            {loading ? (
              <p role="status" className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">Loading portfolio data…</p>
            ) : error ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-red-700">Could not load the property portfolio.</p>
                <p className="mt-2 text-sm text-slate-600">{error}</p>
                <button type="button" onClick={() => setReload((current) => current + 1)}
                  className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
              </div>
            ) : (
              <>
                <PortfolioHeader totalProperties={properties.length}
                  onImportSuccess={() => setReload((current) => current + 1)} />
                {supplementalWarnings.length > 0 && (
                  <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Some energy details could not be loaded. Property records are still available.</p>
                    <ul className="mt-2 list-disc pl-5">
                      {supplementalWarnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  </div>
                )}
                <PortfolioMetrics metrics={metrics} />
                <BuildingBenchmarkCard
                  benchmarks={compared}
                  showTarget={false}
                  heading={`Observed Energy Intensity — ${period} (kBtu/sq ft)`}
                  note="Three complete calendar months only. This is partial-period EUI, not annual EUI; the annual target of 65 is intentionally omitted."
                />
                <ManagedPropertiesTable properties={properties} energyBasis="observed" />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
