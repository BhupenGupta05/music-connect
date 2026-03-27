import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const sessionToken =
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value;

    const isLoggedIn = !!sessionToken;

    // not logged in → send to login
    if (path === "/login" && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const protectedRoutes = [
        "/dashboard",
        "/onboarding",
        "/match",
        "/chat",
        "/profile",
    ]

    const isProtected = protectedRoutes.some((route) => path.startsWith(route));

    if(isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)" ],
};