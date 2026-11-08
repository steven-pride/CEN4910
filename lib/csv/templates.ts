/**
 * Sample CSV Templates for Properties, Meters, and Meter Readings.
 */

export const CSV_TEMPLATES: Record<string, string> = {
  properties: `property_name,address_line1,address_line2,city,state_province,postal_code,irrigated_area,year_built,occupancy_percent,number_of_buildings
Empire State Building,350 5th Ave,Suite 400,New York,NY,10001,15000,1931,92,1
Chrysler Building,405 Lexington Ave,,New York,NY,10174,0,1930,88,1`,

  meters: `meter_name,meter_type,default_unit,active_date,inactive_date
Electric Main Feed,Electric,kWh,2024-01-01,
Gas Heating Unit,Natural Gas,therms,2024-01-01,2026-12-31`,

  readings: `meter_name,start_date,end_date,usage_quantity,unit,cost
Electric Main Feed,2024-08-01,2024-08-31,438200,kWh,54775.00
Electric Main Feed,2024-09-01,2024-09-30,412500,kWh,51560.00`,
};

export function getCsvTemplate(type: string): string | null {
  const normalized = type.toLowerCase();
  if (normalized === "properties" || normalized === "property") {
    return CSV_TEMPLATES.properties;
  }
  if (normalized === "meters" || normalized === "meter") {
    return CSV_TEMPLATES.meters;
  }
  if (normalized === "readings" || normalized === "reading" || normalized === "meter_readings") {
    return CSV_TEMPLATES.readings;
  }
  return null;
}
