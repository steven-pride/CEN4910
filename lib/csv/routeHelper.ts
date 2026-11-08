/**
 * Shared Request Handler for Import Submission Endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createImportJob } from "./jobs";
import { runImportJobAsync } from "./importer";
import { saveStagedFile } from "@/lib/storage/storage";

export async function handleImportSubmission(
  request: NextRequest,
  type: "properties" | "meters" | "readings"
) {
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

    // Role check: Admin or Property Manager only
    if (user && role !== "admin" && role !== "property_manager") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to import data.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const propertyIdRaw = formData.get("property_id") as string | null;
    const propertyId = propertyIdRaw ? Number(propertyIdRaw) : undefined;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing required CSV file field in multipart/form-data payload.", code: "INVALID_FILE" },
        { status: 400 }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds maximum size of 10MB.", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const jobId = crypto.randomUUID();

    // Stage source file
    await saveStagedFile(`imports-${jobId}`, csvText, `import-source-${jobId}.csv`);

    // Create job entry
    createImportJob(jobId, type, user?.id);

    // Run processing asynchronously without awaiting
    runImportJobAsync(
      jobId,
      type,
      csvText,
      {
        userId: user?.id,
        role,
        assignedPropertyIds,
      },
      propertyId
    ).catch((err) => {
      console.error(`Error in background import job ${jobId}:`, err);
    });

    // Return 202 Accepted immediately
    return NextResponse.json(
      {
        success: true,
        jobId,
        status: "queued",
        message: "Import job submitted successfully and is processing in the background.",
        statusUrl: `/api/import/jobs/${jobId}`,
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
