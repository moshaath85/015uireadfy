import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  canAccessAdminPath,
} from "@/lib/auth/admin-auth-runtime";

function isAdminAsset(pathname: string): boolean {
  return pathname.startsWith("/admin/_next") || pathname.includes(".");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || isAdminAsset(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const allowed = await canAccessAdminPath(sessionToken);

  if (pathname === ADMIN_LOGIN_PATH) {
    if (!allowed) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  if (allowed) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};