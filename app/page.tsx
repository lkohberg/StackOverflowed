import Image from "next/image";
import Link from "next/link";
import htlHeroImage from "@/images/htl-panorama-16-4.jpg";
import alexandreDebieveImage from "@/images/alexandre-debieve-fo7jilwjotu-unsplash.webp";
import arduinoImage from "@/images/arduino-4916880_960_720.jpg";
import boardImage from "@/images/board-4855963_960_720.jpg";
import sourceImage from "@/images/source-4280758_960_720.jpg";
import technicalDrawingImage from "@/images/technical-drawing-3324368_960_720.jpg";
import workshopImage from "@/images/workshop-3758513_960_720.jpg";

const gridImages = [
  { id: "alexandre-debieve", src: alexandreDebieveImage, alt: "Person programmiert auf einem Laptop in einem dunklen Arbeitsbereich" },
  { id: "arduino", src: arduinoImage, alt: "Nahaufnahme eines Arduino-Boards mit farbigen Kabeln" },
  { id: "board", src: boardImage, alt: "Leiterplatte und elektronische Bauteile auf einer Werkbank" },
  { id: "source", src: sourceImage, alt: "Quellcode auf einem Monitor mit blauer Oberfläche" },
  { id: "technical-drawing", src: technicalDrawingImage, alt: "Technische Zeichenwerkzeuge auf Blaupausenpapier" },
  { id: "workshop", src: workshopImage, alt: "Technische Werkstatt mit Maschinen und Industrieausrüstung" },
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
            <em>„Du kennst di aus? Na duast&apos;ned.&rdquo;</em><br />
            <span>—Confucius, wahrscheinlich</span>
          </p>
        </div>
      </div>

      {/* Full-width hero image */}
      <div className="relative h-48 w-full sm:h-72 md:h-[30rem]">
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
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-2 bg-white px-4 sm:grid-cols-3 sm:px-8 lg:grid-cols-3 lg:px-12">
        {gridImages.map((img) => (
          <div
            key={img.id}
            className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      <div className="w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <p className="text-2xl font-extrabold italic leading-tight text-slate-700 sm:text-4xl md:text-5xl">
          Geh ned in die HTL
        </p>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">— alle, die schon dort sind!</p>
      </div>

      <footer className="mt-10 w-full bg-black px-4 py-10 text-zinc-100 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Warum eigentlich des ois?</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-200 sm:text-base">
              <li>{`"Heit lern i fix ... oba erst nochm ersten Bier."`}</li>
              <li>{`"Schwänzen? Bledsinn des is Zeitausgleich"`}</li>
              <li>{`"Wenn's in da Werkstatt raucht, is ned immer da Lötkolben schuld."`}</li>
              <li>{`"Des is ka bug, des is a feature."`}</li>
            </ul>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <hr className="hidden flex-1 border-zinc-700 sm:block" />
            <div className="flex gap-5">
              <Link href="/browser-games" className="text-sm text-zinc-300 transition-colors hover:text-white">Browser-Spiele</Link>
              <Link href="/links" className="text-sm text-zinc-300 transition-colors hover:text-white">Links</Link>
              <Link href="/past-tests" className="text-sm text-zinc-300 transition-colors hover:text-white">Alte Tests</Link>
              <Link href="/formulare" className="text-sm text-zinc-300 transition-colors hover:text-white">Formulare</Link>
              <Link href="/chat" className="text-sm text-zinc-300 transition-colors hover:text-white">Chat</Link>
            </div>
            <hr className="hidden flex-1 border-zinc-700 sm:block" />
          </div>

          <p className="text-xs text-zinc-500">{`StackOverflowed · "Passt scho" is ka QA-Prozess.`}</p>
        </div>
      </footer>
    </div>
  );
}
