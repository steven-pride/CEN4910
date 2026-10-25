import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading, HEADING_LEVELS } from "@/app/ui/Heading";
import { StatCard, STAT_CARD_TONES } from "@/app/property/components/StatCard";
import { StatusBadge, STATUS_TONES } from "@/app/property/components/StatusBadge";
import { ChartCard } from "@/app/property/components/ChartCard";
import { SectionHeader } from "@/app/property/components/SectionHeader";
import { ConsumptionChart } from "@/app/property/components/energy/ConsumptionChart";

const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "teal", "destructive"] as const;

const SAMPLE = ["Oct", "Dec", "Feb", "Apr", "Jul", "Sep"].map((month, i) => ({
  month,
  kwh: [380, 410, 455, 440, 482, 412][i] * 1000,
}));

function Section({ title, path, children }: { title: string; path: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <Heading level={2} className="text-xl font-semibold">
          {title}
        </Heading>
        <code className="text-xs text-muted-foreground">{path}</code>
      </div>
      {children}
    </section>
  );
}

export default function Styleguide() {
  if (process.env.NODE_ENV === "production") notFound(); // dev/staging only

  return (
    <main className="mx-auto max-w-5xl space-y-12 p-8">
      <Section title="Typography" path="@/components/ui/heading, eyebrow">
        <div className="space-y-3">
          <Eyebrow>Eyebrow label</Eyebrow>
          {HEADING_LEVELS.map((l) => (
            <Heading key={l} level={l}>Heading level {l}</Heading>
          ))}
        </div>
      </Section>

      <Section title="Buttons" path="@/components/ui/button">
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </div>
      </Section>

      <Section title="Stat cards" path="@/components/patterns/StatCard">
        <div className="grid gap-4 md:grid-cols-3">
          {STAT_CARD_TONES.map((t) => (
            <StatCard key={t} tone={t} eyebrow="Eyebrow" title={`Tone: ${t}`} value="250,000" unit="sq ft" />
          ))}
        </div>
      </Section>

      <Section title="Status badges" path="@/components/patterns/StatusBadge">
        <div className="flex flex-wrap gap-2">
          {STATUS_TONES.map((t) => (
            <StatusBadge key={t} tone={t}>{t}</StatusBadge>
          ))}
        </div>
      </Section>

      <Section title="Section header" path="@/components/patterns/SectionHeader">
        <SectionHeader
          title="Section title"
          description="Optional description text"
          actions={<Button size="sm">Action</Button>}
        />
      </Section>

      <Section title="Chart card" path="@/components/patterns/ChartCard">
        <div className="max-w-md">
          <ChartCard eyebrow="Eyebrow" title="Chart title" footer="Optional footer">
            <ConsumptionChart data={SAMPLE} />
          </ChartCard>
        </div>
      </Section>
    </main>
  );
}
