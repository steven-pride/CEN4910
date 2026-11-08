import { NextRequest, NextResponse } from "next/server";
import { getImportJob } from "@/lib/csv/jobs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = getImportJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        processedRows: job.processedRows,
        totalRows: job.totalRows,
        importedCount: job.importedCount,
        failedCount: job.failedCount,
        errors: job.errors,
        errorReportUrl: job.errorReportUrl,
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
