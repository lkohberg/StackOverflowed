"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_UNLOCKED_STORAGE_KEY } from "@/lib/admin-client";
import { useAdminAuth } from "@/lib/use-admin-auth";
import faviconImage from "@/images/favicon.png";

const navItems = [
  { href: "/", label: "Startseite" },
  { href: "/browser-games", label: "Browser-Spiele" },
  { href: "/links", label: "Links" },
  { href: "/past-tests", label: "Alte Tests" },
  { href: "/formulare", label: "Formulare" },
  { href: "/chat", label: "Chat" },
];

const LOGO_TAP_TARGET = 5;
const CHAT_TAP_TARGET = 1;

async function hashPassword(value: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function NavBar() {
  const pathname = usePathname();
  const { isAdmin, setAdminHash } = useAdminAuth();
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [, setChatTapCount] = useState(0);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    const unlocked = sessionStorage.getItem(ADMIN_UNLOCKED_STORAGE_KEY) === "true";
    setAdminUnlocked(unlocked);
  }, []);

  const handleLogoTap = () => {
    if (adminUnlocked) {
      return;
    }

    setLogoTapCount((current) => {
      const next = Math.min(current + 1, LOGO_TAP_TARGET);
      if (next === LOGO_TAP_TARGET) {
        setChatTapCount(0);
      }
      return next;
    });
  };

  const handleNavTap = (href: string) => {
    if (adminUnlocked || logoTapCount < LOGO_TAP_TARGET) {
      return;
    }

    if (href !== "/chat") {
      setChatTapCount(0);
      return;
    }

    setChatTapCount((current) => {
      const next = current + 1;

      if (next >= CHAT_TAP_TARGET) {
        setAdminUnlocked(true);
        sessionStorage.setItem(ADMIN_UNLOCKED_STORAGE_KEY, "true");
      }

      return next;
    });
  };

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminError(null);
    const rawPassword = password.trim();

    if (!rawPassword) {
      setAdminError("Bitte Admin-Passwort eingeben.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const passwordHash = await hashPassword(rawPassword);
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordHash }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Admin-Anmeldung fehlgeschlagen.");
      }

      setAdminHash(passwordHash);
      setPassword("");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Admin-Anmeldung fehlgeschlagen.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="border-b border-ui-border bg-surface">
      <div className="flex w-full flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4 lg:px-12">
        <Link
          href="/"
          onClick={handleLogoTap}
          className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-body transition-colors hover:text-muted sm:text-sm"
        >
          <Image src={faviconImage} alt="StackOverflowed Logo" width={16} height={16} priority />
          <span>StackOverflowed</span>
        </Link>
        <nav className="flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavTap(item.href)}
                className={`rounded px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 sm:px-3 sm:py-2 sm:text-sm ${
                  isActive
                    ? "text-accent"
                    : "text-muted hover:text-body"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {adminUnlocked ? (
        <div className="w-full border-t border-ui-border px-4 py-3 sm:px-8 lg:px-12">
          <form onSubmit={handleAdminLogin} className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isAdmin ? "Admin aktiv" : "Admin Passwort"}
              disabled={isAdmin || isLoggingIn}
              className="min-w-52 rounded-md border border-ui-border bg-surface-raised px-3 py-2 text-sm text-body outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
            />
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setAdminHash("");
                  setPassword("");
                }}
                className="rounded-md border border-ui-border px-3 py-2 text-sm font-medium text-body transition hover:bg-surface-raised"
              >
                Admin abmelden
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoggingIn}
                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? "Prüfe..." : "Admin anmelden"}
              </button>
            )}
            {adminError ? <p className="text-xs text-red-600">{adminError}</p> : null}
          </form>
        </div>
      ) : null}
    </header>
  );
}
