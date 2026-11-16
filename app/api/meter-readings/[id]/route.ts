import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function error(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
      return error("Invalid reading ID.", "VALIDATION_ERROR", 400);
    }

    const { usage } = await request.json();
    const usageNumber = Number(usage);

    if (usage === "" || usage === null || usage === undefined || !Number.isFinite(usageNumber)) {
      return error("Usage must be a valid number.", "VALIDATION_ERROR", 400);
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("meter_reading")
      .update({ usage_quantity: usageNumber })
      .eq("meter_reading_id", readingId)
      .select("meter_reading_id, usage_quantity")
      .maybeSingle();

    if (dbError) return error(dbError.message, "DATABASE_ERROR", 500);

    if (!data) {
      return error(
        "Reading not found or you do not have permission to update it.",
        "NOT_FOUND",
        404
      );
    }

    return NextResponse.json(
      { data: { meterReadingId: data.meter_reading_id, usage: Number(data.usage_quantity) } },
      { status: 200 }
    );
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : "Internal Server Error",
      "SERVER_ERROR",
      500
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
      return error("Invalid reading ID.", "VALIDATION_ERROR", 400);
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("meter_reading")
      .delete()
      .eq("meter_reading_id", readingId)
      .select("meter_reading_id")
      .maybeSingle();

    if (dbError) return error(dbError.message, "DATABASE_ERROR", 500);

    if (!data) {
      return error(
        "Reading not found or you do not have permission to delete it.",
        "NOT_FOUND",
        404
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : "Internal Server Error",
      "SERVER_ERROR",
      500
    );
  }
}