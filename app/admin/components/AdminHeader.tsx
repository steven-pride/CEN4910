import Link from "next/link";
import {
  PlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface AdminHeaderProps {
  totalActiveCount?: number;
}

export default function AdminHeader({
  totalActiveCount,
}: AdminHeaderProps) {
  return (
    <header className="flex flex-col gap-2 pb-6 border-b border-slate-200">
      {/* Category Sub-heading */}
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
        <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
        <span>ACCESS GOVERNANCE</span>
      </div>

      {/* Main Heading and Global Action Triggers */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Management & Access Control
          </h1>
          {totalActiveCount !== undefined && totalActiveCount > 0 && (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {totalActiveCount} Active Team Members
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
