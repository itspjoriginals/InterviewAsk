import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = ["/dashboard", "/post/new"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const isProtected = PROTECTED.some((path) => nextUrl.pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/post/new/:path*"],
};