import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUserRole } from "@/lib/property-permissions";
import type { UserRole } from "@/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type UserAuthorization = {
  userId: string;
  role: UserRole;
  assignedPropertyIds: number[];
};

export type AuthorizationFailure = "unauthenticated" | "forbidden" | "error";

export type RequestAuthorization =
  | {
      supabase: SupabaseServerClient;
      authorization: UserAuthorization;
      failure: null;
    }
  | {
      supabase: SupabaseServerClient;
      authorization: null;
      failure: AuthorizationFailure;
    };

export async function getRequestAuthorization(): Promise<RequestAuthorization> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { supabase, authorization: null, failure: "error" };
  }

  if (!user) {
    return { supabase, authorization: null, failure: "unauthenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("role, property_assignment(property_id)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return { supabase, authorization: null, failure: "error" };
  }

  if (!profile || !isUserRole(profile.role)) {
    return { supabase, authorization: null, failure: "forbidden" };
  }

  const assignments = profile.property_assignment ?? [];
  const assignedPropertyIds = assignments
    .map((assignment) => assignment.property_id)
    .filter((propertyId) => propertyId !== null && propertyId !== undefined)
    .map((propertyId) => Number(propertyId))
    .filter((propertyId) => Number.isSafeInteger(propertyId) && propertyId > 0);

  return {
    supabase,
    authorization: {
      userId: user.id,
      role: profile.role,
      assignedPropertyIds,
    },
    failure: null,
  };
}

export function authorizationFailureResponse(failure: AuthorizationFailure) {
  if (failure === "unauthenticated") {
    return NextResponse.json(
      { error: "Authentication is required.", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  if (failure === "forbidden") {
    return NextResponse.json(
      { error: "You do not have permission to access this resource.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { error: "Unable to verify authorization.", code: "AUTHORIZATION_ERROR" },
    { status: 500 }
  );
}
