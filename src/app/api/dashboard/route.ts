import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Static service catalog (mirrors the public site)
const SERVICES = [
  "Transport Maritime",
  "Transport Aérien",
  "Transport Routier & Multimodal",
  "Transit & Dédouanement",
  "Entreposage sous Douane",
  "Supply Chain & Logistique",
  "Manutention de Colis Lourd",
  "Freight Forwarding",
];

const COUNTRIES = [
  "Sénégal",
  "Mali",
  "Guinée",
  "Guinée-Bissau",
  "Mauritanie",
  "Gambie",
];

const MONTHS_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }
    const tenantId = session.tenantId;

    // Total messages
    const totalMessages = await db.contactMessage.count({ where: { tenantId } }).catch(() => 0);

    // Messages this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const messagesThisMonth = await db.contactMessage
      .count({ where: { tenantId, createdAt: { gte: startOfMonth } } })
      .catch(() => 0);

    // Last 6 months messages trend
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d;
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await db.contactMessage
        .count({ where: { tenantId, createdAt: { gte: start, lt: end } } })
        .catch(() => 0);
      monthlyTrend.push({ month: `${MONTHS_FR[d.getMonth()]}`, count });
    }

    // Recent messages (latest 6)
    const recentMessages = await db.contactMessage
      .findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
      .catch(() => []);

    // Subject distribution (what topics are most asked about)
    const allMessages = await db.contactMessage.findMany({ where: { tenantId } }).catch(() => []);
    const subjectKeywords = ["devis", "transit", "transport", "douane", "fret", "entrepôt", "autre"];
    const subjectDistribution = subjectKeywords.map((kw) => ({
      keyword: kw,
      count: allMessages.filter((m) =>
        `${m.subject} ${m.message}`.toLowerCase().includes(kw)
      ).length,
    }));

    return NextResponse.json({
      ok: true,
      stats: {
        totalMessages,
        messagesThisMonth,
        servicesCount: SERVICES.length,
        countriesCount: COUNTRIES.length,
        foundedYear: "2019",
        yearsActive: new Date().getFullYear() - 2019,
      },
      services: SERVICES,
      countries: COUNTRIES,
      monthlyTrend,
      recentMessages: recentMessages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
      subjectDistribution,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[dashboard] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Erreur lors de la récupération des données." },
      { status: 500 }
    );
  }
}
