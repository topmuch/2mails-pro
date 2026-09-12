import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "twomails_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";

  // Extract subdomain (e.g. "acme" from "acme.2mails.pro")
  // Remove port if present, then split by "."
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");
  let subdomain: string | null = null;

  // Only treat as subdomain if we have at least 3 parts (sub.domain.tld)
  // and the second part is "2mails" (our domain)
  if (parts.length >= 3 && parts[parts.length - 2] === "2mails") {
    subdomain = parts[0];
    // Skip "www" and common system subdomains
    if (subdomain === "www" || subdomain === "mail" || subdomain === "api") {
      subdomain = null;
    }
  }

  // If subdomain detected, add it as a header so API routes / pages can use it
  if (subdomain) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-tenant-subdomain", subdomain);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const session = req.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const decoded = Buffer.from(session, "base64").toString("utf-8");
      const parsed = JSON.parse(decoded);
      if (!parsed?.id || !parsed?.email) {
        throw new Error("invalid");
      }
    } catch {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
