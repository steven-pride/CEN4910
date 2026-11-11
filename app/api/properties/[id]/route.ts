import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Read one property
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const propertyId = Number(id);

    if (!Number.isFinite(propertyId)) {
      return NextResponse.json(
        {
          error: "Invalid property ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("property")
      .select(`
        property_id,
        property_name,
        address_line1,
        address_line2,
        city,
        state_province,
        postal_code,
        irrigated_area,
        year_built,
        occupancy_percent,
        number_of_buildings
      `)
      .eq("property_id", propertyId)
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
          error: "Property not found.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const property = {
      propertyId: data.property_id,
      name: data.property_name,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      stateProvince: data.state_province,
      postalCode: data.postal_code,
      irrigatedArea: data.irrigated_area,
      yearBuilt: data.year_built,
      occupancyPercent: data.occupancy_percent,
      numberOfBuildings: data.number_of_buildings,
    };

    return NextResponse.json(
      { data: property },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update one property
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const propertyId = Number(id);

    if (!Number.isFinite(propertyId)) {
      return NextResponse.json(
        {
          error: "Invalid property ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      irrigatedArea,
      yearBuilt,
      occupancyPercent,
      numberOfBuildings,
    } = body;

    // Property name is the only required field.
    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Property name is required.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("property")
      .update({
        property_name: name.trim(),
        address_line1: addressLine1?.trim() || null,
        address_line2: addressLine2?.trim() || null,
        city: city?.trim() || null,
        state_province: stateProvince?.trim() || null,
        postal_code: postalCode?.trim() || null,

        irrigated_area:
          irrigatedArea === "" ||
          irrigatedArea === null ||
          irrigatedArea === undefined
            ? null
            : Number(irrigatedArea),

        year_built:
          yearBuilt === "" ||
          yearBuilt === null ||
          yearBuilt === undefined
            ? null
            : Number(yearBuilt),

        occupancy_percent:
          occupancyPercent === "" ||
          occupancyPercent === null ||
          occupancyPercent === undefined
            ? null
            : Number(occupancyPercent),

        number_of_buildings:
          numberOfBuildings === "" ||
          numberOfBuildings === null ||
          numberOfBuildings === undefined
            ? null
            : Number(numberOfBuildings),
      })
      .eq("property_id", propertyId)
      .select(`
        property_id,
        property_name,
        address_line1,
        address_line2,
        city,
        state_province,
        postal_code,
        irrigated_area,
        year_built,
        occupancy_percent,
        number_of_buildings
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
            "Property not found or you do not have permission to update it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const property = {
      propertyId: data.property_id,
      name: data.property_name,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      stateProvince: data.state_province,
      postalCode: data.postal_code,
      irrigatedArea: data.irrigated_area,
      yearBuilt: data.year_built,
      occupancyPercent: data.occupancy_percent,
      numberOfBuildings: data.number_of_buildings,
    };

    return NextResponse.json(
      { data: property },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete one property
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const propertyId = Number(id);

    if (!Number.isFinite(propertyId)) {
      return NextResponse.json(
        {
          error: "Invalid property ID.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("property")
      .delete()
      .eq("property_id", propertyId)
      .select("property_id")
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
            "Property not found or you do not have permission to delete it.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Property deleted successfully.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return NextResponse.json(
      {
        error: message,
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}