import { NextResponse } from "next/server";
import { createChatMessage, deleteChatMessage, listChatMessages } from "@/lib/chat";
import { isAdminRequest } from "@/lib/admin-auth";

type CreateChatMessageRequest = {
  message?: unknown;
  sender_name?: unknown;
};

const BAD_WORD_VARIANTS = [
  "bitch(?:es)?",
  "b[i1!]tch(?:e[sz])?",
  "biatch",
  "fick(?:en|st|t)?",
  "f[i1!](?:c|k|q)k(?:en|st|t)?",
  "f\\*ck",
  "fck",
  "fk",
  "wichs(?:er|ers|t|te|en)?",
  "wixx(?:er|ers|t|te|en)?",
  "hurensohn",
  "hurenso[hc]n",
  "hurensöhne",
  "h\\*rensohn",
  "hsohn",
  "hure[n]?",
  "schlampe[n]?",
  "nutte[nr]?",
  "nutt[ea]n?",
  "n(?:i|1|!|e|3)g+(?:e[rg]|a|er|ah?|az?|er[sz]|as?)?",
  "niqqa",
  "nigga",
  "niga",
  "negger",
  "porn(?:o|os|hub)?",
  "pr0n",
  "xvideo[sz]?",
  "xhamster",
  "onlyfan[sz]",
  "ofans?",
  "camgirl",
  "camboy",
  "dildo[sz]?",
  "vibrator(?:en)?",
  "fetisch",
  "gangbang",
  "creampie",
  "buk+ake",
  "hentai",
  "tentakelporn",
  "s[e3]x+y(?:s|ies|ie)?",
  "s[e3]x+i(?:s)?",
  "s3x",
  "seggs",
  "slut(?:s)?",
  "whore(?:s)?",
  "puta",
  "puto",
  "n(?:u|ü|v)+t+[e3]+(?:n|r)?",
  "n[uü]t+t+[e3]+(?:n|r)?",
];

const BAD_WORD_PATTERN = new RegExp(`\\b(?:${BAD_WORD_VARIANTS.join("|")})\\b`, "gi");

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

function maskBadWords(value: string) {
  return value.replace(BAD_WORD_PATTERN, (match) => "*".repeat(match.length));
}

function isValidIsoDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isMessageEntirelyMasked(value: string) {
  return !value.replace(/\*/g, "").trim();
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
    const adminRequest = isAdminRequest(request);

    if (!message) {
      return NextResponse.json({ error: "Nachricht ist erforderlich." }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Nachricht darf maximal 500 Zeichen lang sein." }, { status: 400 });
    }

    const filteredMessage = maskBadWords(message);

    if (isMessageEntirelyMasked(filteredMessage)) {
      return NextResponse.json({ error: "Nachricht enthält keine zulässigen Inhalte." }, { status: 400 });
    }

    const rawSenderName = normalizeText(body.sender_name);
    let senderName = rawSenderName.slice(0, 30) || "Anonym";

    if (adminRequest) {
      senderName = "Admin*";
    } else if (senderName.toLowerCase() === "admin*") {
      return NextResponse.json({ error: "Dieser Name ist reserviert." }, { status: 400 });
    }

    const createdMessage = await createChatMessage({ message: filteredMessage, sender_name: senderName });
    return NextResponse.json({ message: createdMessage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat failed", error);
    return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: unknown };
    const id = parseId(body.id);

    if (!id || id <= 0) {
      return NextResponse.json({ error: "Ungültige Nachrichten-ID." }, { status: 400 });
    }

    const deleted = await deleteChatMessage(id);

    if (!deleted) {
      return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/chat failed", error);
    return NextResponse.json({ error: "Nachricht konnte nicht gelöscht werden." }, { status: 500 });
  }
}
