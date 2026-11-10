import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Read all properties
export async function GET() {
  try {
    const supabase = await createClient();

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
      .order("property_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: "DATABASE_ERROR",
        },
        { status: 500 }
      );
    }

    const properties = (data || []).map((property) => ({
      propertyId: property.property_id,
      name: property.property_name,
      addressLine1: property.address_line1,
      addressLine2: property.address_line2,
      city: property.city,
      stateProvince: property.state_province,
      postalCode: property.postal_code,
      irrigatedArea: property.irrigated_area,
      yearBuilt: property.year_built,
      occupancyPercent: property.occupancy_percent,
      numberOfBuildings: property.number_of_buildings,
    }));

    return NextResponse.json(
      { data: properties },
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

// POST - Create a new property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
      .insert({
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
      { status: 201 }
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