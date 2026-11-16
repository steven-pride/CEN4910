import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COLUMNS =
  "meter_reading_id, start_date, end_date, usage_quantity, unit, cost";

function error(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

async function loadUnitNames(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("unit").select("unit_id, unit_name");
  if (error) throw new Error(error.message);
  return new Map<number, string>((data ?? []).map((u) => [u.unit_id, u.unit_name]));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meterId = Number(id);

    if (!Number.isFinite(meterId)) {
      return error("Invalid meter ID.", "VALIDATION_ERROR", 400);
    }

    const limit = Math.min(
      Math.max(Number(request.nextUrl.searchParams.get("limit")) || 12, 1),
      100
    );

    const supabase = await createClient();

    const { data: readings, error: dbError } = await supabase
      .from("meter_reading")
      .select(COLUMNS)
      .eq("meter_id", meterId)
      .order("start_date", { ascending: false })
      .limit(limit);

    if (dbError) return error(dbError.message, "DATABASE_ERROR", 500);

    const unitNames = await loadUnitNames(supabase);

    const data = (readings ?? []).map((r) => ({
      meterReadingId: r.meter_reading_id,
      startDate: r.start_date,
      endDate: r.end_date,
      usage: Number(r.usage_quantity),
      unitId: r.unit,
      unit: unitNames.get(r.unit) ?? null,
      cost: r.cost !== null ? Number(r.cost) : null,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : "Internal Server Error",
      "SERVER_ERROR",
      500
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meterId = Number(id);

    if (!Number.isFinite(meterId)) {
      return error("Invalid meter ID.", "VALIDATION_ERROR", 400);
    }

    const body = await request.json();
    const { startDate, endDate, usage, unitId, cost } = body;

    if (!startDate) {
      return error("Start date is required.", "VALIDATION_ERROR", 400);
    }

    if (endDate && endDate < startDate) {
      return error("End date cannot be before start date.", "VALIDATION_ERROR", 400);
    }

    const usageNumber = Number(usage);
    if (usage === "" || usage === null || usage === undefined || !Number.isFinite(usageNumber)) {
      return error("Usage must be a valid number.", "VALIDATION_ERROR", 400);
    }

    const unitNumber = Number(unitId);
    if (unitId === "" || unitId === null || unitId === undefined || !Number.isFinite(unitNumber)) {
      return error("Unit is required.", "VALIDATION_ERROR", 400);
    }

    const costNumber =
      cost === "" || cost === null || cost === undefined ? null : Number(cost);

    if (costNumber !== null && !Number.isFinite(costNumber)) {
      return error("Cost must be a valid number.", "VALIDATION_ERROR", 400);
    }

    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("meter_reading")
      .insert({
        meter_id: meterId,
        start_date: startDate,
        end_date: endDate || null,
        usage_quantity: usageNumber,
        unit: unitNumber,
        cost: costNumber,
      })
      .select(COLUMNS)
      .single();

    if (dbError) return error(dbError.message, "DATABASE_ERROR", 500);

    return NextResponse.json(
      {
        data: {
          meterReadingId: data.meter_reading_id,
          startDate: data.start_date,
          endDate: data.end_date,
          usage: Number(data.usage_quantity),
          unitId: data.unit,
          unit: null,
          cost: data.cost !== null ? Number(data.cost) : null,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : "Internal Server Error",
      "SERVER_ERROR",
      500
    );
  }
}