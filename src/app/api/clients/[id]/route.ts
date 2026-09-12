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
    const exists = await db.client.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Client introuvable" }, { status: 404 });
    }

    const updated = await db.client.update({
      where: { id },
      data: {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        company: body.company !== undefined ? (body.company?.trim() || null) : undefined,
        email: typeof body.email === "string" ? body.email.trim() : undefined,
        phone: body.phone !== undefined ? (body.phone?.trim() || null) : undefined,
        country: body.country !== undefined ? (body.country?.trim() || null) : undefined,
        service: body.service !== undefined ? (body.service?.trim() || null) : undefined,
        status: typeof body.status === "string" ? body.status.trim() : undefined,
        notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined,
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("[clients PUT]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
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
    const exists = await db.client.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Client introuvable" }, { status: 404 });
    }
    await db.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[clients DELETE]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
