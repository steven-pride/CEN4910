import type { UserRole } from "@/types";

export function isUserRole(role: unknown): role is UserRole {
  return role === "admin" || role === "property_manager" || role === "analyzer";
}

export function canViewProperty(
  role: string | null | undefined,
  assignedPropertyIds: readonly number[],
  propertyId: number
) {
  return (
    role === "admin" ||
    ((role === "property_manager" || role === "analyzer") &&
      assignedPropertyIds.includes(propertyId))
  );
}

export function canEditProperty(
  role: string | null | undefined,
  assignedPropertyIds: readonly number[],
  propertyId: number
) {
  return (
    role === "admin" ||
    (role === "property_manager" &&
      assignedPropertyIds.includes(propertyId))
  );
}
