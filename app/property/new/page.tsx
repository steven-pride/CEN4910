"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
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

      const name = String(
        formData.get("property_name") || ""
      ).trim();

      if (!name) {
        setError("Property name is required.");
        return;
      }

      const payload = {
        name,
        addressLine1: String(
          formData.get("address_line1") || ""
        ).trim(),
        addressLine2: String(
          formData.get("address_line2") || ""
        ).trim(),
        city: String(
          formData.get("city") || ""
        ).trim(),
        stateProvince: String(
          formData.get("state_province") || ""
        ).trim(),
        postalCode: String(
          formData.get("postal_code") || ""
        ).trim(),
        irrigatedArea: numberValue(
          formData,
          "irrigated_area"
        ),
        yearBuilt: numberValue(
          formData,
          "year_built"
        ),
        occupancyPercent: numberValue(
          formData,
          "occupancy_percent"
        ),
        numberOfBuildings: numberValue(
          formData,
          "number_of_buildings"
        ),
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create property."
        );
      }

      router.push("/property/manage");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create property."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/property/manage"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Property Management
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          New Property
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new property record.
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
        <div>
          <label
            htmlFor="property_name"
            className="text-sm font-semibold text-slate-700"
          >
            Property Name *
          </label>

          <input
            id="property_name"
            name="property_name"
            required
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="address_line1"
              className="text-sm font-semibold text-slate-700"
            >
              Address Line 1
            </label>

            <input
              id="address_line1"
              name="address_line1"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="address_line2"
              className="text-sm font-semibold text-slate-700"
            >
              Address Line 2
            </label>

            <input
              id="address_line2"
              name="address_line2"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="text-sm font-semibold text-slate-700"
            >
              City
            </label>

            <input
              id="city"
              name="city"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="state_province"
              className="text-sm font-semibold text-slate-700"
            >
              State / Province
            </label>

            <input
              id="state_province"
              name="state_province"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="postal_code"
              className="text-sm font-semibold text-slate-700"
            >
              Postal Code
            </label>

            <input
              id="postal_code"
              name="postal_code"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="year_built"
              className="text-sm font-semibold text-slate-700"
            >
              Year Built
            </label>

            <input
              id="year_built"
              name="year_built"
              type="number"
              min="1800"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="occupancy_percent"
              className="text-sm font-semibold text-slate-700"
            >
              Occupancy (%)
            </label>

            <input
              id="occupancy_percent"
              name="occupancy_percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="number_of_buildings"
              className="text-sm font-semibold text-slate-700"
            >
              Number of Buildings
            </label>

            <input
              id="number_of_buildings"
              name="number_of_buildings"
              type="number"
              min="0"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="irrigated_area"
              className="text-sm font-semibold text-slate-700"
            >
              Irrigated Area
            </label>

            <input
              id="irrigated_area"
              name="irrigated_area"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Link
            href="/property/manage"
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </main>
  );
}