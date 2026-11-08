import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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