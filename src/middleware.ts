import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/post/new"];
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(req: NextRequest) {
  return req.cookies
    .getAll()
    .some(({ name }) =>
      SESSION_COOKIE_NAMES.some((cookieName) => name === cookieName || name.startsWith(`${cookieName}.`))
    );
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const isProtected = PROTECTED.some((path) => nextUrl.pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  if (!hasSessionCookie(req)) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/post/new/:path*"],
};
