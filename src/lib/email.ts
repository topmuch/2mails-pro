import nodemailer from "nodemailer";
import { db } from "@/lib/db";

type EmailSettings = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  fromEmail: string | null;
  fromName: string | null;
  notifyEmail: string | null;
  notifyOnContact: boolean;
  notifyOnAppointment: boolean;
};

async function getEmailSettings(): Promise<EmailSettings | null> {
  const settings = await db.emailSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);
  if (!settings) return null;
  return {
    smtpHost: settings.smtpHost,
    smtpPort: settings.smtpPort,
    smtpUser: settings.smtpUser,
    smtpPassword: settings.smtpPassword,
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
    notifyEmail: settings.notifyEmail,
    notifyOnContact: settings.notifyOnContact,
    notifyOnAppointment: settings.notifyOnAppointment,
  };
}

function createTransporter(s: EmailSettings) {
  if (!s.smtpHost || !s.smtpUser) {
    throw new Error("SMTP non configuré (host/user manquant)");
  }
  return nodemailer.createTransport({
    host: s.smtpHost,
    port: s.smtpPort || 587,
    secure: (s.smtpPort || 587) === 465,
    auth: {
      user: s.smtpUser,
      pass: s.smtpPassword || "",
    },
  });
}

type NotificationEmail = {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  html: string;
  text: string;
};

async function sendMail(payload: NotificationEmail): Promise<boolean> {
  const settings = await getEmailSettings();
  if (!settings) {
    console.warn("[email] No email settings found in DB");
    return false;
  }
  try {
    const transporter = createTransporter(settings);
    await transporter.sendMail({
      from: `"${payload.fromName}" <${payload.from}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    console.log(`[email] Sent to ${payload.to}: ${payload.subject}`);
    return true;
  } catch (err) {
    console.error("[email] Send failed:", err);
    return false;
  }
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): Promise<boolean> {
  const settings = await getEmailSettings();
  if (!settings || !settings.notifyOnContact || !settings.notifyEmail) {
    console.log("[email] Contact notification disabled or no notifyEmail");
    return false;
  }
  const fromEmail = settings.fromEmail || settings.smtpUser || "noreply@2mails.pro";
  const fromName = settings.fromName || "2mails.pro";

  const subject = `[2mails.pro] Nouveau message de contact${data.subject ? ` — ${data.subject}` : ""}`;
  const text = `Nouveau message de contact reçu sur le site 2mails.pro.

De : ${data.name} <${data.email}>
Téléphone : ${data.phone || "—"}
Sujet : ${data.subject || "—"}

Message :
${data.message}

---
Cet email a été envoyé automatiquement depuis le formulaire de contact du site.`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: #0c1f4a; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nouveau message de contact</h1>
    <p style="color: #ca8a04; margin: 8px 0 0; font-size: 14px;">2mails.pro — Site web</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
    <table style="width: 100%; font-size: 14px; color: #334155;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Nom :</td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email :</td><td><a href="mailto:${escapeHtml(data.email)}" style="color: #1e3a8a;">${escapeHtml(data.email)}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone :</td><td>${data.phone ? escapeHtml(data.phone) : "—"}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Sujet :</td><td>${data.subject ? escapeHtml(data.subject) : "—"}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
    <p style="font-weight: bold; color: #334155; margin: 0 0 8px;">Message :</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #334155; line-height: 1.6;">${escapeHtml(data.message)}</div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; border-radius: 0 0 12px 12px; font-size: 12px; color: #64748b; text-align: center;">
    Email automatique envoyé depuis le formulaire de contact du site 2mails.pro
  </div>
</div>`;

  return sendMail({
    to: settings.notifyEmail,
    from: fromEmail,
    fromName,
    subject,
    html,
    text,
  });
}

export async function sendAppointmentNotification(data: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message: string;
}): Promise<boolean> {
  const settings = await getEmailSettings();
  if (!settings || !settings.notifyOnAppointment || !settings.notifyEmail) {
    console.log("[email] Appointment notification disabled or no notifyEmail");
    return false;
  }
  const fromEmail = settings.fromEmail || settings.smtpUser || "noreply@2mails.pro";
  const fromName = settings.fromName || "2mails.pro";

  const subject = `[2mails.pro] Nouvelle demande de rendez-vous — ${data.name}`;
  const text = `Nouvelle demande de rendez-vous reçue sur le site 2mails.pro.

De : ${data.name} <${data.email}>
Téléphone : ${data.phone || "—"}
Société : ${data.company || "—"}
Sujet : ${data.subject || "—"}
Date souhaitée : ${data.preferredDate || "—"}
Heure souhaitée : ${data.preferredTime || "—"}

Message :
${data.message}

---
Cet email a été envoyé automatiquement depuis le formulaire de rendez-vous du site.`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
  <div style="background: #0c1f4a; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nouvelle demande de rendez-vous</h1>
    <p style="color: #ca8a04; margin: 8px 0 0; font-size: 14px;">2mails.pro — Site web</p>
  </div>
  <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
    <table style="width: 100%; font-size: 14px; color: #334155;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Nom :</td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email :</td><td><a href="mailto:${escapeHtml(data.email)}" style="color: #1e3a8a;">${escapeHtml(data.email)}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone :</td><td>${data.phone ? escapeHtml(data.phone) : "—"}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Société :</td><td>${data.company ? escapeHtml(data.company) : "—"}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Sujet :</td><td>${data.subject ? escapeHtml(data.subject) : "—"}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Date souhaitée :</td><td>${data.preferredDate ? escapeHtml(data.preferredDate) : "—"}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Heure souhaitée :</td><td>${data.preferredTime ? escapeHtml(data.preferredTime) : "—"}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
    <p style="font-weight: bold; color: #334155; margin: 0 0 8px;">Message :</p>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #334155; line-height: 1.6;">${escapeHtml(data.message)}</div>
  </div>
  <div style="background: #f1f5f9; padding: 16px 24px; border-radius: 0 0 12px 12px; font-size: 12px; color: #64748b; text-align: center;">
    Email automatique envoyé depuis le formulaire de rendez-vous du site 2mails.pro
  </div>
</div>`;

  return sendMail({
    to: settings.notifyEmail,
    from: fromEmail,
    fromName,
    subject,
    html,
    text,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
