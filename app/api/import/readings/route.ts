import { NextRequest } from "next/server";
import { handleImportSubmission } from "@/lib/csv/routeHelper";

export async function POST(request: NextRequest) {
  return handleImportSubmission(request, "readings");
}
