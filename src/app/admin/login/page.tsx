import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_HOME_PATH,
  createAdminSessionCookie,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/auth/admin-auth-runtime";

interface AdminLoginPageProps {
  readonly searchParams?: Promise<{
    readonly error?: string;
    readonly next?: string;
  }>;
}

function getSafeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return ADMIN_HOME_PATH;
  }

  return value;
}

async function getLoginAttemptIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerList.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

async function loginAdmin(formData: FormData): Promise<void> {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(String(formData.get("next") ?? ""));
  const session = await verifyAdminCredentials(
    { email, password },
    { identifier: await getLoginAttemptIdentifier() },
  );

  if (!session) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  const sessionCookie = await createAdminSessionCookie(session);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie);

  redirect(nextPath);
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const configured = isAdminAuthConfigured();
  const showInvalidMessage = resolvedSearchParams?.error === "invalid";
  const nextPath = getSafeNextPath(resolvedSearchParams?.next);

  return (
    <main
      style={{
        background: "#f7f7f5",
        color: "#1f1f1f",
        minHeight: "70vh",
        padding: "64px 24px",
      }}
    >
      <section
        aria-labelledby="admin-login-title"
        style={{
          background: "#ffffff",
          border: "1px solid #d8d8d8",
          margin: "0 auto",
          maxWidth: "460px",
          padding: "32px",
        }}
      >
        <p
          style={{
            color: "#6f6f6f",
            fontSize: "12px",
            letterSpacing: "0.14em",
            margin: "0 0 12px",
            textTransform: "uppercase",
          }}
        >
          Gallery 015 Administration
        </p>
        <h1
          id="admin-login-title"
          style={{
            color: "#1f1f1f",
            fontSize: "26px",
            fontWeight: 500,
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}
        >
          Secure admin sign in
        </h1>
        <p
          style={{
            color: "#4f4f4f",
            fontSize: "14px",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          Use authorized Gallery 015 credentials to access protected content management routes.
        </p>

        {!configured ? (
          <div
            role="alert"
            style={{
              background: "#fff4f0",
              border: "1px solid #d9a18f",
              color: "#6f2c1f",
              fontSize: "14px",
              lineHeight: 1.6,
              padding: "16px",
            }}
          >
            Admin authentication is not configured. Set the required Gallery 015 admin environment
            variables before using protected administration routes.
          </div>
        ) : (
          <form action={loginAdmin}>
            <input name="next" type="hidden" value={nextPath} />

            <label
              style={{
                color: "#1f1f1f",
                display: "grid",
                fontSize: "14px",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              Email
              <input
                autoComplete="username"
                name="email"
                required
                type="email"
                style={{
                  border: "1px solid #b8b8b8",
                  color: "#1f1f1f",
                  font: "inherit",
                  padding: "11px 12px",
                }}
              />
            </label>

            <label
              style={{
                color: "#1f1f1f",
                display: "grid",
                fontSize: "14px",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              Password
              <input
                autoComplete="current-password"
                name="password"
                required
                type="password"
                style={{
                  border: "1px solid #b8b8b8",
                  color: "#1f1f1f",
                  font: "inherit",
                  padding: "11px 12px",
                }}
              />
            </label>

            {showInvalidMessage ? (
              <p
                role="alert"
                style={{
                  color: "#8a2f1f",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  margin: "0 0 18px",
                }}
              >
                The supplied admin credentials are not valid or the login rate limit is active.
              </p>
            ) : null}

            <button
              type="submit"
              style={{
                background: "#1f1f1f",
                border: "1px solid #1f1f1f",
                color: "#ffffff",
                cursor: "pointer",
                font: "inherit",
                padding: "12px 18px",
                width: "100%",
              }}
            >
              Sign in
            </button>
          </form>
        )}
      </section>
    </main>
  );
}