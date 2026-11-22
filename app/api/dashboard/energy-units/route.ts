import { NextResponse } from "next/server";
import { authorizationFailureResponse, getRequestAuthorization } from "@/lib/auth";
import {
  calculateUnitEnergyFactors,
  type UnitConversionRow,
} from "@/lib/dashboard/unit-conversion";

const UNIT_PAGE_SIZE = 1000;

export async function GET() {
  try {
    const { supabase, failure } = await getRequestAuthorization();
    if (failure) return authorizationFailureResponse(failure);

    const units: UnitConversionRow[] = [];
    for (let from = 0; ; from += UNIT_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("unit")
        .select("unit_id, unit_name, conversion_value, base_unit_id")
        .order("unit_id", { ascending: true })
        .range(from, from + UNIT_PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json(
          { error: error.message, code: "DATABASE_ERROR" },
          { status: 500 },
        );
      }

      const batch = (data ?? []) as UnitConversionRow[];
      units.push(...batch);
      if (batch.length < UNIT_PAGE_SIZE) break;
    }

    return NextResponse.json({ data: calculateUnitEnergyFactors(units) });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}