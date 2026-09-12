import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "twomails_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Simple async hash using Web Crypto API (available in Next.js runtime)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const computed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === hash;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string | null;
};

/**
 * Creates a Tenant (organisation) with the default free plan and a 2-user cap.
 */
export async function createTenant(name: string) {
  return db.tenant.create({
    data: {
      name,
      plan: "free",
      status: "active",
      maxUsers: 2,
    },
  });
}

/**
 * Creates a user, optionally linked to an existing tenant.
 * If no tenantId is provided, the user is created without a tenant
 * (legacy / super-admin scenario) — use registerTenant() for the full flow.
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
  tenantId?: string,
  role: string = "admin",
) {
  const passwordHash = await hashPassword(password);
  return db.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role,
      tenantId: tenantId || null,
    },
  });
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await db.user.findUnique({ where: { email } }).catch(() => null);
  if (!user || !user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
  };
}

/**
 * Seeds the default per-tenant settings (EmailSettings, SeoSettings, MaintenanceSettings).
 * Idempotent — skips any record that already exists for the tenant.
 */
export async function seedTenantSettings(tenantId: string, tenantName: string) {
  const existingEmail = await db.emailSettings.findUnique({ where: { tenantId } }).catch(() => null);
  if (!existingEmail) {
    await db.emailSettings.create({
      data: { tenantId, fromName: tenantName },
    });
  }

  const existingSeo = await db.seoSettings.findUnique({ where: { tenantId } }).catch(() => null);
  if (!existingSeo) {
    await db.seoSettings.create({
      data: {
        tenantId,
        siteTitle: `${tenantName} — CRM & Email Management`,
        metaDescription: `${tenantName} — powered by 2mails.pro CRM SaaS`,
        keywords: `${tenantName}, CRM, email management, 2mails.pro`,
      },
    });
  }

  const existingMaintenance = await db.maintenanceSettings
    .findUnique({ where: { tenantId } })
    .catch(() => null);
  if (!existingMaintenance) {
    await db.maintenanceSettings.create({
      data: { tenantId },
    });
  }
}

/**
 * Full tenant registration flow:
 *   1. Creates the Tenant (free plan, maxUsers=2)
 *   2. Creates the admin User linked to that tenant
 *   3. Seeds default EmailSettings, SeoSettings, MaintenanceSettings
 *   4. Creates the session (cookie)
 * Returns the freshly-created user + tenant.
 */
export async function registerTenant(
  email: string,
  password: string,
  name: string,
  tenantName: string,
): Promise<{ user: Awaited<ReturnType<typeof createUser>>; tenant: Awaited<ReturnType<typeof createTenant>> }> {
  const tenant = await createTenant(tenantName);
  const user = await createUser(email, password, name, tenant.id, "admin");
  await seedTenantSettings(tenant.id, tenantName);

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: tenant.id,
  };
  await createSession(sessionUser);
  return { user, tenant };
}

export async function createSession(user: SessionUser) {
  const payload = JSON.stringify(user);
  const encoded = Buffer.from(payload, "utf-8").toString("base64");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as Partial<SessionUser>;
    if (!parsed?.id || !parsed?.email) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name ?? null,
      role: parsed.role ?? "user",
      tenantId: parsed.tenantId ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
