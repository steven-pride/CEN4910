
"use client";

import React, { useMemo, useState } from "react";

import {
  BuildingOfficeIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import {
  dashboardProperties,
  type DashboardProperty,
} from "@/data/dashboardProperties";

export interface ManagedPropertiesTableProps {
  properties?: DashboardProperty[];
}

// Temporary benchmark target for demonstration.
const TARGET_EUI = 65;
const PAGE_SIZE = 5;

export function ManagedPropertiesTable({
  properties = dashboardProperties,
}: ManagedPropertiesTableProps) {
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] =
    useState("all");
  const [energyFilter, setEnergyFilter] =
    useState("all");
  const [page, setPage] = useState(1);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(query) ||
        (property.address ?? "")
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) return false;

      const occupancy = property.occupancyPercent;

      if (
        occupancyFilter === "missing" &&
        occupancy !== null
      ) {
        return false;
      }

      if (
        occupancyFilter === "available" &&
        occupancy === null
      ) {
        return false;
      }

      const eui = property.eui;

      if (
        energyFilter === "below" &&
        (eui === null || eui > TARGET_EUI)
      ) {
        return false;
      }

      if (
        energyFilter === "above" &&
        (eui === null || eui <= TARGET_EUI)
      ) {
        return false;
      }

      if (
        energyFilter === "missing" &&
        eui !== null
      ) {
        return false;
      }

      return true;
    });
  }, [
    properties,
    search,
    occupancyFilter,
    energyFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const visibleProperties = filteredProperties.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center">
        <div>
          <div className="flex items-center gap-2">
            <DocumentIcon className="h-5 w-5 text-blue-600" />

            <h2 className="text-xl font-bold">
              Managed Properties List
            </h2>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Demonstration data based on the property
            and property_use model.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-2 md:flex-row">

          <div className="relative">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />

            <input
              aria-label="Search properties"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search properties..."
              className="w-full min-w-[200px] rounded-md bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            aria-label="Filter occupancy"
            value={occupancyFilter}
            onChange={(event) => {
              setOccupancyFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-md bg-slate-100 px-3 py-2.5 text-sm"
          >
            <option value="all">All Occupancies</option>
            <option value="available">With Occupancy Data</option>
            <option value="missing">Missing Occupancy Data</option>
          </select>

          <select
            aria-label="Filter energy status"
            value={energyFilter}
            onChange={(event) => {
              setEnergyFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-md bg-slate-100 px-3 py-2.5 text-sm"
          >
            <option value="all">Energy Status: All</option>
            <option value="below">At or Below Target</option>
            <option value="above">Above Target</option>
            <option value="missing">Missing EUI</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">

          <thead className="bg-slate-100 text-left">
            <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
              <th className="px-6 py-4">Property Name</th>
              <th className="px-4 py-4">Gross Floor Area</th>
              <th className="px-4 py-4">Weekly Hours</th>
              <th className="px-4 py-4">Occupancy</th>
              <th className="px-4 py-4">Building EUI</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleProperties.map((property) => {
              const eui = property.eui;

              const aboveTarget =
                eui !== null && eui > TARGET_EUI;

              return (
                <tr
                  key={property.propertyId}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  {/* PROPERTY NAME */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-blue-600">
                        <BuildingOfficeIcon className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {property.name}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPinIcon className="h-3.5 w-3.5" />

                          {property.address ?? "Address not available"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* FLOOR AREA */}
                  <td className="px-4 py-4 text-sm">
                    {property.grossFloorArea > 0
                      ? `${property.grossFloorArea.toLocaleString("en-US")} sq ft`
                      : "—"}
                  </td>

                  {/* WORK HOURS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <ClockIcon className="h-4 w-4" />

                      {property.weeklyOperatingHours !== null
                        ? `${property.weeklyOperatingHours} hrs/week`
                        : "—"}
                    </div>
                  </td>

                  {/* OCCUPANCY */}
                  <td className="px-4 py-4">
                    {property.occupancyPercent !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-20 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  property.occupancyPercent
                                )
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs font-bold">
                          {property.occupancyPercent.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* EUI */}
                  <td className="px-4 py-4">
                    {eui !== null ? (
                      <span
                        className={`inline-flex rounded px-3 py-2 text-xs font-bold ${
                          aboveTarget
                            ? "bg-red-100 text-red-700"
                            : "bg-cyan-100 text-cyan-800"
                        }`}
                      >
                        {eui.toFixed(1)} kBtu/sq ft
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled
                        title="Property details integration pending"
                        className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-500"
                      >
                        View Dashboard
                      </button>

                      <button
                        type="button"
                        disabled
                        title="Property editing integration pending"
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProperties.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No properties match the selected filters.
          </p>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-5 text-sm sm:flex-row">

        <span className="text-slate-600">
          {filteredProperties.length === 0
            ? "Showing 0 entries"
            : `Showing ${startIndex + 1} to ${
                startIndex + visibleProperties.length
              } of ${filteredProperties.length} entries`}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-2 text-xs font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default ManagedPropertiesTable;
