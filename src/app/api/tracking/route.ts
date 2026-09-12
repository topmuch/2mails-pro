import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST: record a page view or a click event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = body.kind; // "pageview" | "click"
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
    }

    // Try to resolve a tenant from the session cookie. Public visitors will
    // typically have no session — in that case the record is created without
    // tenantId (a NOT NULL violation will be silently caught and logged).
    const session = await getSession();
    const tenantId = session?.tenantId ?? null;

    if (kind === "click") {
      const type = typeof body.type === "string" ? body.type : null;
      const page = typeof body.page === "string" ? body.page : null;
      if (!type || !page) {
        return NextResponse.json({ ok: false, error: "type and page required" }, { status: 400 });
      }
      await db.clickEvent.create({
        data: { type, page, sessionId, ...(tenantId ? { tenantId } : {}) } as never,
      }).catch((e) => console.error("[tracking click]", e));
      return NextResponse.json({ ok: true });
    }

    // pageview
    const path = typeof body.path === "string" ? body.path : null;
    if (!path) {
      return NextResponse.json({ ok: false, error: "path required" }, { status: 400 });
    }
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const device = detectDevice(body.userAgent || "");
    const browser = detectBrowser(body.userAgent || "");
    const country = typeof body.country === "string" ? body.country : null;
    const city = typeof body.city === "string" ? body.city : null;

    await db.pageView.create({
      data: { path, referrer, device, browser, country, city, sessionId, ...(tenantId ? { tenantId } : {}) } as never,
    }).catch((e) => console.error("[tracking pageview]", e));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tracking]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

function detectDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}
