"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import faviconImage from "@/images/favicon.png";

const navItems = [
  { href: "/", label: "Startseite" },
  { href: "/browser-games", label: "Browser-Spiele" },
  { href: "/links", label: "Links" },
  { href: "/past-tests", label: "Alte Tests" },
  { href: "/formulare", label: "Formulare" },
  { href: "/chat", label: "Chat" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ui-border bg-surface">
      <div className="flex w-full flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4 lg:px-12">
        <Link
          href="/"
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
    </header>
  );
}
