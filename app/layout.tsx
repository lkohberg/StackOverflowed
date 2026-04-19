import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "StackOverflowed",
  description: "Ein Hub für IT-Schülerinnen und IT-Schüler der HTL Steyr",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full bg-white text-slate-900">
        <NavBar />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
