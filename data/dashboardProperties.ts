
/**
 * Main Dashboard property adapter.
 *
 * DEMONSTRATION DATA ONLY.
 * Uses Jacob's property and property_use structure.
 *
 * This file does not connect to Supabase yet.
 */

import {
  properties,
  propertyUses,
  benchmarks,
} from "@/data/mockAnalytics";

export type DashboardProperty = {
  propertyId: number;
  name: string;
  address: string | null;
  grossFloorArea: number;
  weeklyOperatingHours: number | null;
  occupancyPercent: number | null;
  eui: number | null;
};

// Build dashboard properties from shared mock records.
export const dashboardProperties: DashboardProperty[] =
  properties.map((property) => {
    // Calculate gross floor area for this property.
    const grossFloorArea = propertyUses
      .filter(
        (use) =>
          use.property_id === property.property_id
      )
      .reduce(
        (total, use) =>
          total + use.gross_floor_area,
        0
      );

    // Temporary match by name for mock data.
    // Real database records should join by property_id.
    const benchmark = benchmarks.find(
      (item) => item.name === property.property_name
    );

    return {
      propertyId: property.property_id,
      name: property.property_name,
      address: null,
      grossFloorArea,
      weeklyOperatingHours: null,
      occupancyPercent: null,
      eui: benchmark?.value ?? null,
    };
  });
