import authOptions from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json()

    await prisma.connection.update({
        where: {
            userId_provider: {
                userId: session.user.id,
                provider,
            },
        },
        data: {
            active: false,
        }
    })

    return NextResponse.json({ success: true });
}