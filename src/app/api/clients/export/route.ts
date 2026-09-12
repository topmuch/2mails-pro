import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.tenantId) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const clients = await db.client.findMany({ where: { tenantId: session.tenantId }, orderBy: { createdAt: "desc" } }).catch(() => []);
  // CSV generation
  const headers = ["Nom", "Société", "Email", "Téléphone", "Pays", "Service", "Statut", "Notes", "Créé le"];
  const rows = clients.map((c) => [
    escapeCsv(c.name),
    escapeCsv(c.company || ""),
    escapeCsv(c.email),
    escapeCsv(c.phone || ""),
    escapeCsv(c.country || ""),
    escapeCsv(c.service || ""),
    escapeCsv(c.status),
    escapeCsv(c.notes || ""),
    c.createdAt.toISOString().split("T")[0],
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=\"clients-2mails.csv\"" },
  });
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
