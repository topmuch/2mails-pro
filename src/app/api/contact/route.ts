import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Champs requis manquants (name, email, message)." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { ok: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Message trop long (max 5000 caractères)." },
        { status: 400 }
      );
    }

    // Public endpoint: try to resolve a tenant from the session cookie. If the
    // submitter is a logged-in dashboard user, attribute the message to their
    // tenant. If anonymous, leave tenantId unset (record can be reassigned
    // later) — wrapped in its own try/catch so a NOT NULL violation on the
    // column doesn't break the response.
    const session = await getSession();
    const tenantId = session?.tenantId ?? null;

    // Store in DB
    let recordId: string | null = null;
    try {
      const record = await db.contactMessage.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject: subject || null,
          message,
          ...(tenantId ? { tenantId } : {}),
        } as never,
      });
      recordId = record.id;
    } catch (dbErr) {
      console.error("[contact] DB write failed:", dbErr);
    }

    // Send email notification (non-blocking, failures don't break the response)
    sendContactNotification(
      { name, email, phone: phone || null, subject: subject || null, message },
      tenantId,
    )
      .then((sent) => {
        if (sent) console.log("[contact] Email notification sent");
        else console.log("[contact] Email notification not sent (disabled or config missing)");
      })
      .catch((e) => console.error("[contact] Email send error:", e));

    return NextResponse.json({ ok: true, id: recordId });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur inattendue." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "2mails.pro — Contact API",
    methods: ["POST"],
  });
}
