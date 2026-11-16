import "server-only";
import { apiGet } from "@/lib/api/server-fetch";

export type PropertyUse = {
  propertyUseId: number;
  propertyTypeId: number;
  propertyTypeName: string | null;
  energyStarEligible: boolean | null;
  grossFloorArea: number;
  weeklyOperatingHours: number | null;
  workersOnMainShift: number | null;
  numberOfComputers: number | null;
  percentHeated: number | null;
  percentCooled: number | null;
};

export type Property = {
  propertyId: number;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  irrigatedArea: number | null;
  yearBuilt: number | null;
  occupancyPercent: number | null;
  numberOfBuildings: number | null;
  propertyUses: PropertyUse[];
};

export function getProperty(id: string) {
  return apiGet<Property>(`/api/properties/${encodeURIComponent(id)}`);
}