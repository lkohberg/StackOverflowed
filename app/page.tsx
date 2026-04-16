import Image from "next/image";
import Link from "next/link";

const gridImages = [
  { src: "https://picsum.photos/seed/embedded/600/600", alt: "Embedded systems" },
  { src: "https://picsum.photos/seed/htlcode/600/600", alt: "Coding" },
  { src: "https://picsum.photos/seed/machinery/600/600", alt: "Machinery" },
  { src: "https://picsum.photos/seed/pcbboard/600/600", alt: "Circuit board" },
  { src: "https://picsum.photos/seed/blueprint/600/600", alt: "Technical drawing" },
  { src: "https://picsum.photos/seed/equations/600/600", alt: "Math" },
];

export default function Home() {
  return (
    <div>
      {/* Title + side quote */}
      <div className="mx-auto max-w-5xl px-6 pb-4 pt-8">
        <div className="flex items-start justify-between gap-8">
          <h1 className="rainbow-text text-5xl font-light uppercase leading-tight tracking-[0.18em] sm:text-6xl">
            I Mog<br />Nimma.
          </h1>
          <p className="mt-2 max-w-[220px] text-right text-sm leading-snug text-slate-400">
            <em>„Wenn ma si auskennt, is ma scho z&apos;spät.&rdquo;</em><br />
            <span>—Confucius, wahrscheinlich</span>
          </p>
        </div>
      </div>

      {/* Full-width hero image */}
      <div className="relative mt-2 h-64 w-full overflow-hidden sm:h-80 md:h-96">
        <Image
          src="https://picsum.photos/seed/htlsteyr/1920/600"
          alt="HTL Steyr"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Italic quote */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="max-w-2xl text-2xl italic text-slate-500 sm:text-3xl">
          Da Stack is übergonga.
        </p>
        <a
          href="https://www.instagram.com/htl.steyr/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram
        </a>
      </div>

      {/* Section divider */}
      <div className="mx-auto max-w-5xl px-6 pb-4">
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-slate-200" />
          <span className="rainbow-text text-xs font-medium uppercase tracking-[0.3em]">Nur Stress</span>
          <hr className="flex-1 border-slate-200" />
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-px bg-slate-100">
        {gridImages.map((img) => (
          <div key={img.src} className="relative aspect-square overflow-hidden bg-white">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Bottom closing quote */}
      <div className="mx-auto max-w-5xl px-6 py-14 text-center">
        <p className="text-2xl italic text-slate-400 sm:text-3xl">
          Geh ned in de HTL.
        </p>
        <p className="mt-2 text-sm text-slate-300">— alle, die schon drin san</p>
      </div>

      {/* Quick links */}
      <div className="mx-auto max-w-5xl px-6 pb-12">
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-slate-100" />
          <div className="flex gap-6">
            <Link href="/browser-games" className="text-sm text-slate-400 transition-colors hover:text-slate-700">Browser Games</Link>
            <Link href="/past-tests" className="text-sm text-slate-400 transition-colors hover:text-slate-700">Past Tests</Link>
          </div>
          <hr className="flex-1 border-slate-100" />
        </div>
      </div>
    </div>
  );
}
