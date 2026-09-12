/**
 * Standalone seed script for production deployment.
 * Creates a default tenant + admin user from env vars and seeds the
 * per-tenant settings (Email / SEO / Maintenance).
 * Safe to run multiple times (idempotent).
 *
 * Usage: bun scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function ensureTenantSettings(tenantId: string, tenantName: string) {
  const existingEmail = await db.emailSettings.findUnique({ where: { tenantId } }).catch(() => null);
  if (!existingEmail) {
    await db.emailSettings.create({
      data: { tenantId, fromName: tenantName },
    });
    console.log("[seed] Default EmailSettings created.");
  } else {
    console.log("[seed] EmailSettings already exist.");
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
    console.log("[seed] Default SeoSettings created.");
  } else {
    console.log("[seed] SeoSettings already exist.");
  }

  const existingMaintenance = await db.maintenanceSettings
    .findUnique({ where: { tenantId } })
    .catch(() => null);
  if (!existingMaintenance) {
    await db.maintenanceSettings.create({
      data: { tenantId },
    });
    console.log("[seed] Default MaintenanceSettings created.");
  } else {
    console.log("[seed] MaintenanceSettings already exist.");
  }
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@2mails.pro").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "twomails2025";
  const name = process.env.ADMIN_NAME || "Admin 2mails.pro";
  const tenantName = process.env.TENANT_NAME || "2mails.pro Demo";

  // 1. Ensure default tenant exists
  const existingByName = await db.tenant
    .findFirst({ where: { name: tenantName } })
    .catch(() => null);
  let tenant = existingByName;
  if (!tenant) {
    tenant = await db.tenant.create({
      data: { name: tenantName, plan: "free", status: "active", maxUsers: 2 },
    });
    console.log(`[seed] Default tenant created: ${tenant.name} (${tenant.id})`);
  } else {
    console.log(`[seed] Default tenant already exists: ${tenant.name} (${tenant.id})`);
  }

  // 2. Ensure admin user exists, linked to that tenant
  const existing = await db.user.findUnique({ where: { email } }).catch(() => null);
  if (existing) {
    console.log(`[seed] Admin user already exists: ${email}`);
    // Make sure they are linked to the default tenant
    if (existing.tenantId !== tenant.id) {
      await db.user.update({
        where: { id: existing.id },
        data: { tenantId: tenant.id, role: "admin" },
      });
      console.log(`[seed] Linked existing admin user to tenant "${tenant.name}".`);
    }
  } else {
    const passwordHash = await hashPassword(password);
    await db.user.create({
      data: { email, name, passwordHash, role: "admin", tenantId: tenant.id },
    });
    console.log(`[seed] Admin user created: ${email} (tenant: ${tenant.name})`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`[seed] WARNING: using default password. Set ADMIN_PASSWORD env var in production.`);
    }
  }

  // 3. Seed default per-tenant settings
  await ensureTenantSettings(tenant.id, tenant.name);

  await db.$disconnect();
  console.log("[seed] Done.");
}

main().catch((e) => {
  console.error("[seed] Error:", e);
  process.exit(1);
});
