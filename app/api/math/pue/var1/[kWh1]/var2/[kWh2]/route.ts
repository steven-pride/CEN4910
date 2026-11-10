import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ kWh1: number,  kWh2: number}>}) {

    const { kWh1, kWh2 } = await params;
    const kWh1Parsed = Number(kWh1);
    const kWh2Parsed = Number(kWh2);

    const pue = kWh1Parsed / kWh2Parsed;

    return NextResponse.json({value: pue}, {status: 200});
}