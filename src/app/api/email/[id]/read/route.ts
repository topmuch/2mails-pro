import { NextRequest, NextResponse } from "next/server";
import { markEmailRead } from "@/lib/imap";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const uid = Number(id);
    if (!uid) {
      return NextResponse.json({ ok: false, error: "UID invalide" }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "INBOX";
    await markEmailRead(uid, folder, session.tenantId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[email/[id]/read]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
