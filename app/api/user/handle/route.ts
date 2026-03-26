import authOptions from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await req.json();

    if (!handle || handle.length < 3) {
        return NextResponse.json({ error: "Handle too short" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
        where: { handle },
    });

    if (existing) {
        return NextResponse.json({ error: "Handle already taken" }, { status: 409 });
    }

    await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            handle,
        }
    });

    return NextResponse.json({ success: true });
}