import { NextRequest, NextResponse } from "next/server";
import { getStagedFile } from "@/lib/storage/storage";
import { getExportJob } from "@/lib/csv/exportJobs";
import {
  authorizationFailureResponse,
  getRequestAuthorization,
} from "@/lib/auth";

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

    const { authorization, failure } = await getRequestAuthorization();

    if (failure) return authorizationFailureResponse(failure);

    const job = getExportJob(exportId);
    if (!job || !job.userId) {
      return NextResponse.json(
        { error: "Export job not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (job.userId !== authorization.userId && authorization.role !== "admin") {
      return authorizationFailureResponse("forbidden");
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
