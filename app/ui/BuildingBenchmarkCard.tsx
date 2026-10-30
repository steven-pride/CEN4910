
"use client";

import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import {
  benchmarks as defaultBenchmarks,
  type Benchmark,
} from "@/data/mockAnalytics";

export interface BuildingBenchmarkCardProps {
  benchmarks?: Benchmark[];
  targetValue?: number;
  targetLabel?: string;
}

export function BuildingBenchmarkCard({
  benchmarks = defaultBenchmarks,
  targetValue = 65,
  targetLabel,
}: BuildingBenchmarkCardProps) {
  const scaleMax = Math.max(
    120,
    targetValue,
    ...benchmarks.map((item) => item.value)
  );

  const targetPosition = Math.min(
    100,
    Math.max(0, (targetValue / scaleMax) * 100)
  );

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Building Comparison Benchmark
            (Energy Use Intensity - kBtu/sq ft)
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Building EUI
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded bg-red-600" />
              {targetLabel ??
                `Target Benchmark (${targetValue} kBtu/sq ft)`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-slate-500">
            Building Identity
          </p>

          <p className="text-xs font-medium text-slate-500">
            Scale: 0 - {scaleMax.toFixed(1)} kBtu/sq ft
          </p>
        </div>

        <div className="space-y-5">
          {benchmarks.map((item, index) => {
            const eui = item.value;

            const deviation =
              targetValue > 0
                ? ((eui - targetValue) / targetValue) * 100
                : null;

            const danger = eui > targetValue;

            const good =
              deviation !== null && deviation <= -10;

            const barWidth = Math.min(
              100,
              Math.max(0, (eui / scaleMax) * 100)
            );

            const barColor = danger
              ? "bg-red-600"
              : good
                ? "bg-cyan-600"
                : "bg-blue-600";

            return (
              <div key={`${item.name}-${index}`}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                    <span>{item.name}</span>
                  </div>

                  <div
                    className={`text-xs font-medium ${
                      danger
                        ? "text-red-600"
                        : "text-cyan-700"
                    }`}
                  >
                    {eui.toFixed(1)} kBtu/sq ft
                    {" ("}
                    {deviation === null
                      ? "No valid target"
                      : `${deviation > 0 ? "+" : ""}${deviation.toFixed(1)}% vs Target`}
                    {")"}
                  </div>
                </div>

                <div className="relative h-4 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="absolute top-0 z-10 h-full w-[2px] bg-red-500"
                    style={{
                      left: `${targetPosition}%`,
                    }}
                  />

                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {benchmarks.length === 0 && (
            <p className="py-5 text-center text-sm text-slate-500">
              No building energy data available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default BuildingBenchmarkCard;
