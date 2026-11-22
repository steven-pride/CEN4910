import { NextRequest, NextResponse } from "next/server";
import {
  authorizationFailureResponse,
  getRequestAuthorization,
} from "@/lib/auth";
import { canViewProperty } from "@/lib/property-permissions";
import { createExportJob } from "@/lib/csv/exportJobs";
import { runPropertyExportAsync } from "@/lib/csv/exporter";

export async function POST(request: NextRequest) {
  return handleExport(request);
}

export async function GET(request: NextRequest) {
  return handleExport(request);
}

async function handleExport(request: NextRequest) {
  try {
    const { authorization, failure } = await getRequestAuthorization();

    if (failure) return authorizationFailureResponse(failure);

    let propertyIdValue: unknown = request.nextUrl.searchParams.get("propertyId");
    if (request.method === "POST") {
      const body: unknown = await request.json();
      if (typeof body === "object" && body !== null && !Array.isArray(body)) {
        propertyIdValue = "propertyId" in body ? body.propertyId : null;
      }
    }

    const propertyId =
      propertyIdValue === null || propertyIdValue === undefined || propertyIdValue === ""
        ? undefined
        : Number(propertyIdValue);

    if (propertyId !== undefined && !Number.isSafeInteger(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (
      propertyId !== undefined &&
      !canViewProperty(
        authorization.role,
        authorization.assignedPropertyIds,
        propertyId
      )
    ) {
      return NextResponse.json(
        { error: "Property not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (
      authorization.role !== "admin" &&
      authorization.assignedPropertyIds.length === 0
    ) {
      return authorizationFailureResponse("forbidden");
    }

    const params = propertyId === undefined ? {} : { propertyId };

    const exportId = `exp-${crypto.randomUUID()}`;

    // Create job record
    createExportJob(
      exportId,
      "properties",
      authorization.userId,
      authorization.assignedPropertyIds
    );

    const context = {
      userId: authorization.userId,
      role: authorization.role,
      assignedPropertyIds: authorization.assignedPropertyIds,
    };

    // Dispatch background worker asynchronously
    runPropertyExportAsync(exportId, params, context).catch((err) => {
      console.error(`Export properties error ${exportId}:`, err);
    });

    // Return 202 Accepted
    return NextResponse.json(
      {
        success: true,
        exportId,
        status: "queued",
        statusUrl: `/api/export/jobs/${exportId}`,
      },
      { status: 202 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
