import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { tenantId: session.tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
        { country: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      db.client.count({ where }).catch(() => 0),
      db.client
        .findMany({
          where,
          orderBy: { createdAt: "desc" },
        })
        .catch(() => []),
    ]);

    return NextResponse.json({
      ok: true,
      total,
      data: items.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        country: c.country,
        service: c.service,
        status: c.status,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[clients GET]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Le nom et l'email sont requis." },
        { status: 400 }
      );
    }

    const created = await db.client.create({
      data: {
        name,
        company: body.company?.trim() || null,
        email,
        phone: body.phone?.trim() || null,
        country: body.country?.trim() || null,
        service: body.service?.trim() || null,
        status: body.status?.trim() || "prospect",
        notes: body.notes?.trim() || null,
        tenantId: session.tenantId,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[clients POST]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
