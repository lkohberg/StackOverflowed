"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/lib/use-admin-auth";

type ChatMessage = {
  id: number;
  message: string;
  sender_name: string;
  created_at: string;
};

const ADMIN_DISPLAY_NAME = "Admin*";
const ALIAS_ADJECTIVES = ["Blauer", "Roter", "Grüner", "Gelber", "Schneller", "Ruhiger", "Cleverer", "Flinker", "Wilder", "Starker"];
const ALIAS_NOUNS = ["Pinguin", "Adler", "Fuchs", "Bär", "Wolf", "Dachs", "Hase", "Otter", "Igel", "Luchs"];

function generateAlias(): string {
  const adj = ALIAS_ADJECTIVES[Math.floor(Math.random() * ALIAS_ADJECTIVES.length)];
  const noun = ALIAS_NOUNS[Math.floor(Math.random() * ALIAS_NOUNS.length)];
  return `${adj}${noun}`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isAuthorityMessage(senderName: string) {
  return senderName.trim().toLowerCase() === ADMIN_DISPLAY_NAME.toLowerCase();
}

export default function ChatPage() {
  const { adminHash, isAdmin } = useAdminAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [alias, setAlias] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  useEffect(() => {
    if (isAdmin) {
      setAlias(ADMIN_DISPLAY_NAME);
      sessionStorage.setItem("chat-alias", ADMIN_DISPLAY_NAME);
      return;
    }

    const stored = sessionStorage.getItem("chat-alias");
    if (stored) {
      setAlias(stored);
      return;
    }
    const name = generateAlias();
    sessionStorage.setItem("chat-alias", name);
    setAlias(name);
  }, [isAdmin]);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/chat", { cache: "no-store" });

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
  }, []);

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
        headers: {
          "Content-Type": "application/json",
          ...(isAdmin && adminHash ? { "x-admin-hash": adminHash } : {}),
        },
        body: JSON.stringify({ message, sender_name: isAdmin ? ADMIN_DISPLAY_NAME : alias }),
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

  const handleDeleteMessage = async (id: number) => {
    if (!isAdmin || !adminHash) {
      return;
    }

    setError(null);
    setDeletingMessageId(id);

    try {
      const response = await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-hash": adminHash,
        },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Nachricht konnte nicht gelöscht werden.");
      }

      await loadMessages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Nachricht konnte nicht gelöscht werden.");
    } finally {
      setDeletingMessageId(null);
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:px-12">
      <section className="mx-auto flex h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-ui-border bg-surface shadow-sm">
        <header className="border-b border-ui-border bg-surface-raised px-5 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-body">
            <span aria-hidden="true"># </span>
            zentraler-chat
          </h1>
          <p className="mt-1 text-sm text-muted">
            Du schreibst als{" "}
            <span className={isAdmin ? "rounded-md bg-amber-100 px-2 py-0.5 font-extrabold tracking-wide text-amber-700" : "font-medium text-accent"}>
              {isAdmin ? ADMIN_DISPLAY_NAME : alias || "…"}
            </span>
            . Nachrichten der letzten 48 Stunden sind für alle sichtbar.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-4 py-5 sm:px-6">
          {loading ? <p className="text-muted">Nachrichten werden geladen...</p> : null}

          {!loading && messages.length === 0 ? (
            <p className="text-muted">Noch keine Nachrichten in den letzten 48 Stunden.</p>
          ) : (
            <ul className="grid gap-3">
              {messages.map((message) => (
                <li key={message.id} className="rounded-xl border border-ui-border bg-surface-raised px-4 py-3">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          isAuthorityMessage(message.sender_name)
                            ? "rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700"
                            : "font-semibold text-accent"
                        }
                      >
                        {message.sender_name}
                      </span>
                      <span className="text-muted">{formatTimestamp(message.created_at)}</span>
                    </div>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handleDeleteMessage(message.id);
                        }}
                        disabled={deletingMessageId === message.id}
                        className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingMessageId === message.id ? "Lösche..." : "Löschen"}
                      </button>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-body">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-ui-border bg-surface-raised px-4 py-4 sm:px-6">
          {error ? <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

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
              className="min-h-12 flex-1 resize-none rounded-xl border border-ui-border bg-surface px-3 py-2 text-body outline-none transition placeholder:text-muted focus:border-accent"
            />
            <p id="chat-input-help" className="sr-only">
              Mit Enter wird die Nachricht gesendet. Mit Shift+Enter machst du einen Zeilenumbruch.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-accent px-4 py-2 font-medium text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sende..." : "Senden"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
