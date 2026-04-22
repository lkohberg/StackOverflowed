"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

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
  const formRef = useRef<HTMLFormElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

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
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      await loadMessages();

      if (!isCancelled) {
        timeoutId = setTimeout(poll, 2000);
      }
    };

    void poll();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadMessages]);

  useEffect(() => {
    const behavior = hasAutoScrolledRef.current ? "smooth" : "auto";
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    hasAutoScrolledRef.current = true;
  }, [messages.length]);

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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!submitting) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <header className="border-b border-slate-700 bg-slate-950/80 px-5 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-white"># zentraler-chat</h1>
          <p className="mt-1 text-sm text-slate-300">
            Komplett anonym. Du siehst nur Nachrichten, die ab dem Öffnen dieses Reiters geschrieben wurden.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-900 px-4 py-5 sm:px-6">
          {loading ? <p className="text-slate-300">Nachrichten werden geladen...</p> : null}

          {!loading && messages.length === 0 ? (
            <p className="text-slate-300">Noch keine Nachrichten seit dem Öffnen dieses Reiters.</p>
          ) : (
            <ul className="grid gap-3">
              {messages.map((message) => (
                <li key={message.id} className="rounded-xl bg-slate-800/90 px-4 py-3 text-slate-100">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-cyan-300">Anonym</span>
                    <span className="text-slate-400">{formatTimestamp(message.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-700 bg-slate-950 px-4 py-4 sm:px-6">
          {error ? <p className="mb-3 rounded-md bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              name="message"
              placeholder="Nachricht schreiben..."
              rows={2}
              required
              maxLength={500}
              aria-label="Nachricht eingeben"
              aria-describedby="chat-input-help"
              className="min-h-12 flex-1 resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
            />
            <p id="chat-input-help" className="sr-only">
              Mit Enter wird die Nachricht gesendet. Mit Shift+Enter machst du einen Zeilenumbruch.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sende..." : "Senden"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
