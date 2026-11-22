import { NextRequest, NextResponse } from "next/server";
import { authorizationFailureResponse, getRequestAuthorization } from "@/lib/auth";

// GET - Read properties with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { supabase, authorization, failure } = await getRequestAuthorization();

    if (failure) return authorizationFailureResponse(failure);

    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get("search")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const stateProvince =
      searchParams.get("stateProvince")?.trim() || "";

    // Pagination
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const pageSize = Math.max(
      1,
      parseInt(searchParams.get("pageSize") || "10", 10)
    );

    if (
      authorization.role !== "admin" &&
      authorization.assignedPropertyIds.length === 0
    ) {
      return NextResponse.json(
        {
          data: [],
          pagination: { page, pageSize, totalCount: 0, totalPages: 1 },
        },
        { status: 200 }
      );
    }

    // Build property query
    let query = supabase
      .from("property")
      .select(
        `
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
        `,
        { count: "exact" }
      );

    // Apply property name search filter
    if (search) {
      query = query.ilike(
        "property_name",
        `%${search}%`
      );
    }

    // Apply city filter
    if (city) {
      query = query.ilike(
        "city",
        `%${city}%`
      );
    }

    // Apply state/province filter
    if (stateProvince) {
      query = query.ilike(
        "state_province",
        `%${stateProvince}%`
      );
    }

    if (authorization.role !== "admin") {
      query = query.in("property_id", authorization.assignedPropertyIds);
    }

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("property_name", { ascending: true })
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
      {
        data: properties,
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

// POST - Create a new property
export async function POST(request: NextRequest) {
  try {
    const { supabase, authorization, failure } = await getRequestAuthorization();

    if (failure) return authorizationFailureResponse(failure);
    if (authorization.role !== "admin") {
      return authorizationFailureResponse("forbidden");
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