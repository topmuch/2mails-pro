import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

const SESSION_COOKIE = "twomails_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// HMAC secret used to sign session cookies. Must be set via env in production.
// Falls back to a dev-only value for local development.
const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-only-session-secret-DO-NOT-USE-IN-PROD-please-set-SESSION_SECRET-env-var";

/**
 * Hashes a password using bcrypt (cost factor 10).
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  try {
    return await bcrypt.compare(password, stored);
  } catch {
    return false;
  }
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

/**
 * Computes the HMAC-SHA256 signature (base64) of `payload` using SESSION_SECRET.
 */
function signPayload(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload, "utf-8").digest("base64");
}

/**
 * Verifies an HMAC-SHA256 signature (constant-time) for `payload`.
 */
function verifySignature(payload: string, signature: string): boolean {
  const expected = signPayload(payload);
  const expectedBuf = Buffer.from(expected, "base64");
  const providedBuf = Buffer.from(signature, "base64");
  if (expectedBuf.length !== providedBuf.length) return false;
  try {
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

export async function createSession(user: SessionUser) {
  const payload = JSON.stringify(user);
  const payloadB64 = Buffer.from(payload, "utf-8").toString("base64");
  const signature = signPayload(payload);
  const cookieValue = `${payloadB64}.${signature}`;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, cookieValue, {
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
    const dotIndex = raw.indexOf(".");
    if (dotIndex < 1 || dotIndex === raw.length - 1) return null;
    const payloadB64 = raw.slice(0, dotIndex);
    const signature = raw.slice(dotIndex + 1);

    const payload = Buffer.from(payloadB64, "base64").toString("utf-8");
    if (!verifySignature(payload, signature)) return null;

    const parsed = JSON.parse(payload) as Partial<SessionUser>;
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
