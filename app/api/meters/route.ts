import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET - Read meters with filtering and pagination
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search")?.trim() || "";
    const propertyId = searchParams.get("propertyId") || "All";
    const meterType = searchParams.get("meterType")?.trim() || "";

    // Pagination
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const pageSize = Math.max(
      1,
      parseInt(searchParams.get("pageSize") || "10", 10)
    );

    // Build meter query
    let query = supabase
      .from("meter")
      .select(
        `
          meter_id,
          property_id,
          meter_name,
          meter_type,
          default_unit,
          active_date,
          inactive_date
        `,
        { count: "exact" }
      );

    // Apply meter name search
    if (search) {
      query = query.ilike(
        "meter_name",
        `%${search}%`
      );
    }

    // Apply property filter
    if (propertyId !== "All" && propertyId !== "") {
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

      query = query.eq(
        "property_id",
        propertyIdNumber
      );
    }

    // Apply meter type filter
    if (meterType) {
      query = query.ilike(
        "meter_type",
        `%${meterType}%`
      );
    }

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("meter_name", { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    const totalCount = count ?? 0;
    const totalPages =
      Math.ceil(totalCount / pageSize) || 1;

    const meters = (data || []).map((meter) => ({
      meterId: meter.meter_id,
      propertyId: meter.property_id,
      meterName: meter.meter_name,
      meterType: meter.meter_type,
      defaultUnit: meter.default_unit,
      activeDate: meter.active_date,
      inactiveDate: meter.inactive_date,
    }));

    return NextResponse.json(
      {
        data: meters,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
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

// ---------------------------------------------------------------------------
// POST - Create a new meter
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
      .insert({
        property_id: propertyIdNumber,
        meter_name: meterName.trim(),
        meter_type: meterType?.trim() || null,
        default_unit: defaultUnitNumber,
        active_date: activeDate || null,
        inactive_date: inactiveDate || null,
      })
      .select(`
        meter_id,
        property_id,
        meter_name,
        meter_type,
        default_unit,
        active_date,
        inactive_date
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