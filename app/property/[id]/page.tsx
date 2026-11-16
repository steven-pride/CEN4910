import Link from "next/link";
import { ChartNoAxesCombined, Clock, Plus, Ruler, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/app/property/components/PageHeader";
import { PropertyHeaderActions } from "@/app/property/components/PropertyHeaderActions";
import { StatCard } from "@/app/property/components/StatCard";
import { ChartCard } from "@/app/property/components/ChartCard";
import { SectionHeader } from "@/app/property/components/SectionHeader";
import { BenchmarkChart } from "@/app/property/components/energy/BenchmarkChart";
import { ConsumptionChart } from "@/app/property/components/energy/ConsumptionChart";
import { EnergyStarGauge } from "@/app/property/components/energy/EnergyStarGauge";
import { MeterTable } from "@/app/property/components/meters/MeterTable";
import { MeterPagination, MeterSearch } from "@/app/property/components/meters/Controls";
import { getProperty } from "@/lib/api/properties";
import {
  getPropertyAnalytics,
  getPropertyMeters,
} from "@/lib/api/property-data";
import { notFound } from "next/navigation";

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string; q?: string; page?: string }>;
}) {
  const { id } = await params;
  const { range = "12m", q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  // Property first, so we can 404 before doing any other work.
  const property = await getProperty(id);

  if (!property) notFound();

  const [analytics, meters] = await Promise.all([
    getPropertyAnalytics(id, range),
    getPropertyMeters(id, { q, page: pageNum }),
  ]);

  const cityLine = [property.city, property.stateProvince]
    .filter(Boolean)
    .join(", ");

  const address = [
    property.addressLine1,
    property.addressLine2,
    [cityLine, property.postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const occupancy =
    property.occupancyPercent !== null
      ? `${property.occupancyPercent}%`
      : "—";

  const totalSqFt = property.propertyUses.reduce(
    (sum, use) => sum + (use.grossFloorArea ?? 0),
    0
  );

  const squareFootage =
    property.propertyUses.length > 0
      ? totalSqFt.toLocaleString("en-US")
      : "—";

  // Use the largest weekly hours value across uses (or swap in a
  // floor-area-weighted average if that suits your data better).
  const weeklyHoursValues = property.propertyUses
    .map((u) => u.weeklyOperatingHours)
    .filter((h): h is number => h !== null);

  const weeklyHours =
    weeklyHoursValues.length > 0
      ? `${Math.max(...weeklyHoursValues)} hrs/week`
      : "—";

  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6">
      <PageHeader
        backHref="/"
        backLabel="Back to Portfolio"
        title={property.name}
        subtitle={address}
        actions={
          <PropertyHeaderActions
            propertyId={String(property.propertyId)}
            propertyName={property.name}
          />
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard tone="solid" eyebrow="Asset Envelope" title="Square Footage" value={squareFootage} unit="sq ft" icon={<Ruler />} />
        <StatCard tone="cyan" eyebrow="Operational Schedule" title="Weekly Hours" value={weeklyHours} icon={<Clock />} />
        <StatCard tone="teal" eyebrow="Tenancy Metrics" title="Current Occupancy" value={occupancy} icon={<Users />} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Comprehensive Energy & Performance Analytics"
          icon={<ChartNoAxesCombined className="size-5 text-primary" />}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard
            eyebrow="Consumption Trajectory"
            title="Energy Usage Over Time (kWh)"
            aside={
              <div className="text-right">
                <p className="font-semibold text-primary tabular-nums">
                  {analytics.currentMonth.value.toLocaleString("en-US")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Current Month ({analytics.currentMonth.label})
                </p>
              </div>
            }
          >
            <ConsumptionChart data={analytics.monthly} />
          </ChartCard>
          <ChartCard
            eyebrow="Efficiency Variance"
            title="Consumption vs Benchmark"
          >
            <BenchmarkChart data={analytics.quarterly} baseline={520_000} />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Building Meters & Telemetry Infrastructure"
          description="Live hardware sensors, gateway connection status, and consumption logs"
          actions={
            <Link
              href={`/meter/new?propertyId=${property.propertyId}`}
              className={cn(buttonVariants(), "inline-flex items-center gap-2")}
            >
              <Plus className="size-4 shrink-0" />
              Register New Meter
            </Link>
          }
        />
        <MeterTable meters={meters.items} />
      </section>
    </main>
  );
}
