import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULTS = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  fromEmail: "noreply@2mails.pro",
  fromName: "2mails.pro",
  notifyEmail: "contact@2mails.pro",
  notifyOnContact: true,
  notifyOnAppointment: true,
};

export async function GET() {
  try {
    const settings = await db.emailSettings
      .findUnique({ where: { id: "singleton" } })
      .catch(() => null);

    if (!settings) {
      const created = await db.emailSettings
        .create({ data: { id: "singleton", ...DEFAULTS } })
        .catch(() => null);
      if (created) {
        return NextResponse.json({ ok: true, data: format(created) });
      }
      return NextResponse.json({ ok: true, data: { id: "singleton", ...DEFAULTS } });
    }
    return NextResponse.json({ ok: true, data: format(settings) });
  } catch (err) {
    console.error("[email-settings GET]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

function format(s: {
  id: string; smtpHost: string | null; smtpPort: number | null;
  smtpUser: string | null; smtpPassword: string | null; fromEmail: string | null;
  fromName: string | null; notifyEmail: string | null;
  notifyOnContact: boolean; notifyOnAppointment: boolean;
  imapHost: string | null; imapPort: number | null;
  imapUser: string | null; imapPassword: string | null;
  updatedAt: Date;
}) {
  return {
    id: s.id,
    smtpHost: s.smtpHost || "",
    smtpPort: s.smtpPort || 587,
    smtpUser: s.smtpUser || "",
    smtpPassword: s.smtpPassword || "",
    fromEmail: s.fromEmail || "",
    fromName: s.fromName || "",
    notifyEmail: s.notifyEmail || "",
    notifyOnContact: s.notifyOnContact,
    notifyOnAppointment: s.notifyOnAppointment,
    imapHost: s.imapHost || "",
    imapPort: s.imapPort || 993,
    imapUser: s.imapUser || "",
    imapPassword: s.imapPassword || "",
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = {
      smtpHost: typeof body.smtpHost === "string" ? body.smtpHost.trim() || null : undefined,
      smtpPort: typeof body.smtpPort === "number" ? body.smtpPort : undefined,
      smtpUser: typeof body.smtpUser === "string" ? body.smtpUser.trim() || null : undefined,
      // Password: only update if non-empty (don't overwrite with empty when user didn't re-enter)
      smtpPassword: typeof body.smtpPassword === "string" && body.smtpPassword !== "" ? body.smtpPassword : undefined,
      fromEmail: typeof body.fromEmail === "string" ? body.fromEmail.trim() || null : undefined,
      fromName: typeof body.fromName === "string" ? body.fromName.trim() || null : undefined,
      notifyEmail: typeof body.notifyEmail === "string" ? body.notifyEmail.trim() || null : undefined,
      notifyOnContact: typeof body.notifyOnContact === "boolean" ? body.notifyOnContact : undefined,
      notifyOnAppointment: typeof body.notifyOnAppointment === "boolean" ? body.notifyOnAppointment : undefined,
      imapHost: typeof body.imapHost === "string" ? body.imapHost.trim() || null : undefined,
      imapPort: typeof body.imapPort === "number" ? body.imapPort : undefined,
      imapUser: typeof body.imapUser === "string" ? body.imapUser.trim() || null : undefined,
      // Password: only update if non-empty (don't overwrite with empty when user didn't re-enter)
      imapPassword: typeof body.imapPassword === "string" && body.imapPassword !== "" ? body.imapPassword : undefined,
    };

    // Remove undefined keys (fields not provided or empty passwords)
    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

    const updated = await db.emailSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        smtpHost: body.smtpHost || null,
        smtpPort: typeof body.smtpPort === "number" ? body.smtpPort : 587,
        smtpUser: body.smtpUser || null,
        smtpPassword: body.smtpPassword || null,
        fromEmail: body.fromEmail || "noreply@2mails.pro",
        fromName: body.fromName || "2mails.pro",
        notifyEmail: body.notifyEmail || "contact@2mails.pro",
        notifyOnContact: body.notifyOnContact ?? true,
        notifyOnAppointment: body.notifyOnAppointment ?? true,
        imapHost: body.imapHost || null,
        imapPort: typeof body.imapPort === "number" ? body.imapPort : 993,
        imapUser: body.imapUser || null,
        imapPassword: body.imapPassword || null,
      },
      update: cleanData,
    });

    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    console.error("[email-settings PUT]", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
