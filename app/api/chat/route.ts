import { NextResponse } from "next/server";
import { createChatMessage, listChatMessages } from "@/lib/chat";

type CreateChatMessageRequest = {
  message?: unknown;
  sender_name?: unknown;
};

const BAD_WORD_PATTERN =
  /\b(?:bitch(?:es)?|fick(?:en|st|t)?|wichs(?:er|ers|t|te)?|hurensohn|hurenso[hc]n|hurensöhne|hure[n]?|n[i1!]g+(?:e[rg]|a|er|ah?|az?|er[sz])?|n[e3]g+(?:e[rg]|a|er|ah?|az?|er[sz])?|porn(?:o|os|hub)?|xvideo[sz]?|xhamster|onlyfan[sz]|camgirl|camboy|dildo[sz]?|vibrator(?:en)?|fetisch|gangbang|creampie|buk+ake|hentai|tentakelporn)\b/gi;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
    const senderName = rawSenderName.slice(0, 30) || "Anonym";

    const createdMessage = await createChatMessage({ message: filteredMessage, sender_name: senderName });
    return NextResponse.json({ message: createdMessage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat failed", error);
    return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 500 });
  }
}
