import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const invitations = await db.invitation.findMany({ where: { tenantId: session.tenantId }, orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json({ ok: true, data: invitations.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), expiresAt: i.expiresAt.toISOString() })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role : "agent";
  if (!email) return NextResponse.json({ ok: false, error: "Email requis" }, { status: 400 });
  // Check existing user
  const existing = await db.user.findUnique({ where: { email } }).catch(() => null);
  if (existing) return NextResponse.json({ ok: false, error: "Cet email est déjà utilisé" }, { status: 409 });
  // Check tenant user limit
  const tenant = await db.tenant.findUnique({ where: { id: session.tenantId } });
  const userCount = await db.user.count({ where: { tenantId: session.tenantId } });
  if (tenant && userCount >= tenant.maxUsers) {
    return NextResponse.json({ ok: false, error: `Limite atteinte (${tenant.maxUsers} utilisateurs max sur le plan ${tenant.plan})` }, { status: 403 });
  }
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const invitation = await db.invitation.create({ data: { email, role, tenantId: session.tenantId, token, expiresAt } });
  return NextResponse.json({ ok: true, id: invitation.id, token: invitation.token });
}
