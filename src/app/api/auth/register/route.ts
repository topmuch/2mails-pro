import { NextRequest, NextResponse } from "next/server";
import { registerTenant } from "@/lib/auth";
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
