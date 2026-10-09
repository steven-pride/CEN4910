import React from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  BoltIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { MetricCard } from "@/app/ui/MetricCard";

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
    value: "1,485,000",
    suffix: "sq ft",
    icon: <BuildingOfficeIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Portfolio Occupancy",
    value: "86.4%",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Portfolio EUI",
    value: "67.8",
    suffix: "kBtu/sq ft",
    icon: <BoltIcon className="h-4 w-4" />,
  },
  {
    title: "Avg Energy Score",
    value: "81.2",
    suffix: "/100",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
  },
];

export function PortfolioMetrics({ metrics = defaultMetrics }: PortfolioMetricsProps) {
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
