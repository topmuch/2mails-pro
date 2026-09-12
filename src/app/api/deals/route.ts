import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const deals = await db.deal.findMany({ where: { tenantId: session.tenantId }, include: { client: true }, orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json({ ok: true, data: deals.map(d => ({ ...d, clientName: d.client?.name || "—", closeDate: d.closeDate?.toISOString() || null, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ ok: false, error: "Titre requis" }, { status: 400 });
  const deal = await db.deal.create({ data: { title, value: Number(body.value) || 0, stage: body.stage || "lead", clientId: body.clientId, tenantId: session.tenantId, assignedTo: body.assignedTo || null, closeDate: body.closeDate ? new Date(body.closeDate) : null } });
  return NextResponse.json({ ok: true, id: deal.id });
}
