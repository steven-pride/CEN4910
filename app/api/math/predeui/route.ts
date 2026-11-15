import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const body = await request.json();

    try {
      const res = await fetch('http://127.0.0.1:8088/predict', { // Replace local address before use
      cache: 'no-store',
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    const eui = data.predicted_source_eui

    return NextResponse.json({value: eui}, {status: 200});

    }

    catch (error) {
      return NextResponse.json({ error: "Error", code: "SERVER_ERROR" }, { status: 500 });
    }
}