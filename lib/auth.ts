import { type NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from "next-auth/providers/google";

const YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
].join(" ")

const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: `openid email profile ${YOUTUBE_SCOPES}`,
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
            if (!account || account.provider !== "google") return false;

            console.log({ user, profile, account });
            return true;
        },
        // async redirect({ url, baseUrl }) {
        //     if (url.startsWith(baseUrl)) return url;

        //     return baseUrl;
        // },
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
        newUser: '/onboarding'
    }
};

export default authOptions;
