import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/invitations/verify?token=TOKEN
 *
 * Public endpoint used by the registration page to verify an invitation token
 * before rendering the form. Returns the invitation's email, role and the
 * associated tenant name if the token is valid and not expired.
 *
 * Response (success):
 *   { ok: true, email, role, tenantName }
 * Response (error):
 *   { ok: false, error: string } — with 400/404/410 status codes.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")?.trim() || "";
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token d'invitation requis." },
        { status: 400 },
      );
    }

    const invitation = await db.invitation
      .findUnique({ where: { token } })
      .catch(() => null);

    if (!invitation) {
      return NextResponse.json(
        { ok: false, error: "Invitation introuvable." },
        { status: 404 },
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { ok: false, error: "Cette invitation a déjà été utilisée." },
        { status: 410 },
      );
    }

    if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
      // Mark as expired in DB for hygiene (best-effort)
      await db.invitation
        .update({ where: { id: invitation.id }, data: { status: "expired" } })
        .catch(() => {});
      return NextResponse.json(
        { ok: false, error: "Cette invitation a expiré." },
        { status: 410 },
      );
    }

    // The Invitation model has no relation defined in the Prisma schema —
    // fetch the tenant name manually.
    const tenant = await db.tenant
      .findUnique({ where: { id: invitation.tenantId } })
      .catch(() => null);

    return NextResponse.json({
      ok: true,
      email: invitation.email,
      role: invitation.role,
      tenantName: tenant?.name || null,
    });
  } catch (err) {
    console.error("[invitations/verify]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
