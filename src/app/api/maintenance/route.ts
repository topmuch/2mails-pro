import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const DEFAULTS = {
  enabled: false,
  messageFr: "Site en maintenance. Nous serons de retour très bientôt.",
  messageEn: "Site under maintenance. We will be back very soon.",
  endTime: null as Date | null,
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const settings = await db.maintenanceSettings
      .findUnique({ where: { tenantId: session.tenantId } })
      .catch(() => null);

    if (!settings) {
      const created = await db.maintenanceSettings
        .create({ data: { tenantId: session.tenantId, ...DEFAULTS } })
        .catch(() => null);
      if (created) {
        return NextResponse.json({
          ok: true,
          data: { ...DEFAULTS, id: created.id, tenantId: created.tenantId, updatedAt: created.updatedAt.toISOString() },
        });
      }
      return NextResponse.json({ ok: true, data: { tenantId: session.tenantId, ...DEFAULTS, updatedAt: new Date().toISOString() } });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: settings.id,
        tenantId: settings.tenantId,
        enabled: settings.enabled,
        messageFr: settings.messageFr,
        messageEn: settings.messageEn,
        endTime: settings.endTime?.toISOString() || null,
        updatedAt: settings.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[maintenance GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const data = {
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      messageFr: typeof body.messageFr === "string" ? body.messageFr.trim() || undefined : undefined,
      messageEn: typeof body.messageEn === "string" ? body.messageEn.trim() || undefined : undefined,
      endTime:
        typeof body.endTime === "string" && body.endTime
          ? new Date(body.endTime)
          : body.endTime === null
            ? null
            : undefined,
    };

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const updated = await db.maintenanceSettings.upsert({
      where: { tenantId: session.tenantId },
      create: {
        tenantId: session.tenantId,
        enabled: body.enabled ?? false,
        messageFr: body.messageFr || DEFAULTS.messageFr,
        messageEn: body.messageEn || DEFAULTS.messageEn,
        endTime: body.endTime ? new Date(body.endTime) : null,
      },
      update: cleanData,
    });

    return NextResponse.json({
      ok: true,
      data: {
        enabled: updated.enabled,
        messageFr: updated.messageFr,
        messageEn: updated.messageEn,
        endTime: updated.endTime?.toISOString() || null,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[maintenance PUT]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
