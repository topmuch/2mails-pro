import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendAppointmentNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const where: Record<string, unknown> = { tenantId: session.tenantId };
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      db.appointment.count({ where }).catch(() => 0),
      db.appointment.findMany({ where, orderBy: { createdAt: "desc" } }).catch(() => []),
    ]);

    return NextResponse.json({
      ok: true,
      total,
      data: items.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        company: a.company,
        subject: a.subject,
        preferredDate: a.preferredDate,
        preferredTime: a.preferredTime,
        message: a.message,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[appointments GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Nom, email et message requis." },
        { status: 400 }
      );
    }

    // Public endpoint: try session for tenant attribution, fall back to no tenantId
    // (the record can be assigned to a tenant later).
    const session = await getSession();
    const tenantId = session?.tenantId ?? null;

    let createdId: string | null = null;
    try {
      const created = await db.appointment.create({
        data: {
          name,
          email,
          phone: body.phone?.trim() || null,
          company: body.company?.trim() || null,
          subject: body.subject?.trim() || null,
          preferredDate: body.preferredDate?.trim() || null,
          preferredTime: body.preferredTime?.trim() || null,
          message,
          status: "pending",
          ...(tenantId ? { tenantId } : {}),
        } as never,
      });
      createdId = created.id;
    } catch (dbErr) {
      console.error("[appointments] DB write failed:", dbErr);
    }

    // Send email notification (non-blocking)
    const phone = body.phone?.trim() || null;
    const company = body.company?.trim() || null;
    const subjectField = body.subject?.trim() || null;
    const preferredDate = body.preferredDate?.trim() || null;
    const preferredTime = body.preferredTime?.trim() || null;
    sendAppointmentNotification(
      {
        name,
        email,
        phone,
        company,
        subject: subjectField,
        preferredDate,
        preferredTime,
        message,
      },
      tenantId,
    )
      .then((sent) => {
        if (sent) console.log("[appointments] Email notification sent");
        else console.log("[appointments] Email notification not sent (disabled or config missing)");
      })
      .catch((e) => console.error("[appointments] Email send error:", e));

    return NextResponse.json({ ok: true, id: createdId });
  } catch (err) {
    console.error("[appointments POST]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
