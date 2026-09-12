import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const where: Record<string, unknown> = { tenantId: session.tenantId };
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  const tasks = await db.task.findMany({ where, include: { client: true }, orderBy: { dueDate: "asc" } }).catch(() => []);
  return NextResponse.json({ ok: true, data: tasks.map(t => ({ ...t, clientName: t.client?.name || "—", dueDate: t.dueDate?.toISOString() || null, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ ok: false, error: "Titre requis" }, { status: 400 });
  const task = await db.task.create({ data: { title, description: body.description?.trim() || null, status: body.status || "pending", priority: body.priority || "medium", dueDate: body.dueDate ? new Date(body.dueDate) : null, clientId: body.clientId || null, tenantId: session.tenantId, assignedTo: body.assignedTo || null } });
  return NextResponse.json({ ok: true, id: task.id });
}
