import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PaginationState } from "@/types";

export interface TableFooterProps {
  pagination?: PaginationState;
  selectedCount?: number;
  pageSizeOptions?: number[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const defaultPagination: PaginationState = {
  page: 1,
  pageSize: 5,
  totalCount: 8,
};

export default function TableFooter({
  pagination = defaultPagination,
  selectedCount,
  pageSizeOptions = [5, 10, 25],
  actions,
  children,
}: TableFooterProps) {
  const startRecord =
    pagination.totalCount === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalCount
  );
  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize) || 1;

  const leftSlot = actions ?? children;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-lg lg:flex-row lg:items-center lg:justify-between">
      {/* Left Slot - Custom Actions / Bulk Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedCount !== undefined && selectedCount > 0 && !leftSlot && (
          <span className="text-xs font-medium text-slate-600">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </span>
        )}
        {leftSlot}
      </div>

      {/* Right - Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            defaultValue={pagination.pageSize}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span>
            {startRecord}–{endRecord} of {pagination.totalCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagination.page <= 1}
            className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={pagination.page >= totalPages}
            className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
