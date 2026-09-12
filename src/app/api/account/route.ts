import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const tenant = await db.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) return NextResponse.json({ ok: false, error: "Tenant introuvable" }, { status: 404 });
  const userCount = await db.user.count({ where: { tenantId: session.tenantId } });
  const clientCount = await db.client.count({ where: { tenantId: session.tenantId } });
  const dealCount = await db.deal.count({ where: { tenantId: session.tenantId } });
  return NextResponse.json({
    ok: true,
    data: {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      maxUsers: tenant.maxUsers,
      currentUsers: userCount,
      currentClients: clientCount,
      currentDeals: dealCount,
      createdAt: tenant.createdAt.toISOString(),
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.domain === "string") data.domain = body.domain.trim() || null;
  if (typeof body.plan === "string") {
    data.plan = body.plan;
    // Update maxUsers based on plan
    const limits: Record<string, number> = { free: 2, pro: 10, business: 50 };
    data.maxUsers = limits[body.plan] ?? 2;
  }
  const updated = await db.tenant.update({ where: { id: session.tenantId }, data });
  return NextResponse.json({ ok: true, data: { name: updated.name, domain: updated.domain, plan: updated.plan, maxUsers: updated.maxUsers } });
}
