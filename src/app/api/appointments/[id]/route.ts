import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    // Verify tenant ownership
    const exists = await db.appointment.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Rendez-vous introuvable" }, { status: 404 });
    }
    const updated = await db.appointment.update({
      where: { id },
      data: {
        status: typeof body.status === "string" ? body.status : undefined,
      },
    });
    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("[appointments PUT]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    // Verify tenant ownership
    const exists = await db.appointment.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Rendez-vous introuvable" }, { status: 404 });
    }
    await db.appointment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[appointments DELETE]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
