import React from "react";

export interface MetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  description?: string;
  descriptionColor?: string;
  icon: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  suffix,
  description = "",
  descriptionColor = "text-blue-700",
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500">
            {title}
          </p>

          <div className="mt-5 flex items-end gap-2">
            <p className="text-[29px] font-bold tracking-tight text-slate-900">
              {value}
            </p>

            {suffix && (
              <span className="mb-1 text-sm font-semibold text-slate-600">
                {suffix}
              </span>
            )}
          </div>

          {description && (
            <p className={`mt-1 text-xs font-medium ${descriptionColor}`}>
              {description}
            </p>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
