import { NextRequest, NextResponse } from "next/server";
import { fetchEmailDetail, markEmailRead, deleteEmail } from "@/lib/imap";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
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
    const detail = await fetchEmailDetail(uid, folder, session.tenantId);
    return NextResponse.json({ ok: true, email: detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[email/[id] GET]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
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
    await deleteEmail(uid, folder, session.tenantId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[email/[id] DELETE]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
