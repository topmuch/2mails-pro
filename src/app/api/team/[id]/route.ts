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
    const exists = await db.teamMember.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Membre introuvable" }, { status: 404 });
    }

    const updated = await db.teamMember.update({
      where: { id },
      data: {
        name: typeof body.name === "string" ? body.name.trim() : undefined,
        role: typeof body.role === "string" ? body.role.trim() : undefined,
        email: body.email !== undefined ? (body.email?.trim() || null) : undefined,
        phone: body.phone !== undefined ? (body.phone?.trim() || null) : undefined,
        bio: body.bio !== undefined ? (body.bio?.trim() || null) : undefined,
        photoUrl: body.photoUrl !== undefined ? (body.photoUrl?.trim() || null) : undefined,
        yearsExperience:
          body.yearsExperience !== undefined
            ? typeof body.yearsExperience === "number"
              ? body.yearsExperience
              : null
            : undefined,
        order: typeof body.order === "number" ? body.order : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("[team PUT]", err);
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
    const exists = await db.teamMember.findUnique({ where: { id } }).catch(() => null);
    if (!exists || exists.tenantId !== session.tenantId) {
      return NextResponse.json({ ok: false, error: "Membre introuvable" }, { status: 404 });
    }
    await db.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team DELETE]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
