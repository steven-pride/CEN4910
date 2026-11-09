import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// DELETE PROPERTY
// ---------------------------------------------------------------------------
async function deleteProperty(formData: FormData) {
  "use server";

  const supabase = await createClient();

  // Make sure the user is signed in.
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const propertyId = Number(formData.get("property_id"));

  if (!Number.isFinite(propertyId)) {
    redirect("/property/manage");
  }

  // Delete the property.
  // RLS still determines whether this user is actually allowed to delete it.
  const { data, error } = await supabase
    .from("property")
    .delete()
    .eq("property_id", propertyId)
    .select();

  if (error) {
    redirect(
      `/property/manage?error=${encodeURIComponent(error.message)}`
    );
  }

  // Supabase/RLS can return zero affected rows without throwing an error.
  if (!data?.length) {
    redirect(
      `/property/manage?error=${encodeURIComponent(
        "Property not found or you do not have permission to delete it."
      )}`
    );
  }

  redirect("/property/manage");
}

// ---------------------------------------------------------------------------
// PROPERTY MANAGEMENT PAGE
// ---------------------------------------------------------------------------
export default async function PropertyManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: pageError } = await searchParams;

  const supabase = await createClient();

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  // -------------------------------------------------------------------------
  // Get current user's role
  // -------------------------------------------------------------------------
  const { data: profile } = await supabase
    .from("user_profile")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return (
      <main className="p-6">
        <p>No profile found for your account.</p>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // READ PROPERTIES
  // -------------------------------------------------------------------------
  const { data: properties, error } = await supabase
    .from("property")
    .select(`
      property_id,
      property_name,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      irrigated_area,
      year_built,
      occupancy_percent,
      number_of_buildings
    `)
    .order("property_name", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load properties: {error.message}
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Role permissions
  // -------------------------------------------------------------------------
  const isAdmin = profile.role === "admin";

  const canEdit =
    profile.role === "admin" ||
    profile.role === "property_manager";

  // -------------------------------------------------------------------------
  // PAGE
  // -------------------------------------------------------------------------
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Property Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage property records stored in the database.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/property/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Property
          </Link>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {pageError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {pageError}
        </div>
      )}

      {/* PROPERTY TABLE */}
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(properties ?? []).map((property) => (
              <tr
                key={property.property_id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                {/* PROPERTY ID */}
                <td className="px-4 py-4 text-sm">
                  {property.property_id}
                </td>

                {/* PROPERTY NAME + ADDRESS */}
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-900">
                    {property.property_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {property.address_line1 || "No address"}

                    {property.address_line2
                      ? `, ${property.address_line2}`
                      : ""}
                  </p>
                </td>

                {/* LOCATION */}
                <td className="px-4 py-4 text-sm text-slate-600">
                  {[
                    property.city,
                    property.state_province,
                    property.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>

                {/* YEAR BUILT */}
                <td className="px-4 py-4 text-sm">
                  {property.year_built ?? "—"}
                </td>

                {/* OCCUPANCY */}
                <td className="px-4 py-4 text-sm">
                  {property.occupancy_percent !== null
                    ? `${property.occupancy_percent}%`
                    : "—"}
                </td>

                {/* NUMBER OF BUILDINGS */}
                <td className="px-4 py-4 text-sm">
                  {property.number_of_buildings ?? "—"}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    {/* EDIT */}
                    {canEdit && (
                      <Link
                        href={`/property/${property.property_id}/manage-edit`}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>
                    )}

                    {/* DELETE - ADMIN ONLY */}
                    {isAdmin && (
                      <form action={deleteProperty}>
                        <input
                          type="hidden"
                          name="property_id"
                          value={property.property_id}
                        />

                        <button
                          type="submit"
                          className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {(properties ?? []).length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No properties found.
          </p>
        )}
      </div>

      {/* CURRENT ROLE */}
      <p className="text-xs text-slate-500">
        Signed in as: {profile.role}
      </p>
    </main>
  );
}
