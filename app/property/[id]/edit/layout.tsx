import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getRequestAuthorization } from "@/lib/auth";
import { canEditProperty, canViewProperty } from "@/lib/property-permissions";

export default async function ManageEditLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);
  const { authorization, failure } = await getRequestAuthorization();

  if (failure === "unauthenticated") redirect("/login");
  if (
    failure ||
    !authorization ||
    !Number.isSafeInteger(propertyId) ||
    !canViewProperty(
      authorization.role,
      authorization.assignedPropertyIds,
      propertyId
    ) ||
    !canEditProperty(
      authorization.role,
      authorization.assignedPropertyIds,
      propertyId
    )
  ) {
    redirect("/forbidden");
  }

  return children;
}
