import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const invitation = await db.invitation.findUnique({ where: { id } }).catch(() => null);
  if (!invitation || invitation.tenantId !== session.tenantId) {
    return NextResponse.json({ ok: false, error: "Invitation introuvable" }, { status: 404 });
  }
  await db.invitation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
