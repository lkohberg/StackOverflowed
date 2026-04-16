"use client";

import { FormEvent, useEffect, useState } from "react";

type Game = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};

export default function BrowserGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await fetch("/api/games", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load games.");
        }
        const data = (await response.json()) as { games: Game[] };
        setGames(data.games);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load games.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
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
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { game?: Game; error?: string };

      if (!response.ok || !data.game) {
        throw new Error(data.error ?? "Could not submit game.");
      }

      setGames((current) => [data.game as Game, ...current]);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit game.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Browser Games</h1>
        <p className="mt-2 text-slate-600">Discover and share browser games that are fun between lessons.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Submit a game</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <input
            name="title"
            type="text"
            placeholder="Game title"
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
            placeholder="Optional description"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Add game"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Game directory</h2>

        {loading ? <p className="mt-4 text-slate-600">Loading games...</p> : null}

        {!loading && games.length === 0 ? (
          <p className="mt-4 text-slate-600">No games submitted yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {games.map((game) => (
              <li key={game.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm">
                <a href={game.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-slate-900 hover:underline">
                  {game.title}
                </a>
                {game.description ? <p className="mt-1 text-slate-600">{game.description}</p> : null}
              </li>
            ))}
          </ul>
        )}

        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>
    </div>
    </div>
  );
}
