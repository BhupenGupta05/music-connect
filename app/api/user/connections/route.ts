import authOptions from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.connection.findMany({
        where: {
            userId: session.user.id,
            active: true
        }
    });
    
    return NextResponse.json({
        youtube: connections.some(c => c.provider === "youtube"),
        spotify: connections.some(c => c.provider === "spotify")
    })
}