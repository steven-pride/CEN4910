"use client";

import { Area, AreaChart, CartesianGrid, ReferenceDot, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { kwh: { label: "Usage (kWh)", color: "var(--primary)" } } satisfies ChartConfig;

export function ConsumptionChart({ data }: { data: { month: string; kwh: number }[] }) {
  const peak = data.reduce((a, b) => (b.kwh > a.kwh ? b : a), data[0]);
  return (
    <ChartContainer config={config} className="h-48 w-full">
      <AreaChart data={data} margin={{ top: 16, left: 8, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="kwh" type="monotone" stroke="var(--color-kwh)" fill="var(--color-kwh)" fillOpacity={0.15} />
        <ReferenceDot
          x={peak.month}
          y={peak.kwh}
          r={4}
          fill="var(--destructive)"
          stroke="none"
          label={{ value: `Peak ${peak.month}: ${Math.round(peak.kwh / 1000)}k`, position: "top", fontSize: 11 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
