"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeterReading = {
  meterReadingId: number;
  meterId: number;
  startDate: string | null;
  endDate: string | null;
  usageQuantity: number | null;
  unit: number | null;
  cost: number | null;
};

export default function ReadingManagementPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadReadings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/readings", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load meter readings."
        );
      }

      setReadings(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load meter readings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReadings();
  }, []);

  async function handleDelete(meterReadingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meter reading?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(meterReadingId);
      setError("");

      const response = await fetch(
        `/api/readings/${meterReadingId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to delete meter reading."
        );
      }

      setReadings((currentReadings) =>
        currentReadings.filter(
          (reading) =>
            reading.meterReadingId !== meterReadingId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete meter reading."
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
            Meter Reading Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage meter reading records stored in the database.
          </p>
        </div>

        <Link
          href="/reading/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Reading
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading meter readings...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-100 text-left">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Reading ID</th>
                <th className="px-4 py-3">Meter ID</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {readings.map((reading) => (
                <tr
                  key={reading.meterReadingId}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 text-sm">
                    {reading.meterReadingId}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.meterId}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.startDate || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.endDate || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.usageQuantity ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.unit ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {reading.cost !== null
                      ? `$${Number(reading.cost).toFixed(2)}`
                      : "—"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/reading/${reading.meterReadingId}/manage-edit`}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(reading.meterReadingId)
                        }
                        disabled={
                          deletingId === reading.meterReadingId
                        }
                        className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === reading.meterReadingId
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {readings.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No meter readings found.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
