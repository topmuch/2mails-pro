import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json({ ok: false, error: "Trop de tentatives." }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const newPassword = typeof body.password === "string" ? body.password : "";

    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "Email et mot de passe (min 6 caractères) requis." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } }).catch(() => null);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Utilisateur introuvable." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true, message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur." }, { status: 500 });
  }
}
