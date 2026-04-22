"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type ChatMessage = {
  id: number;
  message: string;
  created_at: string;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [openedAt] = useState(() => new Date().toISOString());

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat?since=${encodeURIComponent(openedAt)}`, { cache: "no-store" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Chat-Nachrichten konnten nicht geladen werden.");
      }

      const payload = (await response.json()) as { messages: ChatMessage[] };
      setMessages(payload.messages);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Chat-Nachrichten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [openedAt]);

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: number | undefined;

    const poll = async () => {
      await loadMessages();

      if (!isCancelled) {
        timeoutId = window.setTimeout(poll, 1000);
      }
    };

    void poll();

    return () => {
      isCancelled = true;
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [loadMessages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const message = text.trim();

    if (!message) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Nachricht konnte nicht gesendet werden.");
      }

      setText("");
      await loadMessages();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nachricht konnte nicht gesendet werden.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Zentraler Chat</h1>
          <p className="mt-2 text-slate-600">
            Komplett anonym. Du siehst nur Nachrichten, die ab dem Öffnen dieses Reiters geschrieben wurden.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Live-Chat</h2>
          <p className="mt-1 text-sm text-slate-500">Aktualisiert automatisch jede Sekunde.</p>

          {loading ? <p className="mt-4 text-slate-600">Nachrichten werden geladen...</p> : null}

          {!loading && messages.length === 0 ? (
            <p className="mt-4 text-slate-600">Noch keine Nachrichten seit dem Öffnen dieses Reiters.</p>
          ) : (
            <ul className="mt-4 grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <li key={message.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="break-words text-slate-900">{message.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTimestamp(message.created_at)}</p>
                </li>
              ))}
            </ul>
          )}

          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Nachricht senden</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              name="message"
              placeholder="Deine anonyme Nachricht..."
              rows={3}
              required
              maxLength={500}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-fit rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Wird gesendet..." : "Anonym senden"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
