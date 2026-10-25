"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = { kwh: { label: "Building actual", color: "var(--primary)" } } satisfies ChartConfig;

export function BenchmarkChart({
  data,
  baseline,
}: {
  data: { quarter: string; kwh: number }[];
  baseline: number;
}) {
  return (
    <ChartContainer config={config} className="h-48 w-full">
      <BarChart data={data} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine
          y={baseline}
          stroke="var(--muted-foreground)"
          strokeDasharray="6 4"
          label={{ value: `Benchmark (${Math.round(baseline / 1000)}k kWh avg)`, position: "top", fontSize: 11 }}
        />
        <Bar dataKey="kwh" fill="var(--color-kwh)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
