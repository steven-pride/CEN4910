import React from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { benchmarks as defaultBenchmarks, type Benchmark } from "@/data/mockAnalytics";

export interface BuildingBenchmarkCardProps {
  benchmarks?: Benchmark[];
  targetValue?: number;
  targetLabel?: string;
}

export function BuildingBenchmarkCard({
  benchmarks = defaultBenchmarks,
  targetLabel = "Target Benchmark (65 kBtu/sq ft)",
}: BuildingBenchmarkCardProps) {
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Building Comparison Benchmark (Energy Use Intensity - kBtu/sq ft vs Benchmark)
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded bg-red-600" />
              {targetLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5">
        {/* BARS */}
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="mb-5 grid grid-cols-[1fr_180px] items-end">
            <p className="text-[11px] font-bold text-slate-500">
              Building Identity
            </p>
          </div>

          <div className="space-y-4">
            {benchmarks.map((item) => {
              const danger = item.status === "danger";

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                      {item.name}
                    </div>

                    <div
                      className={`whitespace-nowrap text-xs font-medium ${
                        danger ? "text-red-600" : "text-cyan-700"
                      }`}
                    >
                      {item.value.toFixed(1)} kBtu/sq ft ({item.detail})
                    </div>
                  </div>

                  <div className="relative h-4 overflow-hidden rounded-full bg-slate-200">
                    {/* target 65 / 120 */}
                    <div className="absolute left-[54.16%] top-0 z-10 h-full w-[2px] bg-red-500" />

                    <div
                      style={{
                        width: `${Math.min(item.percent, 100)}%`,
                      }}
                      className={`h-full rounded-full ${
                        danger
                          ? "bg-red-600"
                          : item.status === "good"
                            ? "bg-cyan-600"
                            : "bg-blue-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DIAGNOSTICS */}
      </div>
    </section>
  );
}

export default BuildingBenchmarkCard;
