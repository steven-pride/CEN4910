import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    let role = "admin";
    let assignedPropertyIds: number[] = [];

    if (user) {
      const { data: profile } = await supabase
        .from("user_profile")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role.toLowerCase();
      }

      const { data: assignments } = await supabase
        .from("property_assignment")
        .select("property_id")
        .eq("user_id", user.id);

      if (assignments) {
        assignedPropertyIds = assignments.map((a) => a.property_id);
      }
    }

    let bodyParams: Record<string, any> = {};
    if (request.method === "POST") {
      bodyParams = await request.json();
    }

    const propertyId = bodyParams.propertyId || request.nextUrl.searchParams.get("propertyId") || undefined;
    const params = propertyId ? { propertyId } : {};

    const exportId = `exp-${crypto.randomUUID()}`;

    // Create job record
    createExportJob(exportId, "properties", user?.id, assignedPropertyIds);

    const context = {
      userId: user?.id,
      role,
      assignedPropertyIds,
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
