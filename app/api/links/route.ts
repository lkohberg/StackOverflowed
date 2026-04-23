import { NextResponse } from "next/server";
import { createLink, DuplicateLinkError, listLinks } from "@/lib/links";

type CreateLinkRequest = {
  title?: unknown;
  url?: unknown;
  description?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const links = await listLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error("GET /api/links failed", error);
    return NextResponse.json({ error: "Links konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLinkRequest;

    const title = normalizeText(body.title);
    const url = normalizeText(body.url);
    const description = normalizeText(body.description);

    if (!title || !url) {
      return NextResponse.json({ error: "Titel und URL sind erforderlich." }, { status: 400 });
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json({ error: "Bitte gib eine gültige URL an." }, { status: 400 });
    }

    const link = await createLink({
      title,
      url,
      description: description || null,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateLinkError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("POST /api/links failed", error);
    return NextResponse.json({ error: "Link konnte nicht gespeichert werden." }, { status: 500 });
  }
}
