
import React from "react";

import {
  BuildingOfficeIcon,
  UserIcon,
  BoltIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import { MetricCard } from "@/app/ui/MetricCard";
import { portfolioStats } from "@/data/mockAnalytics";

export interface MetricItem {
  title: string;
  value: string;
  suffix?: string;
  description?: string;
  descriptionColor?: string;
  icon: React.ReactNode;
}

export interface PortfolioMetricsProps {
  metrics?: MetricItem[];
}

const defaultMetrics: MetricItem[] = [
  {
    title: "Gross Floor Area",
    value: portfolioStats.grossFloorArea.toLocaleString("en-US"),
    suffix: "sq ft",
    description: "Calculated from property use (demo)",
    icon: <BuildingOfficeIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Portfolio Occupancy",
    value:
      portfolioStats.averageOccupancy !== null
        ? `${portfolioStats.averageOccupancy.toFixed(1)}%`
        : "—",
    description: "Awaiting occupancy data",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Building EUI",
    value:
      portfolioStats.averageEui !== null
        ? portfolioStats.averageEui.toFixed(1)
        : "—",
    suffix: "kBtu/sq ft",
    description: "Average of compared buildings (demo)",
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Energy Score",
    value:
      portfolioStats.averageEnergyScore !== null
        ? portfolioStats.averageEnergyScore.toFixed(1)
        : "—",
    suffix: "/100",
    description: "Energy score not yet defined",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
  },
];

export function PortfolioMetrics({
  metrics = defaultMetrics,
}: PortfolioMetricsProps) {
  return (
    <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          suffix={metric.suffix}
          description={metric.description}
          descriptionColor={metric.descriptionColor}
          icon={metric.icon}
        />
      ))}
    </section>
  );
}

export default PortfolioMetrics;
