import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET - Read all meter readings
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("meter_reading")
      .select(`
        meter_reading_id,
        meter_id,
        start_date,
        end_date,
        usage_quantity,
        unit,
        cost
      `)
      .order("start_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    const readings = (data || []).map((reading) => ({
      meterReadingId: reading.meter_reading_id,
      meterId: reading.meter_id,
      startDate: reading.start_date,
      endDate: reading.end_date,
      usageQuantity: reading.usage_quantity,
      unit: reading.unit,
      cost: reading.cost,
    }));

    return NextResponse.json(
      { data: readings },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST - Create a new meter reading
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      meterId,
      startDate,
      endDate,
      usageQuantity,
      unit,
      cost,
    } = body;

    // Meter ID is required because every reading must belong to a meter.
    if (
      meterId === "" ||
      meterId === null ||
      meterId === undefined
    ) {
      return NextResponse.json(
        {
          error: "Meter ID is required.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const meterIdNumber = Number(meterId);

    if (!Number.isFinite(meterIdNumber)) {
      return NextResponse.json(
        {
          error: "Meter ID must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const usageQuantityNumber =
      usageQuantity === "" ||
      usageQuantity === null ||
      usageQuantity === undefined
        ? null
        : Number(usageQuantity);

    if (
      usageQuantityNumber !== null &&
      !Number.isFinite(usageQuantityNumber)
    ) {
      return NextResponse.json(
        {
          error: "Usage quantity must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const unitNumber =
      unit === "" ||
      unit === null ||
      unit === undefined
        ? null
        : Number(unit);

    if (
      unitNumber !== null &&
      !Number.isFinite(unitNumber)
    ) {
      return NextResponse.json(
        {
          error: "Unit must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const costNumber =
      cost === "" ||
      cost === null ||
      cost === undefined
        ? null
        : Number(cost);

    if (
      costNumber !== null &&
      !Number.isFinite(costNumber)
    ) {
      return NextResponse.json(
        {
          error: "Cost must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // If unit is left blank, the database may populate it from the
    // meter's default unit depending on the project's DB configuration.
    const { data, error } = await supabase
      .from("meter_reading")
      .insert({
        meter_id: meterIdNumber,
        start_date: startDate || null,
        end_date: endDate || null,
        usage_quantity: usageQuantityNumber,
        unit: unitNumber,
        cost: costNumber,
      })
      .select(`
        meter_reading_id,
        meter_id,
        start_date,
        end_date,
        usage_quantity,
        unit,
        cost
      `)
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    const reading = {
      meterReadingId: data.meter_reading_id,
      meterId: data.meter_id,
      startDate: data.start_date,
      endDate: data.end_date,
      usageQuantity: data.usage_quantity,
      unit: data.unit,
      cost: data.cost,
    };

    return NextResponse.json(
      { data: reading },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
