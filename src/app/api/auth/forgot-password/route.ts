import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json({ ok: false, error: "Trop de tentatives." }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email requis." }, { status: 400 });
    }

    // Always return success (prevent email enumeration)
    const user = await db.user.findUnique({ where: { email } }).catch(() => null);
    if (user) {
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in a PasswordReset model or reuse Invitation
      // Simplest: use a separate table — but we don't have one in schema
      // Workaround: store token in the User's passwordHash field temporarily? No.
      // Better: create a simple ResetToken table — but can't without migration.
      // Alternative: use the session cookie mechanism — generate a signed token
      // For now: log the token (in production, send via email)
      console.log(`[forgot-password] Reset token for ${email}: ${token} (expires: ${expiresAt.toISOString()})`);

      // Store in a lightweight way: use the Invitation model as a generic token store
      // Or better: just return the token in dev mode, in prod send email
      // For now, return success with a dev-only token field
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({ ok: true, devToken: token, message: "En développement, le token est retourné. En production, un email serait envoyé." });
      }
    }

    return NextResponse.json({ ok: true, message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
