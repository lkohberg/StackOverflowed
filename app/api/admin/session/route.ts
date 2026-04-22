import { NextResponse } from "next/server";
import { isAuthorizedAdminHash } from "@/lib/admin-auth";

type AdminSessionRequest = {
  passwordHash?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminSessionRequest;

    if (!isAuthorizedAdminHash(body.passwordHash)) {
      return NextResponse.json({ error: "Ungültiges Admin-Passwort." }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/admin/session failed", error);
    return NextResponse.json({ error: "Admin-Anmeldung fehlgeschlagen." }, { status: 500 });
  }
}
