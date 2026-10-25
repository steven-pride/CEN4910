import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Endpoint temporal, exclusivo para pruebas locales.
  const hostname = request.nextUrl.hostname;

  if (
    process.env.NODE_ENV !== "development" ||
    !["localhost", "127.0.0.1"].includes(hostname)
  ) {
    return NextResponse.json(
      { error: "Not available" },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("building_energy_metrics")
    .select("id, building_name, eui, target_eui")
    .order("building_name");

  if (error) {
  console.error("Supabase query failed:", {
    code: error.code,
    message: error.message,
  });

  return NextResponse.json(
    { error: "Unable to load building metrics" },
    { status: 500 }
  );
}

  return NextResponse.json(data);
}