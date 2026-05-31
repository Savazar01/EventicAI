import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/change-password"];
const publicApiPaths = ["/api/auth/login", "/api/auth/logout", "/api/auth/me"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  const isApiRoute = pathname.startsWith("/api/");
  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
  const isPublicApi = publicApiPaths.some(p => pathname === p);

  if (isApiRoute && !isPublicApi && !sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isApiRoute && !isPublicPath && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionToken && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
