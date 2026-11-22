import { NextRequest, NextResponse } from "next/server";
import {
  authorizationFailureResponse,
  getRequestAuthorization,
} from "@/lib/auth";
import { canViewProperty } from "@/lib/property-permissions";

// Only meters whose meter_type matches are counted as "energy".
// Adjust to match the values you actually store in meter.meter_type.
const ENERGY_METER_TYPES = /electric|gas|steam|energy|heat|fuel|solar/i;

const READ_PAGE_SIZE = 1000; // Supabase returns at most 1000 rows per request

function parseRangeMonths(range: string) {
  const match = /^(\d+)m$/i.exec(range);
  if (match) return Math.min(Math.max(Number(match[1]), 1), 60);

  if (range.toLowerCase() === "ytd") {
    return new Date().getUTCMonth() + 1;
  }

  return 12;
}

function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

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

    const months = parseRangeMonths(
      request.nextUrl.searchParams.get("range") ?? "12m"
    );

    const { supabase, authorization, failure } = await getRequestAuthorization();

    if (failure) return authorizationFailureResponse(failure);

    if (
      !canViewProperty(
        authorization.role,
        authorization.assignedPropertyIds,
        propertyId
      )
    ) {
      return NextResponse.json(
        { error: "Property not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Build the list of month buckets, oldest first.
    const now = new Date();
    const buckets: { key: string; year: number; monthIndex: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );
      buckets.push({
        key: monthKey(d.getUTCFullYear(), d.getUTCMonth()),
        year: d.getUTCFullYear(),
        monthIndex: d.getUTCMonth(),
      });
    }

    const startDate = `${buckets[0].key}-01`;

    // 1. This property's energy meters
    const { data: meters, error: meterError } = await supabase
      .from("meter")
      .select("meter_id, meter_type")
      .eq("property_id", propertyId);

    if (meterError) {
      return NextResponse.json(
        { error: meterError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const meterIds = (meters ?? [])
      .filter((m) => ENERGY_METER_TYPES.test(m.meter_type ?? ""))
      .map((m) => m.meter_id);

    // 2. Unit conversion factors
    const { data: units, error: unitError } = await supabase
      .from("unit")
      .select("unit_id, conversion_value");

    if (unitError) {
      return NextResponse.json(
        { error: unitError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const factors = new Map<number, number>(
      (units ?? []).map((u) => [
        u.unit_id,
        u.conversion_value !== null ? Number(u.conversion_value) : 1,
      ])
    );

    // 3. Readings in range (paged, to get past the 1000-row limit)
    const totals = new Map<string, number>(buckets.map((b) => [b.key, 0]));

    if (meterIds.length > 0) {
      let offset = 0;

      while (true) {
        const { data: readings, error: readingError } = await supabase
          .from("meter_reading")
          .select("start_date, usage_quantity, unit")
          .in("meter_id", meterIds)
          .gte("start_date", startDate)
          .order("start_date", { ascending: true })
          .range(offset, offset + READ_PAGE_SIZE - 1);

        if (readingError) {
          return NextResponse.json(
            { error: readingError.message, code: "DATABASE_ERROR" },
            { status: 500 }
          );
        }

        for (const reading of readings ?? []) {
          // Each reading is counted in the month it starts in.
          const key = String(reading.start_date).slice(0, 7);

          if (!totals.has(key)) continue;

          const factor = factors.get(reading.unit) ?? 1;
          totals.set(
            key,
            (totals.get(key) ?? 0) + Number(reading.usage_quantity) * factor
          );
        }

        if (!readings || readings.length < READ_PAGE_SIZE) break;
        offset += READ_PAGE_SIZE;
      }
    }

    // 4. Shape the response
    const showYear = months > 12;

    const monthly = buckets.map((b) => ({
      month: new Date(Date.UTC(b.year, b.monthIndex, 1)).toLocaleString("en-US", {
        month: "short",
        ...(showYear ? { year: "2-digit" as const } : {}),
        timeZone: "UTC",
      }),
      kwh: Math.round(totals.get(b.key) ?? 0), // was: value
    }));

    const quarterTotals = new Map<string, number>();

    for (const b of buckets) {
      const label = `Q${Math.floor(b.monthIndex / 3) + 1} ${b.year}`;
      quarterTotals.set(
        label,
        (quarterTotals.get(label) ?? 0) + (totals.get(b.key) ?? 0)
      );
    }

    const quarterly = Array.from(quarterTotals, ([quarter, value]) => ({
      quarter,
      kwh: Math.round(value), // was: value
    }));

    const last = buckets[buckets.length - 1];

    return NextResponse.json(
      {
        data: {
          monthly,
          quarterly,
          currentMonth: {
            label: new Date(
              Date.UTC(last.year, last.monthIndex, 1)
            ).toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
            value: Math.round(totals.get(last.key) ?? 0),
          },
        },
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