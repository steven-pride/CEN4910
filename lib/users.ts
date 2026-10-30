import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export interface PropertyItem {
  property_id: number;
  property_name: string;
}

export interface PropertyAssignmentItem {
  property_id: number;
  property_name?: string;
  property?: PropertyItem | PropertyItem[] | null;
}

export interface UserProfileRow {
  user_id: string;
  email: string;
  role?: string | null;
  created_at?: string | null;
  property_assignment?: PropertyAssignmentItem[] | null;
}

export function formatUserProfileRow(row: UserProfileRow) {
  const assignments = (row.property_assignment || []).map((pa) => {
    const prop = Array.isArray(pa.property) ? pa.property[0] : pa.property;
    return {
      id: pa.property_id,
      name: prop?.property_name || pa.property_name || `Property #${pa.property_id}`,
    };
  });

  const email = row.email || "";
  const nameFromEmail = email ? email.split("@")[0] : "User";

  return {
    id: row.user_id,
    fullName: nameFromEmail,
    email: row.email,
    role: (row.role || "analyzer") as UserRole,
    status: "Active" as const,
    assignedBuildings: assignments,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchFormattedProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
) {
  const { data, error } = await supabase
    .from("user_profile")
    .select(
      "user_id, email, role, created_at, property_assignment(property_id, property(property_id, property_name))"
    )
    .eq("user_id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return formatUserProfileRow(data as unknown as UserProfileRow);
}
