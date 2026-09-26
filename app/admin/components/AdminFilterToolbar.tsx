import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function AdminFilterToolbar() {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-60">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <MagnifyingGlassIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email or building..."
          className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          defaultValue="All"
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Property Manager">Property Manager</option>
          <option value="Read-Only Analyst">Read-Only Analyst</option>
        </select>

        <select
          defaultValue="All"
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Properties</option>
          <option value="Orlando City Hall">Orlando City Hall</option>
          <option value="Orange County Convention Center">Orange County Convention Center</option>
          <option value="Dr. Phillips Center">Dr. Phillips Center</option>
          <option value="Amway Center">Amway Center</option>
          <option value="Citrus Center">Citrus Center</option>
          <option value="SunTrust Center">SunTrust Center</option>
        </select>

        <select
          defaultValue="All"
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
        </select>

        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Toggle advanced filters"
          aria-label="Toggle advanced filters"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
