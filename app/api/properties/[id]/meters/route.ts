import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (!Number.isFinite(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get("q") ?? "").trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = await createClient();

    let query = supabase
      .from("meter")
      .select(
        "meter_id, property_id, meter_name, meter_type, default_unit, active_date, inactive_date",
        { count: "exact" }
      )
      .eq("property_id", propertyId)
      .order("meter_name", { ascending: true })
      .range(from, to);

    if (q) {
      // Escape LIKE wildcards so "50%" is searched literally.
      const escaped = q.replace(/[\\%_]/g, "\\$&");
      query = query.ilike("meter_name", `%${escaped}%`);
    }

    const { data: meters, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    // Unit names (small lookup table)
    const { data: units, error: unitError } = await supabase
      .from("unit")
      .select("unit_id, unit_name");

    if (unitError) {
      return NextResponse.json(
        { error: unitError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const unitNames = new Map<number, string>(
      (units ?? []).map((u) => [u.unit_id, u.unit_name])
    );

    // Latest reading for each meter on this page (one small query per meter)
    const readingResults = await Promise.all(
      (meters ?? []).map((meter) =>
        supabase
          .from("meter_reading")
          .select("meter_id, end_date, usage_quantity, unit, cost")
          .eq("meter_id", meter.meter_id)
          .order("end_date", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle()
      )
    );

    const readingError = readingResults.find((r) => r.error)?.error;

    if (readingError) {
      return NextResponse.json(
        { error: readingError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const items = (meters ?? []).map((meter, index) => {
      const reading = readingResults[index].data;

      let status: "active" | "inactive" | "pending" = "active";
      if (meter.inactive_date && meter.inactive_date <= today) {
        status = "inactive";
      } else if (meter.active_date && meter.active_date > today) {
        status = "pending";
      }

      return {
        meterId: meter.meter_id,
        name: meter.meter_name,
        type: meter.meter_type,
        defaultUnit:
          meter.default_unit !== null
            ? unitNames.get(meter.default_unit) ?? null
            : null,
        defaultUnitId: meter.default_unit,
        status,
        activeDate: meter.active_date,
        inactiveDate: meter.inactive_date,
        lastReading: reading
          ? {
              endDate: reading.end_date,
              usage: Number(reading.usage_quantity),
              unit: unitNames.get(reading.unit) ?? null,
              cost: reading.cost !== null ? Number(reading.cost) : null,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        data: { items, total: count ?? 0, page, pageSize: PAGE_SIZE },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}