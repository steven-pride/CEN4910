/**
 * Background Asynchronous CSV Export Processor.
 * Queries Supabase database directly and generates CSV files.
 * Supports:
 *  1. Dashboard Data Export: Portfolio properties overview.
 *  2. Full Property Data Export: Complete property details with associated meters and readings.
 */

import Papa from "papaparse";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateExportJob } from "./exportJobs";
import { saveStagedFile } from "@/lib/storage/storage";

interface ExportContext {
  userId?: string;
  role?: string;
  assignedPropertyIds?: number[];
}

function getFormattedDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Asynchronously processes Dashboard Data Export (Properties Overview).
 */
export async function runDashboardExportAsync(
  exportId: string,
  context: ExportContext
): Promise<void> {
  try {
    updateExportJob(exportId, { status: "processing", progress: 20 });

    const supabase = createAdminClient();

    let query = supabase.from("property").select(`
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
    `);

    if (context.role !== "admin" && !context.assignedPropertyIds?.length) {
      throw new Error("No assigned properties available to export.");
    }

    if (context.role !== "admin") {
      query = query.in("property_id", context.assignedPropertyIds);
    }

    query = query.order("property_name", { ascending: true });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Database error querying properties: ${error.message}`);
    }

    const rows: Record<string, any>[] = data || [];

    updateExportJob(exportId, { progress: 60 });

    const csvContent = Papa.unparse(rows, {
      columns: [
        "property_id",
        "property_name",
        "address_line1",
        "address_line2",
        "city",
        "state_province",
        "postal_code",
        "irrigated_area",
        "year_built",
        "occupancy_percent",
        "number_of_buildings",
      ],
    });
    const filename = `dashboard-properties-export-${getFormattedDate()}.csv`;

    await saveStagedFile(exportId, csvContent, filename);

    updateExportJob(exportId, {
      status: "completed",
      progress: 100,
      downloadUrl: `/api/exports/${exportId}`,
      filename,
      rowCount: rows.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to export dashboard data";
    updateExportJob(exportId, {
      status: "failed",
      error: errorMsg,
    });
  }
}

/**
 * Asynchronously processes Full Property Data Export (including meters and readings).
 */
export async function runPropertyFullExportAsync(
  exportId: string,
  propertyId: number | string,
  context: ExportContext
): Promise<void> {
  try {
    updateExportJob(exportId, { status: "processing", progress: 20 });
    const supabase = createAdminClient();
    const targetPropertyId = Number(propertyId);

    if (
      context.role !== "admin" &&
      !context.assignedPropertyIds?.includes(targetPropertyId)
    ) {
      throw new Error("You do not have permission to export this property.");
    }

    // Load units directly from unit table
    const { data: unitsData, error: unitsError } = await supabase
      .from("unit")
      .select("unit_id, unit_name");

    if (unitsError) {
      throw new Error(`Database error querying units: ${unitsError.message}`);
    }

    const unitMap: Record<number, string> = {};
    if (unitsData) {
      for (const u of unitsData) {
        if (u.unit_id && u.unit_name) {
          unitMap[u.unit_id] = u.unit_name;
        }
      }
    }

    // 1. Get target property directly by ID
    const { data: property, error: propertyError } = await supabase
      .from("property")
      .select("*")
      .eq("property_id", targetPropertyId)
      .maybeSingle();

    if (propertyError) {
      throw new Error(`Database error querying property: ${propertyError.message}`);
    }

    if (!property) {
      throw new Error("Property not found in database.");
    }

    updateExportJob(exportId, { progress: 40 });

    // 2. Get meters for this property
    const { data: metersData, error: metersError } = await supabase
      .from("meter")
      .select("*")
      .eq("property_id", property.property_id)
      .order("meter_id", { ascending: true });

    if (metersError) {
      throw new Error(`Database error querying meters: ${metersError.message}`);
    }

    const meters: Record<string, any>[] = metersData || [];

    updateExportJob(exportId, { progress: 60 });

    // 3. Get readings for these meters
    const meterIds = meters.map((m) => m.meter_id);
    let readings: Record<string, any>[] = [];

    if (meterIds.length > 0) {
      const { data: readingsData, error: readingsError } = await supabase
        .from("meter_reading")
        .select("*")
        .in("meter_id", meterIds)
        .order("start_date", { ascending: true });

      if (readingsError) {
        throw new Error(`Database error querying meter readings: ${readingsError.message}`);
      }

      readings = readingsData || [];
    }

    updateExportJob(exportId, { progress: 80 });

    // 4. Combine into flattened rows
    const rows: Record<string, any>[] = [];

    if (meters.length === 0) {
      rows.push({
        property_id: property.property_id,
        property_name: property.property_name,
        address_line1: property.address_line1,
        address_line2: property.address_line2,
        city: property.city,
        state_province: property.state_province,
        postal_code: property.postal_code,
        irrigated_area: property.irrigated_area,
        year_built: property.year_built,
        occupancy_percent: property.occupancy_percent,
        number_of_buildings: property.number_of_buildings,
        meter_id: "",
        meter_name: "",
        meter_type: "",
        default_unit: "",
        unit_name: "",
        meter_active_date: "",
        meter_inactive_date: "",
        meter_reading_id: "",
        start_date: "",
        end_date: "",
        usage_quantity: "",
        reading_unit: "",
        cost: "",
      });
    } else {
      const readingsByMeter = new Map<number, Record<string, any>[]>();
      for (const r of readings) {
        const list = readingsByMeter.get(r.meter_id) || [];
        list.push(r);
        readingsByMeter.set(r.meter_id, list);
      }

      for (const meter of meters) {
        const meterReadings = readingsByMeter.get(meter.meter_id) || [];
        if (meterReadings.length > 0) {
          for (const r of meterReadings) {
            rows.push({
              property_id: property.property_id,
              property_name: property.property_name,
              address_line1: property.address_line1,
              address_line2: property.address_line2,
              city: property.city,
              state_province: property.state_province,
              postal_code: property.postal_code,
              irrigated_area: property.irrigated_area,
              year_built: property.year_built,
              occupancy_percent: property.occupancy_percent,
              number_of_buildings: property.number_of_buildings,
              meter_id: meter.meter_id,
              meter_name: meter.meter_name,
              meter_type: meter.meter_type,
              default_unit: meter.default_unit,
              unit_name: unitMap[meter.default_unit] || "",
              meter_active_date: meter.active_date,
              meter_inactive_date: meter.inactive_date,
              meter_reading_id: r.meter_reading_id,
              start_date: r.start_date,
              end_date: r.end_date,
              usage_quantity: r.usage_quantity,
              reading_unit: r.unit ? (unitMap[r.unit] || r.unit) : (unitMap[meter.default_unit] || ""),
              cost: r.cost,
            });
          }
        } else {
          rows.push({
            property_id: property.property_id,
            property_name: property.property_name,
            address_line1: property.address_line1,
            address_line2: property.address_line2,
            city: property.city,
            state_province: property.state_province,
            postal_code: property.postal_code,
            irrigated_area: property.irrigated_area,
            year_built: property.year_built,
            occupancy_percent: property.occupancy_percent,
            number_of_buildings: property.number_of_buildings,
            meter_id: meter.meter_id,
            meter_name: meter.meter_name,
            meter_type: meter.meter_type,
            default_unit: meter.default_unit,
            unit_name: unitMap[meter.default_unit] || "",
            meter_active_date: meter.active_date,
            meter_inactive_date: meter.inactive_date,
            meter_reading_id: "",
            start_date: "",
            end_date: "",
            usage_quantity: "",
            reading_unit: "",
            cost: "",
          });
        }
      }
    }

    const csvContent = Papa.unparse(rows, {
      columns: [
        "property_id",
        "property_name",
        "address_line1",
        "address_line2",
        "city",
        "state_province",
        "postal_code",
        "irrigated_area",
        "year_built",
        "occupancy_percent",
        "number_of_buildings",
        "meter_id",
        "meter_name",
        "meter_type",
        "default_unit",
        "unit_name",
        "meter_active_date",
        "meter_inactive_date",
        "meter_reading_id",
        "start_date",
        "end_date",
        "usage_quantity",
        "reading_unit",
        "cost",
      ],
    });
    const safeName = (property.property_name || "property")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const filename = `${safeName}-full-export-${getFormattedDate()}.csv`;

    await saveStagedFile(exportId, csvContent, filename);

    updateExportJob(exportId, {
      status: "completed",
      progress: 100,
      downloadUrl: `/api/exports/${exportId}`,
      filename,
      rowCount: rows.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to export property data";
    updateExportJob(exportId, {
      status: "failed",
      error: errorMsg,
    });
  }
}

/**
 * Universal property / dashboard export handler.
 * Dispatches to full property export if propertyId is provided, or dashboard export if not.
 */
export async function runPropertyExportAsync(
  exportId: string,
  params: { propertyId?: number | string },
  context: ExportContext
): Promise<void> {
  if (params.propertyId) {
    return runPropertyFullExportAsync(exportId, params.propertyId, context);
  }
  return runDashboardExportAsync(exportId, context);
}
