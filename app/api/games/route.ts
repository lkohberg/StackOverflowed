import { NextResponse } from "next/server";
import { createGame, DuplicateGameError, listGames } from "@/lib/games";

type CreateGameRequest = {
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
    const games = await listGames();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("GET /api/games failed", error);
    return NextResponse.json({ error: "Failed to load games." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateGameRequest;

    const title = normalizeText(body.title);
    const url = normalizeText(body.url);
    const description = normalizeText(body.description);

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required." }, { status: 400 });
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
    }

    const game = await createGame({
      title,
      url,
      description: description || null,
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateGameError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("POST /api/games failed", error);
    return NextResponse.json({ error: "Failed to save game." }, { status: 500 });
  }
}
