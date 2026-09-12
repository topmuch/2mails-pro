import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const existing = await db.interaction.findUnique({ where: { id } }).catch(() => null);
  if (!existing || existing.tenantId !== session.tenantId) {
    return NextResponse.json({ ok: false, error: "Interaction introuvable" }, { status: 404 });
  }
  await db.interaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
