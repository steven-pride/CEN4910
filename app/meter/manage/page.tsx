"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Meter = {
  meterId: number;
  propertyId: number;
  meterName: string;
  meterType: string | null;
  defaultUnit: number | null;
  activeDate: string | null;
  inactiveDate: string | null;
};

export default function MeterManagementPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadMeters() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/meters", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load meters."
        );
      }

      setMeters(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load meters."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeters();
  }, []);

  async function handleDelete(meterId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meter?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(meterId);
      setError("");

      const response = await fetch(
        `/api/meters/${meterId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to delete meter."
        );
      }

      setMeters((currentMeters) =>
        currentMeters.filter(
          (meter) => meter.meterId !== meterId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete meter."
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
            Meter Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage meter records stored in the database.
          </p>
        </div>

        <Link
          href="/meter/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Meter
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading meters...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-100 text-left">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Meter ID</th>
                <th className="px-4 py-3">Property ID</th>
                <th className="px-4 py-3">Meter Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default Unit</th>
                <th className="px-4 py-3">Active Date</th>
                <th className="px-4 py-3">Inactive Date</th>
                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {meters.map((meter) => (
                <tr
                  key={meter.meterId}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 text-sm">
                    {meter.meterId}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {meter.propertyId}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {meter.meterName}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {meter.meterType || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {meter.defaultUnit ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {meter.activeDate || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {meter.inactiveDate || "—"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/meter/${meter.meterId}/manage-edit`}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(meter.meterId)
                        }
                        disabled={
                          deletingId === meter.meterId
                        }
                        className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === meter.meterId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meters.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No meters found.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
