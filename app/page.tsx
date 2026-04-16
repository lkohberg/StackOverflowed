import Image from "next/image";
import Link from "next/link";
import htlHeroImage from "@/images/htl-panorama-16-4.jpg";

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
      <div className="w-full px-4 pb-4 pt-8 sm:px-8 sm:pb-6 sm:pt-10 lg:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="rainbow-text text-3xl font-light uppercase leading-tight tracking-[0.12em] sm:text-5xl md:text-6xl">
            I Mog<br />Nimma.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base lg:pt-2">
            <em>„Wenn ma si auskennt, is ma scho z&apos;spät.&rdquo;</em><br />
            <span>—Confucius, wahrscheinlich</span>
          </p>
        </div>
      </div>

      {/* Full-width hero image */}
      <div className="relative mt-1 h-44 w-full overflow-hidden sm:mt-2 sm:h-72 md:h-96">
        <Image
          src={htlHeroImage}
          alt="HTL Steyr"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Italic quote */}
      <div className="w-full px-4 py-7 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-lg italic leading-relaxed text-slate-600 sm:text-2xl md:text-3xl">
          Da Stack is übergonga.
        </p>
        <a
          href="https://www.instagram.com/htl.steyr/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline sm:mt-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram
        </a>
      </div>

      {/* Section divider */}
      <div className="hidden w-full px-6 pb-5 sm:block sm:px-8 lg:px-12">
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-slate-200" />
          <span className="rainbow-text text-xs font-medium uppercase tracking-[0.3em]">Nur Stress</span>
          <hr className="flex-1 border-slate-200" />
        </div>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-1 gap-2 bg-white px-4 sm:grid-cols-3 sm:px-8 lg:grid-cols-4 lg:px-12">
        {gridImages.map((img, index) => (
          <div
            key={img.src}
            className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-white ${index > 3 ? "hidden sm:block" : ""}`}
          >
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
      <div className="w-full px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
        <p className="text-xl italic text-slate-400 sm:text-3xl">
          Geh ned in de HTL.
        </p>
        <p className="mt-2 text-sm text-slate-300">— alle, die schon drin san</p>
      </div>

      {/* Quick links */}
      <div className="w-full px-4 pb-10 sm:px-8 sm:pb-12 lg:px-12">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <hr className="hidden flex-1 border-slate-100 sm:block" />
          <div className="flex gap-5">
            <Link href="/browser-games" className="text-sm text-slate-400 transition-colors hover:text-slate-700">Browser Games</Link>
            <Link href="/past-tests" className="text-sm text-slate-400 transition-colors hover:text-slate-700">Past Tests</Link>
          </div>
          <hr className="hidden flex-1 border-slate-100 sm:block" />
        </div>
      </div>
    </div>
  );
}
