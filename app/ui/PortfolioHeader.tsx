import React from "react";
import {
  BuildingOfficeIcon,
  PlusCircleIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";

export interface PortfolioHeaderProps {
  totalProperties?: number;
  onNewProperty?: () => void;
  onBulkImport?: () => void;
  onExport?: () => void;
}

export function PortfolioHeader({
  totalProperties = 12,
  onNewProperty,
  onBulkImport,
  onExport,
}: PortfolioHeaderProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>Enterprise Portfolio</span>
            <span>›</span>
            <span className="text-blue-600">Dashboard Overview</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Portfolio Overview
            </h1>

            <span className="rounded bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {totalProperties} Properties Total
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onNewProperty}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <PlusCircleIcon className="h-4 w-4" />
            New Property
          </button>

          <button
            type="button"
            onClick={onBulkImport}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            Bulk Import Properties
          </button>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
          >
            <CloudArrowDownIcon className="h-4 w-4" />
            Export Dashboard Data
          </button>
        </div>
      </div>
    </section>
  );
}

export default PortfolioHeader;
