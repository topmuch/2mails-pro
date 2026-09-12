import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const deal = await db.deal.update({ where: { id }, data: { stage: typeof body.stage === "string" ? body.stage : undefined, title: typeof body.title === "string" ? body.title.trim() : undefined, value: typeof body.value === "number" ? body.value : undefined, closeDate: body.closeDate ? new Date(body.closeDate) : undefined, assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : undefined } });
  return NextResponse.json({ ok: true, id: deal.id });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await db.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
