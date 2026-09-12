import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    // Verify tenant ownership
    const exists = await db.contactMessage.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json(
        { ok: false, error: "Message introuvable" },
        { status: 404 }
      );
    }
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[messages DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
