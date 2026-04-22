import { NextResponse } from "next/server";
import { createChatMessage, listChatMessages } from "@/lib/chat";

type CreateChatMessageRequest = {
  message?: unknown;
};

const BAD_WORD_PATTERNS = [
  /\barschloch\b/gi,
  /\bhurensohn\b/gi,
  /\bwichser\b/gi,
  /\bschei(?:ß|ss)e?\b/gi,
  /\bfuck\b/gi,
  /\bshit\b/gi,
  /\bbitch\b/gi,
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function maskBadWords(value: string) {
  return BAD_WORD_PATTERNS.reduce((text, pattern) => text.replace(pattern, (match) => "*".repeat(match.length)), value);
}

function isValidIsoDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = normalizeText(searchParams.get("since"));

    if (since && !isValidIsoDate(since)) {
      return NextResponse.json({ error: "Ungültiger Zeitstempel." }, { status: 400 });
    }

    const messages = await listChatMessages({ since: since || undefined });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/chat failed", error);
    return NextResponse.json({ error: "Chat-Nachrichten konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateChatMessageRequest;
    const message = normalizeText(body.message);

    if (!message) {
      return NextResponse.json({ error: "Nachricht ist erforderlich." }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Nachricht darf maximal 500 Zeichen lang sein." }, { status: 400 });
    }

    const filteredMessage = maskBadWords(message);

    if (!filteredMessage.replace(/\*/g, "").trim()) {
      return NextResponse.json({ error: "Nachricht enthält keine zulässigen Inhalte." }, { status: 400 });
    }

    const createdMessage = await createChatMessage({ message: filteredMessage });
    return NextResponse.json({ message: createdMessage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat failed", error);
    return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 500 });
  }
}
