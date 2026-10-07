"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const config = { score: { label: "Score", color: "var(--brand-teal)" } } satisfies ChartConfig;

export function EnergyStarGauge({ score }: { score: number }) {
  return (
    <div className="relative mx-auto size-44">
      <ChartContainer config={config} className="size-full">
        <RadialBarChart data={[{ score }]} startAngle={90} endAngle={-270} innerRadius="78%" outerRadius="100%">
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="score" background cornerRadius={10} fill="var(--color-score)" />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}
