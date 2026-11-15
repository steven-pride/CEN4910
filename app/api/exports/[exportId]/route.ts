import { NextRequest, NextResponse } from "next/server";
import { getStagedFile } from "@/lib/storage/storage";
import { getExportJob } from "@/lib/csv/exportJobs";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const { exportId } = await params;
    if (!exportId) {
      return NextResponse.json(
        { error: "Export ID is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // Authenticate user session if present
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    const job = getExportJob(exportId);
    if (job && job.userId && user && job.userId !== user.id) {
      // If user is neither owner nor admin, forbid
      const { data: profile } = await supabase
        .from("user_profile")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = profile?.role?.toLowerCase() || "";
      if (role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to access this export", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    }

    // Retrieve staged file content
    const file = await getStagedFile(exportId);
    if (!file) {
      return NextResponse.json(
        { error: "Export file not found or has expired (24h TTL)", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const filename = job?.filename || file.filename || `export-${exportId}.csv`;

    return new NextResponse(file.content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
