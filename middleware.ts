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

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (!pathname.startsWith("/admin") || isAdminAsset(pathname)) {
    return addSecurityHeaders(response);
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const allowed = await canAccessAdminPath(sessionToken);

  if (pathname === ADMIN_LOGIN_PATH) {
    if (!allowed) {
      return addSecurityHeaders(NextResponse.next());
    }

    return addSecurityHeaders(NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url)));
  }

  if (allowed) {
    return addSecurityHeaders(NextResponse.next());
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", pathname);

  return addSecurityHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|robots.txt|sitemap.xml).*)"],
};