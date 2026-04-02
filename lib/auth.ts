import { type NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: `openid email profile`,
                    access_type: "offline",
                    prompt: "consent",
                }
            }
        }),
    ],
    session: {
        strategy: 'database',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!account) return false;

            const hasYouTubeScope = account.scope?.includes("youtube");

            if (hasYouTubeScope && account.access_token && user.id) {
                await prisma.oAuthToken.upsert({
                    where: {
                        userId_platform: {
                            userId: user.id,
                            platform: "YOUTUBE",
                        }
                    },
                    update: {
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token ?? "",
                        expiresAt: new Date((account.expires_at ?? 0) * 1000),
                    },
                    create: {
                        userId: user.id,
                        platform: "YOUTUBE",
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token ?? "",
                        expiresAt: new Date((account.expires_at ?? 0) * 1000),
                    }
                });
            }

            console.log({ user, profile, account });
            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;

                const dbUser = await prisma.user.findUnique({
                    where: {
                        id: user.id,
                    },
                    select: {
                        handle: true,
                    }
                });

                session.user.handle = dbUser?.handle ?? null;
            }
            return session;
        }

    },
    pages: {
        signIn: '/login',
        error: '/login',
        signOut: '/login',
        newUser: '/onboarding'
    }
};

export default authOptions;
