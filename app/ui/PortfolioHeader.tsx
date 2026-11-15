"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BuildingOfficeIcon,
  PlusCircleIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import CsvImportModal from "@/components/csv/CsvImportModal";
import { triggerAsyncExport } from "@/lib/utils/download";

export interface PortfolioHeaderProps {
  totalProperties?: number;
  onNewProperty?: () => void;
  onBulkImport?: () => void;
  onExport?: () => void;
  onImportSuccess?: () => void;
}

export function PortfolioHeader({
  totalProperties = 12,
  onNewProperty,
  onBulkImport,
  onExport,
  onImportSuccess,
}: PortfolioHeaderProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const handleBulkImportClick = () => {
    if (onBulkImport) {
      onBulkImport();
    } else {
      setIsImportOpen(true);
    }
  };

  const handleExportClick = async () => {
    if (onExport) {
      onExport();
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      await triggerAsyncExport("/api/export/properties", {}, (prog) => {
        setExportProgress(prog);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      alert(`Export failed: ${msg}`);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleImportSuccess = () => {
    onImportSuccess?.();
    router.refresh();
  };

  return (
    <>
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
              onClick={() => onNewProperty ? onNewProperty() : router.push("/property/new")}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-4 w-4" />
              New Property
            </button>

            <button
              type="button"
              onClick={() => router.push("/property/manage")}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <BuildingOfficeIcon className="h-4 w-4" />
              Manage Properties
            </button>

            <button
              type="button"
              onClick={handleBulkImportClick}
              className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              Bulk Import Properties
            </button>

            <button
              type="button"
              onClick={handleExportClick}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Exporting... {exportProgress ? `${exportProgress}%` : ""}</span>
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-4 w-4" />
                  <span>Export Dashboard Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <CsvImportModal
        isOpen={isImportOpen}
        type="properties"
        title="Bulk Import Properties"
        onClose={() => setIsImportOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </>
  );
}

export default PortfolioHeader;
