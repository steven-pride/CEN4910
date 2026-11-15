import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("unit")
      .select("unit_id, unit_name")
      .order("unit_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: (data ?? []).map((u) => ({ unitId: u.unit_id, name: u.unit_name })) },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}