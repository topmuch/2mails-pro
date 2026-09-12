import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/imap";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const html = typeof body.html === "string" ? body.html : "";
    const text = typeof body.text === "string" ? body.text : "";

    if (!to || !subject) {
      return NextResponse.json(
        { ok: false, error: "Destinataire et sujet requis." },
        { status: 400 },
      );
    }

    const result = await sendEmail({
      to,
      cc: body.cc?.trim() || undefined,
      bcc: body.bcc?.trim() || undefined,
      subject,
      html,
      text,
      replyTo: body.replyTo?.trim() || undefined,
      tenantId: session.tenantId,
    });

    if (result.ok) {
      return NextResponse.json({ ok: true, messageId: result.messageId });
    }
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  } catch (err) {
    console.error("[email/send]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
