import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET - Read one meter reading
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
      return NextResponse.json(
        {
          error: "Invalid meter reading ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

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
      .eq("meter_reading_id", readingId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Meter reading not found.",
          code: "NOT_FOUND",
        },
        { status: 404 }
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
// PATCH - Update one meter reading
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
      return NextResponse.json(
        {
          error: "Invalid meter reading ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      meterId,
      startDate,
      endDate,
      usageQuantity,
      unit,
      cost,
    } = body;

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

    const { data, error } = await supabase
      .from("meter_reading")
      .update({
        meter_id: meterIdNumber,
        start_date: startDate || null,
        end_date: endDate || null,
        usage_quantity: usageQuantityNumber,
        unit: unitNumber,
        cost: costNumber,
      })
      .eq("meter_reading_id", readingId)
      .select(`
        meter_reading_id,
        meter_id,
        start_date,
        end_date,
        usage_quantity,
        unit,
        cost
      `)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Meter reading not found or you do not have permission to update it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
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
// DELETE - Delete one meter reading
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const readingId = Number(id);

    if (!Number.isFinite(readingId)) {
      return NextResponse.json(
        {
          error: "Invalid meter reading ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("meter_reading")
      .delete()
      .eq("meter_reading_id", readingId)
      .select("meter_reading_id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Meter reading not found or you do not have permission to delete it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Meter reading deleted successfully.",
      },
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
