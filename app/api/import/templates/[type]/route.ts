import { NextRequest, NextResponse } from "next/server";
import { getCsvTemplate } from "@/lib/csv/templates";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const template = getCsvTemplate(type);

    if (!template) {
      return NextResponse.json(
        { error: `Invalid template type '${type}'. Expected properties, meters, or readings.`, code: "INVALID_TYPE" },
        { status: 400 }
      );
    }

    return new NextResponse(template, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-template.csv"`,
        "Cache-Control": "public, max-age=3600",
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
