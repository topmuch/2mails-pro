import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const where: Record<string, unknown> = { tenantId: session.tenantId };
  if (clientId) where.clientId = clientId;
  const items = await db.interaction.findMany({ where, orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json({ ok: true, data: items.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const type = typeof body.type === "string" ? body.type : "note";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const clientId = typeof body.clientId === "string" ? body.clientId : "";
  if (!content || !clientId) return NextResponse.json({ ok: false, error: "Contenu et client requis" }, { status: 400 });
  const interaction = await db.interaction.create({ data: { type, content, clientId, tenantId: session.tenantId, createdBy: session.id } });
  return NextResponse.json({ ok: true, id: interaction.id });
}
