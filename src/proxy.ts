import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

/**
 * Optimistic edge check only. Live session validity, roles, and blocked-user
 * status are enforced by <RoleGuard> and the Express JWT backend, so this must
 * never inspect more than the presence of the session cookie.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    Boolean(request.cookies.get(name)),
  );

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/menu/:id+",
    "/profile-settings/:path*",
    "/payment/:path*",
  ],
};
