"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMeterPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  function numberValue(formData: FormData, name: string) {
    const value = String(formData.get(name) || "").trim();

    if (!value) {
      return null;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? null : parsed;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData(event.currentTarget);

      const propertyId = numberValue(
        formData,
        "property_id"
      );

      const meterName = String(
        formData.get("meter_name") || ""
      ).trim();

      if (propertyId === null) {
        setError("Property ID is required.");
        return;
      }

      if (!meterName) {
        setError("Meter name is required.");
        return;
      }

      const payload = {
        propertyId,
        meterName,

        meterType: String(
          formData.get("meter_type") || ""
        ).trim(),

        defaultUnit: numberValue(
          formData,
          "default_unit"
        ),

        activeDate: String(
          formData.get("active_date") || ""
        ).trim(),

        inactiveDate: String(
          formData.get("inactive_date") || ""
        ).trim(),
      };

      const response = await fetch("/api/meters", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create meter."
        );
      }

      router.push("/meter/manage");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create meter."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/meter/manage"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Meter Management
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          New Meter
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new meter record.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="property_id"
              className="text-sm font-semibold text-slate-700"
            >
              Property ID *
            </label>

            <input
              id="property_id"
              name="property_id"
              type="number"
              min="1"
              required
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-500">
              Enter the ID of the property this meter
              belongs to.
            </p>
          </div>

          <div>
            <label
              htmlFor="meter_name"
              className="text-sm font-semibold text-slate-700"
            >
              Meter Name *
            </label>

            <input
              id="meter_name"
              name="meter_name"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="meter_type"
              className="text-sm font-semibold text-slate-700"
            >
              Meter Type
            </label>

            <input
              id="meter_type"
              name="meter_type"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="default_unit"
              className="text-sm font-semibold text-slate-700"
            >
              Default Unit
            </label>

            <input
              id="default_unit"
              name="default_unit"
              type="number"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="active_date"
              className="text-sm font-semibold text-slate-700"
            >
              Active Date
            </label>

            <input
              id="active_date"
              name="active_date"
              type="date"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="inactive_date"
              className="text-sm font-semibold text-slate-700"
            >
              Inactive Date
            </label>

            <input
              id="inactive_date"
              name="inactive_date"
              type="date"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Link
            href="/meter/manage"
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Meter"}
          </button>
        </div>
      </form>
    </main>
  );
}
