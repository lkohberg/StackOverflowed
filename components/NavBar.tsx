"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Startseite" },
  { href: "/browser-games", label: "Browser-Spiele" },
  { href: "/past-tests", label: "Alte Schularbeiten" },
  { href: "/formulare", label: "Formulare" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="flex w-full flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4 lg:px-12">
        <Link href="/" className="text-xs font-semibold tracking-widest uppercase text-slate-800 transition-colors hover:text-slate-500 sm:text-sm">
          StackOverflowed
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
                    ? "text-amber-600"
                    : "text-slate-500 hover:text-slate-900"
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
