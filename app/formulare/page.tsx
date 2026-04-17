import { readdir } from "node:fs/promises";
import path from "node:path";

const FORMULARE_DIRECTORY = path.join(process.cwd(), "formulare");

type FormularItem = {
  fileName: string;
  title: string;
};

function toTitle(fileName: string) {
  const baseName = fileName.replace(/\.pdf$/i, "");
  const normalized = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fileName;
  }

  return normalized.replace(/\b\w/g, (value) => value.toUpperCase());
}

async function listFormulare(): Promise<FormularItem[]> {
  const entries = await readdir(FORMULARE_DIRECTORY, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => ({
      fileName: entry.name,
      title: toTitle(entry.name),
    }))
    .sort((left, right) => left.title.localeCompare(right.title, "de"));
}

export default async function FormularePage() {
  const formulare = await listFormulare();

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Formulare</h1>
        <p className="mt-4 text-slate-700">Hier findest du alle verfügbaren Formulare mit Vorschau und Download.</p>

        {formulare.length === 0 ? (
          <p className="mt-6 text-slate-600">Aktuell sind keine Formulare verfügbar.</p>
        ) : (
          <ul className="mt-6 grid gap-6">
            {formulare.map((formular) => {
              const previewUrl = `/api/formulare?file=${encodeURIComponent(formular.fileName)}`;
              const downloadUrl = `${previewUrl}&download=1`;

              return (
                <li key={formular.fileName} className="rounded-lg border border-slate-200 p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-slate-900">{formular.title}</h2>
                  <iframe
                    title={`Vorschau ${formular.title}`}
                    src={previewUrl}
                    className="mt-4 h-80 w-full rounded-md border border-slate-200"
                  />
                  <div className="mt-4">
                    <a
                      href={downloadUrl}
                      className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      Download
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
