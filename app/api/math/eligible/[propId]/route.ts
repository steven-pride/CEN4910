import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ propId: string}>}) {

    const supabase = await createClient();

    const { propId } = await params;
    const id = Number(propId);
    var eligible = false;

    const { data, error } = await supabase
      .from("property_use")
      .select("gross_floor_area, weekly_operating_hours")
      .eq("property_id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    if (data.gross_floor_area >= 5000 && data.weekly_operating_hours >= 30) {
        eligible = true;
    }

    return NextResponse.json({value: eligible}, {status: 200});
}