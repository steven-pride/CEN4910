import { NextRequest, NextResponse } from "next/server";
import {
  authorizationFailureResponse,
  getRequestAuthorization,
} from "@/lib/auth";
import { getExportJob } from "@/lib/csv/exportJobs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  try {
    const { exportId } = await params;
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

    if (job.status === "completed") {
      return NextResponse.json(
        {
          exportId: job.exportId,
          status: "completed",
          progress: 100,
          downloadUrl: job.downloadUrl || `/api/exports/${job.exportId}`,
          filename: job.filename,
          rowCount: job.rowCount,
        },
        { status: 200 }
      );
    }

    if (job.status === "failed") {
      return NextResponse.json(
        {
          exportId: job.exportId,
          status: "failed",
          progress: job.progress,
          error: job.error || "Export failed",
        },
        { status: 200 }
      );
    }

    // Queued or Processing
    return NextResponse.json(
      {
        exportId: job.exportId,
        status: job.status,
        progress: job.progress,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: message, code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
