import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const sessionToken =
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value;

    const isLoggedIn = !!sessionToken;

    // not logged in → send to login
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: ["/dashboard/:path*", "/onboarding/:path*", "/match/:path*"],
}