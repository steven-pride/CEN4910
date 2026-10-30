import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatUserProfileRow, UserProfileRow } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "All";
    const propertyId = searchParams.get("propertyId") || "All";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));

    // Handle property filter by looking up user_ids assigned to that property
    let allowedUserIds: string[] | null = null;
    if (propertyId !== "All" && propertyId !== "") {
      const { data: assignments, error: assignError } = await supabase
        .from("property_assignment")
        .select("user_id")
        .eq("property_id", Number(propertyId));

      if (assignError) {
        return NextResponse.json(
          { error: assignError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }

      allowedUserIds = (assignments || []).map((a) => a.user_id);
      if (allowedUserIds.length === 0) {
        return NextResponse.json(
          {
            data: [],
            pagination: {
              page,
              pageSize,
              totalCount: 0,
              totalPages: 1,
            },
          },
          { status: 200 }
        );
      }
    }

    // Build user_profile query
    let query = supabase
      .from("user_profile")
      .select(
        "user_id, email, role, created_at, property_assignment(property_id, property(property_id, property_name))",
        { count: "exact" }
      );

    if (allowedUserIds !== null) {
      query = query.in("user_id", allowedUserIds);
    }

    if (role !== "All" && role !== "") {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const formattedUsers = ((data as unknown as UserProfileRow[]) || []).map(
      formatUserProfileRow
    );

    return NextResponse.json(
      {
        data: formattedUsers,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
      },
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
