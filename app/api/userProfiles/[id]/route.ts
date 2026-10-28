import { NextResponse } from "next/server";

// Read
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return NextResponse.json({ id }, {status: 200});
}

// Create
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return NextResponse.json({ id }, {status: 200});
}

// Update
export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return NextResponse.json({ id }, {status: 200});
}

// Delete
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
        const { id } = await params;

        return NextResponse.json({ id }, {status: 200});
}
