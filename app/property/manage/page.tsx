"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Property = {
  propertyId: number;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  irrigatedArea: number | null;
  yearBuilt: number | null;
  occupancyPercent: number | null;
  numberOfBuildings: number | null;
};

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/properties", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load properties."
        );
      }

      setProperties(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  async function handleDelete(propertyId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(propertyId);
      setError("");

      const response = await fetch(
        `/api/properties/${propertyId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to delete property."
        );
      }

      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) => property.propertyId !== propertyId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete property."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Property Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage property records stored in the database.
          </p>
        </div>

        <Link
          href="/property/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Property
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading properties...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-100 text-left">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Year Built</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3">Buildings</th>
                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {properties.map((property) => (
                <tr
                  key={property.propertyId}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 text-sm">
                    {property.propertyId}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {property.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {property.addressLine1 || "No address"}
                      {property.addressLine2
                        ? `, ${property.addressLine2}`
                        : ""}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {[
                      property.city,
                      property.stateProvince,
                      property.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {property.yearBuilt ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {property.occupancyPercent !== null
                      ? `${property.occupancyPercent}%`
                      : "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {property.numberOfBuildings ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/property/${property.propertyId}/manage-edit`}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(property.propertyId)
                        }
                        disabled={
                          deletingId === property.propertyId
                        }
                        className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === property.propertyId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {properties.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No properties found.
            </p>
          )}
        </div>
      )}
    </main>
  );
}