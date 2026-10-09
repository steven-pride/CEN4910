"use client";

import React, { useMemo, useState } from "react";
import {
  BuildingOfficeIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { managedProperties as defaultProperties, type ManagedProperty } from "@/data/mockProperties";

export interface ManagedPropertiesTableProps {
  properties?: ManagedProperty[];
}

export function ManagedPropertiesTable({
  properties = defaultProperties,
}: ManagedPropertiesTableProps) {
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("All Occupancies");
  const [energyFilter, setEnergyFilter] = useState("Energy Status: All");

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const q = search.toLowerCase();
      const matchesSearch =
        property.name.toLowerCase().includes(q) ||
        property.address.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (occupancyFilter === "70% - 80%" && (property.occupancy < 70 || property.occupancy >= 80)) {
        return false;
      }
      if (occupancyFilter === "80% - 90%" && (property.occupancy < 80 || property.occupancy >= 90)) {
        return false;
      }
      if (occupancyFilter === "90%+" && property.occupancy < 90) {
        return false;
      }

      if (energyFilter === "Excellent" && property.scoreStyle !== "excellent") {
        return false;
      }
      if (energyFilter === "Good" && property.scoreStyle !== "good") {
        return false;
      }
      if (energyFilter === "Warning" && property.scoreStyle !== "warning") {
        return false;
      }

      return true;
    });
  }, [properties, search, occupancyFilter, energyFilter]);

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Managed Properties List</h2>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties or city..."
              className="w-full min-w-[240px] rounded-md bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <select
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            className="rounded-md bg-slate-100 px-5 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option>All Occupancies</option>
            <option>70% - 80%</option>
            <option>80% - 90%</option>
            <option>90%+</option>
          </select>

          <select
            value={energyFilter}
            onChange={(e) => setEnergyFilter(e.target.value)}
            className="rounded-md bg-slate-100 px-5 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option>Energy Status: All</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Warning</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full">
          <thead className="bg-slate-100 text-left">
            <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
              <th className="px-6 py-4">Property Name</th>
              <th className="px-4 py-4">Sq Ft</th>
              <th className="px-4 py-4">Work Hours</th>
              <th className="px-4 py-4">Occupancy %</th>
              <th className="px-4 py-4">Energy Score</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProperties.map((property) => (
              <tr
                key={property.id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-blue-600">
                      <BuildingOfficeIcon className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {property.name}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {property.address}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="text-sm font-medium">
                    {property.sqft} sq
                  </p>
                  <p className="text-sm">ft</p>
                </td>

                <td className="px-4 py-4">
                  <div className="inline-flex max-w-[165px] items-center gap-2 rounded bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-600">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                    {property.hours}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div
                        style={{ width: `${property.occupancy}%` }}
                        className={`h-full rounded-full ${
                          property.occupancy < 80
                            ? "bg-slate-600"
                            : "bg-blue-600"
                        }`}
                      />
                    </div>

                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-900">
                      {property.occupancy}%
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div
                    className={`inline-flex max-w-[190px] items-center gap-1.5 rounded px-3 py-2 text-xs font-bold ${
                      property.scoreStyle === "warning"
                        ? "bg-red-100 text-red-700"
                        : property.scoreStyle === "excellent"
                          ? "bg-cyan-100 text-slate-900"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>
                      {property.scoreStyle === "warning" ? "⚠" : "◎"}
                    </span>

                    {property.score}/100
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="min-w-[120px] rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      View Dashboard
                    </button>

                    <button
                      type="button"
                      className="rounded-md bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      aria-label="More actions"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 text-sm sm:flex-row">
        <span className="text-slate-600">
          Showing 1 to {filteredProperties.length} of {properties.length} entries
        </span>

        <div className="flex gap-1">
          <button
            type="button"
            disabled
            className="rounded bg-slate-100 px-3 py-2 text-xs text-slate-400"
          >
            Prev
          </button>

          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-2 text-xs font-bold text-white"
          >
            1
          </button>

          <button
            type="button"
            className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            2
          </button>

          <button
            type="button"
            className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            3
          </button>

          <button
            type="button"
            className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default ManagedPropertiesTable;
