import { NextRequest, NextResponse } from "next/server.js";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "INVALID_JSON" }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const serviceUrl = process.env.PUI_INTERNAL_URL;
  if (!serviceUrl) {
    return NextResponse.json({ error: "Prediction service is not configured", code: "SERVICE_UNAVAILABLE" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let serviceResponse: Response;
  try {
    serviceResponse = await fetch(new URL("predict", `${serviceUrl.replace(/\/+$/, "")}/`), {
      cache: "no-store",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "Prediction service is unavailable", code: "SERVICE_UNAVAILABLE" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const data = await serviceResponse.json().catch(() => undefined);
  if (data === undefined) {
    return NextResponse.json({ error: "Prediction service returned an invalid response", code: "INVALID_RESPONSE" }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!serviceResponse.ok) {
    return NextResponse.json(data, {
      status: serviceResponse.status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const value = typeof data === "object" && data !== null
    ? (data as { predicted_source_eui?: unknown }).predicted_source_eui
    : undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return NextResponse.json({ error: "Prediction service returned an invalid response", code: "INVALID_RESPONSE" }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json({ value }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}