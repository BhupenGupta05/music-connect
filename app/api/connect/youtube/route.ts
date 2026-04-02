import authOptions from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { YOUTUBE_SCOPES } from "@/lib/scopes";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connect/youtube/callback`;
    console.log("redirect_uri being sent to Google:", redirectUri); // ← add this

    const state = await prisma.oAuthState.create({
        data: {
            userId: session.user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
    })

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connect/youtube/callback`,
        response_type: "code",
        scope: YOUTUBE_SCOPES,
        access_type: "offline",
        prompt: "consent",
        state: state.token, // random cuid, not the userId
    })

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );

}