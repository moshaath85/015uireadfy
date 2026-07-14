import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  createExpiredAdminSessionCookie,
  readAdminSessionToken,
  recordAdminSecurityEvent,
} from "@/lib/auth/admin-auth-runtime";

async function redirectToLogin(request: NextRequest) {
  const session = await readAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  recordAdminSecurityEvent({
    type: "logout",
    outcome: "success",
    email: session?.user.email,
    role: session?.user.role,
    organizationId: session?.user.organizationId,
  });

  const response = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url), {
    status: 303,
  });

  response.cookies.set(createExpiredAdminSessionCookie());

  return response;
}

export async function POST(request: NextRequest) {
  return redirectToLogin(request);
}

export async function GET(request: NextRequest) {
  return redirectToLogin(request);
}