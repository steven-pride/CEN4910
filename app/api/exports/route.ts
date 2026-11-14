import { NextRequest, NextResponse } from "next/server";
import { getStagedFile } from "@/lib/storage/storage";
import { getExportJob } from "@/lib/csv/exportJobs";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Export ID query parameter 'id' is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const file = await getStagedFile(id);
    if (!file) {
      return NextResponse.json(
        { error: "Export file not found or has expired", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const job = getExportJob(id);
    const filename = job?.filename || file.filename || `export-${id}.csv`;

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
