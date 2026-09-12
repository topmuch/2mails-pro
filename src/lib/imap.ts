import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

type EmailSettings = {
  imapHost: string | null;
  imapPort: number | null;
  imapUser: string | null;
  imapPassword: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  fromEmail: string | null;
  fromName: string | null;
};

export async function getEmailConfig(tenantId?: string | null): Promise<EmailSettings | null> {
  // Read per-tenant settings. When a tenantId is provided, look it up directly.
  // When omitted (e.g. legacy callers / public endpoints without a session),
  // fall back to the first available settings row so IMAP/SMTP still works in
  // a single-tenant dev setup.
  const settings = tenantId
    ? await db.emailSettings.findUnique({ where: { tenantId } }).catch(() => null)
    : await db.emailSettings.findFirst().catch(() => null);
  if (!settings) return null;
  return {
    imapHost: settings.imapHost || settings.smtpHost,
    imapPort: settings.imapPort || 993,
    imapUser: settings.imapUser || settings.smtpUser,
    imapPassword: settings.imapPassword || settings.smtpPassword,
    smtpHost: settings.smtpHost,
    smtpPort: settings.smtpPort,
    smtpUser: settings.smtpUser,
    smtpPassword: settings.smtpPassword,
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
  };
}

export type InboxEmail = {
  uid: number;
  from: string;
  fromAddress: string;
  to: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
};

export type EmailDetail = InboxEmail & {
  bodyHtml: string;
  bodyText: string;
  attachments: { filename: string; contentType: string; size: number }[];
};

async function createImapClient(config: EmailSettings): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: config.imapHost,
    port: config.imapPort || 993,
    secure: true,
    auth: {
      user: config.imapUser,
      pass: config.imapPassword,
    },
    logger: false,
  });
  try {
    await client.connect();
    return client;
  } catch (err) {
    // ImapFlow errors often have additional fields like responseText, executedCommand
    const errObj = err as { message?: string; responseText?: string; executedCommand?: string; code?: string };
    const msg = errObj.message || String(err);
    const extra = [errObj.responseText, errObj.executedCommand].filter(Boolean).join(" | ");
    const fullMsg = extra ? `${msg} (${extra})` : msg;
    console.error("[imap] connect error:", fullMsg, err);

    if (/AUTHENTICATE|authentication|login|BadCredentials|Invalid login/i.test(fullMsg)) {
      throw new Error("Authentification IMAP échouée. Vérifiez l'utilisateur et le mot de passe IMAP dans Dashboard → Email & Notifications. Pour Gmail, utilisez un mot de passe d'application (16 caractères), pas votre mot de passe habituel.");
    }
    if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|connect/i.test(fullMsg)) {
      throw new Error(`Connexion IMAP impossible à ${config.imapHost}:${config.imapPort || 993}. Vérifiez l'hôte et le port IMAP dans les paramètres email.`);
    }
    // Generic fallback with full detail for debugging
    throw new Error(`Connexion IMAP échouée (${config.imapHost}:${config.imapPort || 993}): ${fullMsg}. Vérifiez vos paramètres IMAP dans Dashboard → Email & Notifications.`);
  }
}

