import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET - Read one meter
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const meterId = Number(id);

    if (!Number.isFinite(meterId)) {
      return NextResponse.json(
        {
          error: "Invalid meter ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("meter")
      .select(`
        meter_id,
        property_id,
        meter_name,
        meter_type,
        default_unit,
        active_date,
        inactive_date
      `)
      .eq("meter_id", meterId)
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
          error: "Meter not found.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const meter = {
      meterId: data.meter_id,
      propertyId: data.property_id,
      meterName: data.meter_name,
      meterType: data.meter_type,
      defaultUnit: data.default_unit,
      activeDate: data.active_date,
      inactiveDate: data.inactive_date,
    };

    return NextResponse.json(
      { data: meter },
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
// PATCH - Update one meter
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const meterId = Number(id);

    if (!Number.isFinite(meterId)) {
      return NextResponse.json(
        {
          error: "Invalid meter ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      propertyId,
      meterName,
      meterType,
      defaultUnit,
      activeDate,
      inactiveDate,
    } = body;

    if (
      propertyId === null ||
      propertyId === undefined ||
      propertyId === ""
    ) {
      return NextResponse.json(
        {
          error: "Property ID is required.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (!meterName?.trim()) {
      return NextResponse.json(
        {
          error: "Meter name is required.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const propertyIdNumber = Number(propertyId);

    if (!Number.isFinite(propertyIdNumber)) {
      return NextResponse.json(
        {
          error: "Property ID must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const defaultUnitNumber =
      defaultUnit === "" ||
      defaultUnit === null ||
      defaultUnit === undefined
        ? null
        : Number(defaultUnit);

    if (
      defaultUnitNumber !== null &&
      !Number.isFinite(defaultUnitNumber)
    ) {
      return NextResponse.json(
        {
          error: "Default unit must be a valid number.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("meter")
      .update({
        property_id: propertyIdNumber,
        meter_name: meterName.trim(),
        meter_type: meterType?.trim() || null,
        default_unit: defaultUnitNumber,
        active_date: activeDate || null,
        inactive_date: inactiveDate || null,
      })
      .eq("meter_id", meterId)
      .select(`
        meter_id,
        property_id,
        meter_name,
        meter_type,
        default_unit,
        active_date,
        inactive_date
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
            "Meter not found or you do not have permission to update it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const meter = {
      meterId: data.meter_id,
      propertyId: data.property_id,
      meterName: data.meter_name,
      meterType: data.meter_type,
      defaultUnit: data.default_unit,
      activeDate: data.active_date,
      inactiveDate: data.inactive_date,
    };

    return NextResponse.json(
      { data: meter },
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
// DELETE - Delete one meter
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const meterId = Number(id);

    if (!Number.isFinite(meterId)) {
      return NextResponse.json(
        {
          error: "Invalid meter ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("meter")
      .delete()
      .eq("meter_id", meterId)
      .select("meter_id")
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
            "Meter not found or you do not have permission to delete it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Meter deleted successfully.",
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
