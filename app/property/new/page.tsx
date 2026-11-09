import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function createProperty(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const propertyName = String(formData.get("property_name") || "").trim();

  if (!propertyName) {
    redirect("/property/new?error=Property name is required");
  }

  const numberValue = (name: string) => {
    const value = String(formData.get(name) || "").trim();

    if (!value) {
      return null;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? null : parsed;
  };

  const { error } = await supabase.from("property").insert({
    property_name: propertyName,
    address_line1:
      String(formData.get("address_line1") || "").trim() || null,
    address_line2:
      String(formData.get("address_line2") || "").trim() || null,
    city:
      String(formData.get("city") || "").trim() || null,
    state_province:
      String(formData.get("state_province") || "").trim() || null,
    postal_code:
      String(formData.get("postal_code") || "").trim() || null,
    irrigated_area: numberValue("irrigated_area"),
    year_built: numberValue("year_built"),
    occupancy_percent: numberValue("occupancy_percent"),
    number_of_buildings: numberValue("number_of_buildings"),
  });

  if (error) {
    redirect(`/property/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/property/manage");
}

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (profile?.role !== "admin") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Only administrators can create properties.
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
        action={createProperty}
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
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Property
          </button>
        </div>
      </form>
    </main>
  );
}
