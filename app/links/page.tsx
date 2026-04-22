"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/use-admin-auth";

type LinkEntry = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};

export default function LinksPage() {
  const { adminHash, isAdmin } = useAdminAuth();
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const response = await fetch("/api/links", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Links konnten nicht geladen werden.");
        }
        const data = (await response.json()) as { links: LinkEntry[] };
        setLinks(data.links);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Links konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      url: String(formData.get("url") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { link?: LinkEntry; error?: string };

      if (!response.ok || !data.link) {
        throw new Error(data.error ?? "Link konnte nicht eingereicht werden.");
      }

      setLinks((current) => [data.link as LinkEntry, ...current]);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Link konnte nicht eingereicht werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin || !adminHash) {
      return;
    }

    setError(null);
    setDeletingId(id);

    try {
      const response = await fetch("/api/links", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-hash": adminHash,
        },
        body: JSON.stringify({ id }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Link konnte nicht gelöscht werden.");
      }

      setLinks((current) => current.filter((link) => link.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Link konnte nicht gelöscht werden.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Links</h1>
        <p className="mt-2 text-slate-600">Entdecke und teile hilfreiche Links für Schule und Freizeit.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Linkverzeichnis</h2>

        {loading ? <p className="mt-4 text-slate-600">Links werden geladen...</p> : null}

        {!loading && links.length === 0 ? (
          <p className="mt-4 text-slate-600">Noch keine Links eingereicht.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {links.map((link) => (
              <li key={link.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-slate-900 hover:underline">
                    {link.title}
                  </a>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(link.id);
                      }}
                      disabled={deletingId === link.id}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === link.id ? "Lösche..." : "Löschen"}
                    </button>
                  ) : null}
                </div>
                {link.description ? <p className="mt-1 text-slate-600">{link.description}</p> : null}
              </li>
            ))}
          </ul>
        )}

        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Link einreichen</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <input
            name="title"
            type="text"
            placeholder="Linktitel"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
          />
          <input
            name="url"
            type="url"
            placeholder="https://example.com"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
          />
          <textarea
            name="description"
            placeholder="Optionale Beschreibung"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Wird eingereicht..." : "Link hinzufügen"}
          </button>
        </form>
      </section>

    </div>
    </div>
  );
}
