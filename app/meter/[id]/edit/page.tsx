"use client";

import Link from "next/link";
import {
  FormEvent,
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Meter = {
  meterId: number;
  propertyId: number;
  meterName: string;
  meterType: string | null;
  defaultUnit: number | null;
  activeDate: string | null;
  inactiveDate: string | null;
};

export default function EditMeterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [meter, setMeter] = useState<Meter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  useEffect(() => {
    async function loadMeter() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/meters/${id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load meter."
          );
        }

        setMeter(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load meter."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeter();
  }, [id]);

  function numberValue(
    formData: FormData,
    name: string
  ) {
    const value = String(
      formData.get(name) || ""
    ).trim();

    if (!value) {
      return null;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed)
      ? null
      : parsed;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData(
        event.currentTarget
      );

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

      const response = await fetch(
        `/api/meters/${id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update meter."
        );
      }

      router.push("/meter/manage");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update meter."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading meter...
        </div>
      </main>
    );
  }

  if (!meter) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Meter not found."}
        </div>

        <Link
          href="/meter/manage"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Meter Management
        </Link>
      </main>
    );
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
          Edit Meter
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update meter #{meter.meterId}.
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
              defaultValue={meter.propertyId}
              className={inputClass}
            />
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
              defaultValue={meter.meterName}
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
              defaultValue={
                meter.meterType ?? ""
              }
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
              defaultValue={
                meter.defaultUnit ?? ""
              }
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
              defaultValue={
                meter.activeDate ?? ""
              }
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
              defaultValue={
                meter.inactiveDate ?? ""
              }
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
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
