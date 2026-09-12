import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    await createSession(user);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
