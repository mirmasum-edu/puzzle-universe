import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "pu_session";

/**
 * Next.js 16 Proxy (formerly Middleware). Defense-in-depth: a lightweight
 * cookie-presence check for fast redirects. Full JWT verification still
 * happens in the server layout / route guards.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
