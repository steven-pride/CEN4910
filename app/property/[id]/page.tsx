import { ChartNoAxesCombined, Clock, Download, Ruler, Users, FileUp, FilePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/property/components/PageHeader";
import { StatCard } from "@/app/property/components/StatCard";
import { ChartCard } from "@/app/property/components/ChartCard";
import { SectionHeader } from "@/app/property/components/SectionHeader";
import { StatusBadge } from "@/app/property/components/StatusBadge";
import { BenchmarkChart } from "@/app/property/components/energy/BenchmarkChart";
import { ConsumptionChart } from "@/app/property/components/energy/ConsumptionChart";
import { EnergyStarGauge } from "@/app/property/components/energy/EnergyStarGauge";
import { RangeToggle } from "@/app/property/components/energy/RangeToggle";
import { MeterTable } from "@/app/property/components/meters/MeterTable";
import { MeterPagination, MeterSearch } from "@/app/property/components/meters/Controls";
import { getAnalytics } from "@/data/mockAnalytics";
import { getMeters } from "@/data/mockMeters";
import properties from "@/data/mockProperties";
import { notFound } from 'next/navigation';

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string; q?: string; page?: string }>;
}) {
  const { id } = await params;
  const { range = "12m", q = "", page = "1" } = await searchParams;
  const pageNum = Number(page) || 1;

  const [property, analytics, meters] = await Promise.all([
    properties.find((a) => a.id === id),
    getAnalytics(id, range),
    getMeters(id, { q, page: pageNum }),
  ]);

  if (!property) notFound();

  const addressLine2 = property.addressLine2 ? property.addressLine2 + ", " : "";
  const address = property.addressLine1 + ", " + 
                  addressLine2 +
                  property.city + ", " +
                  property.stateProvince + " " +
                  property.postalCode;

  return (
    <main className="mx-auto max-w-7xl space-y-10 p-6">
      <PageHeader
        backHref="/"
        backLabel="Back to Portfolio"
        title={property.name}
        subtitle={address}
        actions={
          <>
            <Button variant="outline"><FileUp className="text-primary" />Bulk Import Meters</Button>
            <Button variant="outline"><FileUp className="text-primary" />Bulk Import Meter Readings</Button>
            <Button variant="teal"><Download /> Export Property Details</Button>
            <Button><FilePen />Edit Data for Property</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard tone="solid" eyebrow="Asset Envelope" title="Square Footage" value="250,000" unit="sq ft" icon={<Ruler />} />
        <StatCard tone="cyan" eyebrow="Operational Schedule" title="Work Hours" value="Mon-Fri 07:00 - 19:00" icon={<Clock />} />
        <StatCard tone="teal" eyebrow="Tenancy Metrics" title="Current Occupancy" value="92%" trend="+3.4% YoY" icon={<Users />} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Comprehensive Energy & Performance Analytics"
          icon={<ChartNoAxesCombined className="size-5 text-primary" />}
          actions={<RangeToggle value={range} />}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard
            eyebrow="Consumption Trajectory"
            title="Energy Usage Over Time (kWh)"
            aside={
              <div className="text-right">
                <p className="font-semibold text-primary tabular-nums">412,500</p>
                <p className="text-xs text-muted-foreground">Current Month (Sep)</p>
              </div>
            }
          >
            <ConsumptionChart data={analytics.monthly} />
          </ChartCard>
          <ChartCard
            eyebrow="Efficiency Variance"
            title="Consumption vs Benchmark"
            aside={<StatusBadge tone="water">-14.2% Under Benchmark</StatusBadge>}
          >
            <BenchmarkChart data={analytics.quarterly} baseline={520_000} />
          </ChartCard>
          <ChartCard eyebrow="Sustainability Index" title="ENERGY STAR Rating" footer="ENERGY STAR Eligible">
            <EnergyStarGauge score={88} />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Building Meters & Telemetry Infrastructure"
          description="Live hardware sensors, gateway connection status, and consumption logs"
          actions={
            <>
              <MeterSearch defaultValue={q} />
              <Button>+ Register New Meter</Button>
            </>
          }
        />
        <MeterTable meters={meters.items} />
        <MeterPagination total={meters.total} page={pageNum} />
      </section>
    </main>
  );
}