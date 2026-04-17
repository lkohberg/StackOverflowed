import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const FORMULARE_DIRECTORY = path.join(process.cwd(), "formulare");

/**
 * Validates a file name from request input to allow only PDF files in the top-level formulare directory.
 */
function getValidatedFileName(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || path.basename(trimmed) !== trimmed) {
    return null;
  }

  if (!trimmed.toLowerCase().endsWith(".pdf")) {
    return null;
  }

  return trimmed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = getValidatedFileName(searchParams.get("file"));

  if (!fileName) {
    return NextResponse.json({ error: "Ungültiger Dateiname." }, { status: 400 });
  }

  const filePath = path.resolve(FORMULARE_DIRECTORY, fileName);
  if (!filePath.startsWith(`${FORMULARE_DIRECTORY}${path.sep}`)) {
    return NextResponse.json({ error: "Ungültiger Dateiname." }, { status: 400 });
  }

  try {
    const fileData = await readFile(filePath);
    const dispositionType = searchParams.get("download") === "1" ? "attachment" : "inline";
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(fileData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Formular nicht gefunden." }, { status: 404 });
  }
}
