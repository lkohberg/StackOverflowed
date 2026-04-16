import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "StackOverflowed",
  description: "A student hub for IT students at HTL Steyr",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-slate-900">
        <NavBar />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
