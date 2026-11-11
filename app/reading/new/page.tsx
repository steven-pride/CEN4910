"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReadingPage() {
  const router = useRouter();

  const [meterId, setMeterId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageQuantity, setUsageQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!meterId.trim()) {
        setError("Meter ID is required.");
        return;
      }

      const response = await fetch("/api/readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meterId,
          startDate,
          endDate,
          usageQuantity,
          unit,
          cost,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create meter reading."
        );
      }

      router.push("/reading/manage");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create meter reading."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link
          href="/reading/manage"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Meter Readings
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          New Meter Reading
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new reading for an existing meter.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="meterId"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Meter ID *
          </label>

          <input
            id="meterId"
            type="number"
            min="1"
            required
            value={meterId}
            onChange={(event) => setMeterId(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Enter an existing meter ID"
          />

          <p className="mt-1 text-xs text-slate-500">
            The meter must already exist in the database.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="startDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Start Date
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              End Date
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="usageQuantity"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Usage Quantity
          </label>

          <input
            id="usageQuantity"
            type="number"
            step="any"
            value={usageQuantity}
            onChange={(event) =>
              setUsageQuantity(event.target.value)
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Example: 1250.5"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="unit"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Unit
            </label>

            <input
              id="unit"
              type="number"
              step="any"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Leave blank if auto-filled"
            />

            <p className="mt-1 text-xs text-slate-500">
              You may leave this blank if the database uses the
              meter&apos;s default unit.
            </p>
          </div>

          <div>
            <label
              htmlFor="cost"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Cost
            </label>

            <input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Example: 250.75"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
          <Link
            href="/reading/manage"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Reading"}
          </button>
        </div>
      </form>
    </main>
  );
}
