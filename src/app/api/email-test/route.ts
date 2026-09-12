import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

// POST /api/email-test — sends a test email to the configured notifyEmail
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const settings = await db.emailSettings
      .findUnique({ where: { tenantId: session.tenantId } })
      .catch(() => null);

    if (!settings) {
      return NextResponse.json(
        { ok: false, error: "Aucun paramètre email configuré. Allez dans Dashboard → Email & Notifications." },
        { status: 400 }
      );
    }

    if (!settings.smtpHost || !settings.smtpUser) {
      return NextResponse.json(
        { ok: false, error: `SMTP incomplet. Host: "${settings.smtpHost}", User: "${settings.smtpUser}". Configurez l'hôte et l'utilisateur SMTP.` },
        { status: 400 }
      );
    }

    if (!settings.notifyEmail) {
      return NextResponse.json(
        { ok: false, error: "Aucun email de notification configuré (notifyEmail)." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: (settings.smtpPort || 587) === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword || "",
      },
    });

    const fromEmail = settings.fromEmail || settings.smtpUser;
    const fromName = settings.fromName || "2mails.pro";
    const toEmail = body.to || settings.notifyEmail;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: "[2mails.pro] Email de test",
      text: `Ceci est un email de test depuis 2mails.pro.\n\nSi vous recevez cet email, la configuration SMTP fonctionne correctement.\n\nConfiguration utilisée :\n- Host: ${settings.smtpHost}\n- Port: ${settings.smtpPort}\n- User: ${settings.smtpUser}\n- From: ${fromEmail}\n- To: ${toEmail}`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0c1f4a; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0;">Email de test</h1>
    <p style="color: #ca8a04; margin: 8px 0 0;">2mails.pro</p>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="color: #334155; font-size: 16px;">Si vous recevez cet email, la configuration SMTP fonctionne correctement. ✅</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
    <p style="color: #64748b; font-size: 14px; margin: 0;">Configuration utilisée :</p>
    <ul style="color: #64748b; font-size: 14px;">
      <li>Host: ${settings.smtpHost}</li>
      <li>Port: ${settings.smtpPort}</li>
      <li>User: ${settings.smtpUser}</li>
      <li>From: ${fromEmail}</li>
      <li>To: ${toEmail}</li>
    </ul>
  </div>
</div>`,
    });

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      sentTo: toEmail,
      from: fromEmail,
    });
  } catch (err) {
    console.error("[email-test]", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { ok: false, error: `Échec de l'envoi: ${message}` },
      { status: 500 }
    );
  }
}
