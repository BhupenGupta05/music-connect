import authOptions from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateToken = searchParams.get("state");
    const error = searchParams.get("error");

    const redirectTo = (path: string) =>
        NextResponse.redirect(`${process.env.NEXTAUTH_URL}${path}`);

    if (error || !code || !stateToken) {
        return redirectTo("/connect?error=youtube_denied");
    }

    // Look up the state token — this tells us which user initiated the flow
    const oauthState = await prisma.oAuthState.findUnique({
        where: { token: stateToken },
    });

    // Delete it immediately — one-time use
    if (oauthState) {
        await prisma.oAuthState.delete({ where: { token: stateToken } });
    }

    if (!oauthState || oauthState.expiresAt < new Date()) {
        return redirectTo("/connect?error=state_expired");
    }

    // Verify the session still matches the user who initiated
    // (optional but good practice)
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.id !== oauthState.userId) {
        return redirectTo("/connect?error=session_mismatch");
    }

    // Exchange the code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/connect/youtube/callback`,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenRes.ok) {
        return redirectTo("/connect?error=token_exchange_failed");
    }

    const tokens = await tokenRes.json();

    // Save under the userId from the state token — not whoever is in the session
    await prisma.$transaction([
        prisma.oAuthToken.upsert({
            where: {
                userId_platform: { userId: oauthState.userId, platform: "YOUTUBE" },
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? "",
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            },
            create: {
                userId: oauthState.userId,
                platform: "YOUTUBE",
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? "",
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            },
        }),
        prisma.connection.upsert({
            where: {
                userId_provider: { userId: oauthState.userId, provider: "youtube" },
            },
            update: { active: true },
            create: { userId: oauthState.userId, provider: "youtube", active: true },
        }),
    ]);

    return redirectTo("/connect?connected=youtube");
}