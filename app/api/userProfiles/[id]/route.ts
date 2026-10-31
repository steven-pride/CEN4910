import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFormattedProfile, deleteUser } from "@/lib/users";

// 1. GET - Read single user profile
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const profile = await fetchFormattedProfile(supabase, id);
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// 2. PATCH - Update user profile & sync property assignments
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const { role, assignedPropertyIds } = body;

    // Build update payload for user_profile
    const updates: Record<string, string> = {};
    if (typeof role === "string") {
      updates.role = role;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("user_profile")
        .update(updates)
        .eq("user_id", id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }
    }

    // Handle property assignments synchronization
    if (Array.isArray(assignedPropertyIds)) {
      // 1. Fetch current assignments
      const { data: currentAssignments, error: fetchPaError } = await supabase
        .from("property_assignment")
        .select("property_id")
        .eq("user_id", id);

      if (fetchPaError) {
        return NextResponse.json(
          { error: fetchPaError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }

      const currentIds = (currentAssignments || []).map((a) => a.property_id);
      const targetIds = assignedPropertyIds.map(Number);

      const toAdd = targetIds.filter((pid) => !currentIds.includes(pid));
      const toRemove = currentIds.filter((pid) => !targetIds.includes(pid));

      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("property_assignment")
          .delete()
          .eq("user_id", id)
          .in("property_id", toRemove);

        if (removeError) {
          return NextResponse.json(
            { error: removeError.message, code: "DATABASE_ERROR" },
            { status: 500 }
          );
        }
      }

      if (toAdd.length > 0) {
        const rowsToInsert = toAdd.map((pid) => ({
          user_id: id,
          property_id: pid,
        }));

        const { error: insertError } = await supabase
          .from("property_assignment")
          .insert(rowsToInsert);

        if (insertError) {
          return NextResponse.json(
            { error: insertError.message, code: "DATABASE_ERROR" },
            { status: 500 }
          );
        }
      }
    }

    // Return the updated formatted profile
    const updatedProfile = await fetchFormattedProfile(supabase, id);
    if (!updatedProfile) {
      return NextResponse.json(
        { error: "User profile not found after update", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// 3. DELETE - Delete user profile and remove from Supabase Auth
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Remove property assignments first
    await supabase.from("property_assignment").delete().eq("user_id", id);

    // Delete user profile
    const { error: deleteError } = await supabase
      .from("user_profile")
      .delete()
      .eq("user_id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    // Delete user from Supabase Auth
    const authResult = await deleteUser(id);
    if (authResult?.error) {
      return NextResponse.json(
        { error: authResult.error, code: "AUTH_DELETE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
