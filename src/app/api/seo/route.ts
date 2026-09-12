import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const DEFAULT_SEO = {
  siteTitle: "2mails.pro | CRM SaaS — Gestion clients, équipe & messagerie",
  metaDescription:
    "2mails.pro — CRM SaaS pour gérer vos clients, votre équipe, vos statistiques, votre messagerie et vos paramètres depuis un tableau de bord unifié.",
  keywords:
    "2mails.pro, CRM SaaS, gestion clients, gestion équipe, messagerie intégrée, tableau de bord CRM, CRM Dakar Sénégal, logiciel CRM, platform CRM",
  ogTitle: "2mails.pro | CRM SaaS — Tableau de bord unifié",
  ogDescription:
    "Gérez vos clients, votre équipe, votre messagerie et vos statistiques depuis un tableau de bord unifié. CRM SaaS moderne et intuitif.",
  googleAnalyticsId: "",
  twitterHandle: "",
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const settings = await db.seoSettings
      .findUnique({ where: { tenantId: session.tenantId } })
      .catch(() => null);

    if (!settings) {
      // Auto-create default per-tenant settings
      const created = await db.seoSettings
        .create({ data: { tenantId: session.tenantId, ...DEFAULT_SEO } })
        .catch(() => null);
      if (created) {
        return NextResponse.json({ ok: true, data: { ...DEFAULT_SEO, id: created.id, tenantId: created.tenantId, createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() } });
      }
      return NextResponse.json({ ok: true, data: { tenantId: session.tenantId, ...DEFAULT_SEO, updatedAt: new Date().toISOString() } });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: settings.id,
        tenantId: settings.tenantId,
        siteTitle: settings.siteTitle,
        metaDescription: settings.metaDescription,
        keywords: settings.keywords,
        ogTitle: settings.ogTitle,
        ogDescription: settings.ogDescription,
        googleAnalyticsId: settings.googleAnalyticsId,
        twitterHandle: settings.twitterHandle,
        updatedAt: settings.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[seo GET]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const siteTitle = typeof body.siteTitle === "string" ? body.siteTitle.trim() : "";
    const metaDescription =
      typeof body.metaDescription === "string" ? body.metaDescription.trim() : "";

    if (!siteTitle || !metaDescription) {
      return NextResponse.json(
        { ok: false, error: "Le titre et la méta-description sont requis." },
        { status: 400 }
      );
    }

    const data = {
      siteTitle,
      metaDescription,
      keywords: typeof body.keywords === "string" ? body.keywords.trim() : "",
      ogTitle: body.ogTitle?.trim() || null,
      ogDescription: body.ogDescription?.trim() || null,
      googleAnalyticsId: body.googleAnalyticsId?.trim() || null,
      twitterHandle: body.twitterHandle?.trim() || null,
    };

    const updated = await db.seoSettings.upsert({
      where: { tenantId: session.tenantId },
      create: { tenantId: session.tenantId, ...data },
      update: data,
    });

    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    console.error("[seo PUT]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
