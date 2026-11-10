import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ kWh: string}>}) {

    const { kWh } = await params;
    const kWhParsed = Number(kWh);

    const mWh = kWhParsed / 1000;

    const CO2 = mWh * 801.9;
    const CH4 = mWh * 0.042;
    const N2O = mWh * 0.005;

    const CH4Mult = CH4 * 28;
    const N2OMult = N2O * 265;

    const total = CO2 + CH4Mult + N2OMult;

    return NextResponse.json({value: total}, {status: 200});
}