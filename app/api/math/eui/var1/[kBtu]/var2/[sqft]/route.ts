import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ kBtu: number,  sqft: number}>}) {

    const { kBtu, sqft } = await params;
    const kBtuParsed = Number(kBtu);
    const sqftParsed = Number(sqft);

    const eui = kBtuParsed / sqftParsed;

    return NextResponse.json({value: eui}, {status: 200});
}