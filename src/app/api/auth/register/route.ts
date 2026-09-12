import { NextRequest, NextResponse } from "next/server";
import { createUser, registerTenant, createSession } from "@/lib/auth";
import { db } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Requête invalide." },
        { status: 400 },
      );
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const tenantName = typeof body.tenantName === "string" ? body.tenantName.trim() : "";
    const inviteToken =
      typeof body.inviteToken === "string" ? body.inviteToken.trim() : "";

    // --- Invitation acceptance flow ------------------------------------------
    if (inviteToken) {
      if (!email || !password || !name) {
        return NextResponse.json(
          {
            ok: false,
            error: "Tous les champs sont requis : nom, email, mot de passe.",
          },
          { status: 400 },
        );
      }
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { ok: false, error: "Adresse email invalide." },
          { status: 400 },
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { ok: false, error: "Le mot de passe doit contenir au moins 6 caractères." },
          { status: 400 },
        );
      }

      // Look up the invitation
      const invitation = await db.invitation
        .findUnique({ where: { token: inviteToken } })
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
        await db.invitation
          .update({ where: { id: invitation.id }, data: { status: "expired" } })
          .catch(() => {});
        return NextResponse.json(
          { ok: false, error: "Cette invitation a expiré." },
          { status: 410 },
        );
      }

      // Security: the email provided must match the invited email.
      if (invitation.email !== email) {
        return NextResponse.json(
          {
            ok: false,
            error: "L'email ne correspond pas à celui de l'invitation.",
          },
          { status: 403 },
        );
      }

      // Prevent duplicate accounts
      const existing = await db.user.findUnique({ where: { email } }).catch(() => null);
      if (existing) {
        return NextResponse.json(
          { ok: false, error: "Un compte existe déjà avec cet email." },
          { status: 409 },
        );
      }

      // Check tenant user limit (protection even for invited users)
      const tenant = await db.tenant
        .findUnique({ where: { id: invitation.tenantId } })
        .catch(() => null);
      if (!tenant) {
        return NextResponse.json(
          { ok: false, error: "Organisation introuvable." },
          { status: 404 },
        );
      }
      const userCount = await db.user
        .count({ where: { tenantId: tenant.id } })
        .catch(() => 0);
      if (userCount >= tenant.maxUsers) {
        return NextResponse.json(
          {
            ok: false,
            error: `Limite atteinte (${tenant.maxUsers} utilisateurs max sur le plan ${tenant.plan}). Contactez l'administrateur.`,
          },
          { status: 403 },
        );
      }

      // Create the user, linked to the invitation's tenant, with the invited role.
      const role = invitation.role || "agent";
      const user = await createUser(email, password, name, tenant.id, role);

      // Mark the invitation as accepted
      await db.invitation
        .update({ where: { id: invitation.id }, data: { status: "accepted" } })
        .catch(() => {});

      // Create the session cookie
      await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
      });

      return NextResponse.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant.id,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          plan: tenant.plan,
          maxUsers: tenant.maxUsers,
        },
      });
    }

    // --- Default tenant registration flow -------------------------------------
    if (!email || !password || !name || !tenantName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tous les champs sont requis : organisation, nom, email, mot de passe.",
        },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Adresse email invalide." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({ where: { email } }).catch(() => null);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Un compte existe déjà avec cet email." },
        { status: 409 },
      );
    }

    // registerTenant() will:
    //   1. create the Tenant (free plan, maxUsers=2)
    //   2. create the admin User linked to that tenant
    //   3. seed default EmailSettings, SeoSettings, MaintenanceSettings
    //   4. create the session cookie
    const { user, tenant } = await registerTenant(email, password, name, tenantName);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        maxUsers: tenant.maxUsers,
      },
    });
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
