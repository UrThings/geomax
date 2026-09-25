import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute = pathname === "/admin/login";
  const isUploadRoute = pathname === "/api/upload";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token);

  if (isAdminArea && !isLoginRoute && !authenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isUploadRoute && !authenticated) {
    return NextResponse.json(
      { error: "Зөвшөөрөлгүй хүсэлт." },
      { status: 401 }
    );
  }

  if (isLoginRoute && authenticated) {
    const url = new URL("/admin", request.url);
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  const headers = response.headers;
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};