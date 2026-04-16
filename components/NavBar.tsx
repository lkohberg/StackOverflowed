"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browser-games", label: "Browser Games" },
  { href: "/past-tests", label: "Past Tests" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="flex w-full items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="text-sm font-semibold tracking-widest uppercase text-slate-800 transition-colors hover:text-slate-500">
          StackOverflowed
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors duration-150 ${
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