export async function fetchInbox(opts: {
  page?: number;
  limit?: number;
  folder?: string;
  search?: string;
  unreadOnly?: boolean;
}): Promise<{ emails: InboxEmail[]; total: number }> {
  const config = await getEmailConfig();
  if (!config || !config.imapHost || !config.imapUser || !config.imapPassword) {
    throw new Error("IMAP non configuré. Allez dans Dashboard → Email & Notifications.");
  }
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const folder = opts.folder || "INBOX";
  const client = await createImapClient(config);

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      // Search for messages — exclude deleted messages
      let searchCriteria;
      if (opts.unreadOnly) {
        searchCriteria = { seen: false, not: { deleted: true } };
      } else if (opts.search) {
        searchCriteria = { OR: [{ from: opts.search }, { subject: opts.search }, { body: opts.search }], not: { deleted: true } };
      } else {
        searchCriteria = { all: true, not: { deleted: true } };
      }
      const uids = await client.search(searchCriteria, { uid: true });
      const total = uids.length;
      // Reverse (newest first) and paginate
      uids.reverse();
      const pageUids = uids.slice((page - 1) * limit, page * limit);

      const emails: InboxEmail[] = [];
      for (const uid of pageUids) {
        const msg = await client.fetchOne(uid, { envelope: true, flags: true, bodyStructure: true }, { uid: true });
        if (!msg) continue;
        const env = msg.envelope;
        const fromAddr = env?.from?.[0] ? `${env.from[0].name || ""} <${env.from[0].address || ""}>`.trim() : "Inconnu";
        const fromName = env?.from?.[0]?.name || env?.from?.[0]?.address || "Inconnu";
        const preview = env?.subject ? env.subject.slice(0, 100) : "(sans objet)";
        const hasAttachments = (msg.bodyStructure as { childNodes?: unknown[] })?.childNodes?.some(
          (c: { disposition?: string }) => c?.disposition === "attachment"
        ) || false;

        emails.push({
          uid,
          from: fromName,
          fromAddress: env?.from?.[0]?.address || "",
          to: env?.to?.map((t: { address?: string }) => t.address).join(", ") || "",
          subject: env?.subject || "(sans objet)",
          preview,
          date: env?.date ? env.date.toISOString() : new Date().toISOString(),
          isRead: msg.flags?.has("\\Seen") || false,
          hasAttachments: Boolean(hasAttachments),
        });
      }

      return { emails, total };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function fetchEmailDetail(uid: number, folder = "INBOX"): Promise<EmailDetail> {
  const config = await getEmailConfig();
  if (!config || !config.imapHost || !config.imapUser || !config.imapPassword) {
    throw new Error("IMAP non configuré.");
  }
  const client = await createImapClient(config);

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      // Fetch full message source
      const msg = await client.fetchOne(uid, { source: true, envelope: true, flags: true, bodyStructure: true }, { uid: true });
      if (!msg) throw new Error("Email introuvable");

      const source = msg.source instanceof Buffer ? msg.source : Buffer.from(msg.source as string);
      const parsed = await simpleParser(source);
      const env = msg.envelope;
      const fromName = env?.from?.[0]?.name || env?.from?.[0]?.address || "Inconnu";
      const hasAttachments = (msg.bodyStructure as { childNodes?: unknown[] })?.childNodes?.some(
        (c: { disposition?: string }) => c?.disposition === "attachment"
      ) || false;

      const attachments = (parsed.attachments || []).map((a) => ({
        filename: a.filename || "sans-nom",
        contentType: a.contentType || "application/octet-stream",
        size: a.size || 0,
      }));

      // Mark as read
      await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });

      return {
        uid,
        from: fromName,
        fromAddress: env?.from?.[0]?.address || "",
        to: env?.to?.map((t: { address?: string }) => t.address).join(", ") || "",
        subject: env?.subject || "(sans objet)",
        preview: env?.subject || "",
        date: env?.date ? env.date.toISOString() : new Date().toISOString(),
        isRead: msg.flags?.has("\\Seen") || true,
        hasAttachments: Boolean(hasAttachments),
        bodyHtml: parsed.html || parsed.textAsHtml || "",
        bodyText: parsed.text || "",
        attachments,
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function markEmailRead(uid: number, folder = "INBOX"): Promise<void> {
  const config = await getEmailConfig();
  if (!config || !config.imapHost || !config.imapUser || !config.imapPassword) {
    throw new Error("IMAP non configuré.");
  }
  const client = await createImapClient(config);
  try {
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function deleteEmail(uid: number, folder = "INBOX"): Promise<void> {
  const config = await getEmailConfig();
  if (!config || !config.imapHost || !config.imapUser || !config.imapPassword) {
    throw new Error("IMAP non configuré.");
  }
  const client = await createImapClient(config);
  try {
    // Try the direct messageDelete method first (cleanest approach)
    let deleted = false;
    try {
      // ImapFlow has a messageDelete method that marks + expunges in one call
      const result = await (client as unknown as {
        messageDelete: (range: number, opts?: { uid?: boolean }) => Promise<boolean>;
      }).messageDelete(uid, { uid: true });
      deleted = Boolean(result);
    } catch (e) {
      console.warn("[imap] messageDelete failed, falling back to flag+expunge:", e);
    }

    // Fallback: mark as \Deleted then expunge manually
    if (!deleted) {
      const lock = await client.getMailboxLock(folder);
      try {
        await client.messageFlagsAdd(uid, ["\\Deleted"], { uid: true });
        // Try to call expunge if the method exists
        const clientWithExpunge = client as unknown as {
          expunge?: () => Promise<unknown>;
          mailboxExpunge?: () => Promise<unknown>;
        };
        if (typeof clientWithExpunge.expunge === "function") {
          await clientWithExpunge.expunge();
        } else if (typeof clientWithExpunge.mailboxExpunge === "function") {
          await clientWithExpunge.mailboxExpunge();
        }
      } finally {
        lock.release();
      }
    }
  } catch (err) {
    console.error("[imap] deleteEmail error:", err);
    throw new Error(`Impossible de supprimer l'email: ${err instanceof Error ? err.message : "erreur IMAP"}`);
  } finally {
    await client.logout();
  }
}

export async function sendEmail(opts: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const config = await getEmailConfig();
  if (!config || !config.smtpHost || !config.smtpUser) {
    return { ok: false, error: "SMTP non configuré." };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort || 587,
      secure: (config.smtpPort || 587) === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword || "",
      },
    });
    const fromEmail = config.fromEmail || config.smtpUser;
    const fromName = config.fromName || "2mails.pro";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      cc: opts.cc || undefined,
      bcc: opts.bcc || undefined,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo || undefined,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return { ok: false, error: message };
  }
}
