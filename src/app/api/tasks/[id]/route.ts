import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const existing = await db.task.findUnique({ where: { id } }).catch(() => null);
  if (!existing || existing.tenantId !== session.tenantId) {
    return NextResponse.json({ ok: false, error: "Tâche introuvable" }, { status: 404 });
  }
  const body = await req.json();
  const task = await db.task.update({ where: { id }, data: { status: typeof body.status === "string" ? body.status : undefined, title: typeof body.title === "string" ? body.title.trim() : undefined, priority: typeof body.priority === "string" ? body.priority : undefined, dueDate: body.dueDate ? new Date(body.dueDate) : undefined } });
  return NextResponse.json({ ok: true, id: task.id });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const existing = await db.task.findUnique({ where: { id } }).catch(() => null);
  if (!existing || existing.tenantId !== session.tenantId) {
    return NextResponse.json({ ok: false, error: "Tâche introuvable" }, { status: 404 });
  }
  await db.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
