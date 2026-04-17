import { NextResponse } from "next/server";
import { createPastTest, getPastTestFile, listPastTests } from "@/lib/past-tests";
import {
  isValidClassName,
  isValidSubjectForClass,
  isValidTeacherForClassSubject,
  isValidTestNumber,
} from "@/lib/past-tests-catalog";

const ALLOWED_ZIP_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "multipart/x-zip",
]);

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function isZipFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".zip")) {
    return false;
  }

  if (!file.type) {
    return true;
  }

  return ALLOWED_ZIP_TYPES.has(file.type.toLowerCase());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const downloadIdValue = searchParams.get("downloadId");

  if (downloadIdValue) {
    const downloadId = parseInteger(downloadIdValue);

    if (!downloadId || downloadId <= 0) {
      return NextResponse.json({ error: "Ungültige Download-ID." }, { status: 400 });
    }

    try {
      const testFile = await getPastTestFile(downloadId);

      if (!testFile) {
        return NextResponse.json({ error: "Test nicht gefunden." }, { status: 404 });
      }

      const encodedFileName = encodeURIComponent(testFile.file_name);

      return new NextResponse(new Uint8Array(testFile.file_data), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
          "Cache-Control": "private, no-store",
        },
      });
    } catch (error) {
      console.error("GET /api/past-tests (download) failed", error);
      return NextResponse.json({ error: "Download fehlgeschlagen." }, { status: 500 });
    }
  }

  const className = (searchParams.get("className") ?? "").trim();
  const subject = (searchParams.get("subject") ?? "").trim();
  const teacher = (searchParams.get("teacher") ?? "").trim();
  const testNumberValue = (searchParams.get("testNumber") ?? "").trim();

  const testNumber = testNumberValue ? parseInteger(testNumberValue) : null;

  if (className && !isValidClassName(className)) {
    return NextResponse.json({ error: "Ungültige Klasse." }, { status: 400 });
  }

  if (subject && (!className || !isValidSubjectForClass(className, subject))) {
    return NextResponse.json({ error: "Ungültiges Fach für die gewählte Klasse." }, { status: 400 });
  }

  if (teacher && (!className || !subject || !isValidTeacherForClassSubject(className, subject, teacher))) {
    return NextResponse.json({ error: "Ungültiger Lehrer für das gewählte Fach." }, { status: 400 });
  }

  if (testNumberValue && (!testNumber || !isValidTestNumber(testNumber))) {
    return NextResponse.json({ error: "Ungültige Testnummer." }, { status: 400 });
  }

  try {
    const tests = await listPastTests({
      className: className || undefined,
      subject: subject || undefined,
      teacher: teacher || undefined,
      testNumber: testNumber ?? undefined,
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("GET /api/past-tests failed", error);
    return NextResponse.json({ error: "Alte Tests konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const className = normalizeText(formData.get("className"));
    const subject = normalizeText(formData.get("subject"));
    const teacher = normalizeText(formData.get("teacher"));
    const testNumberValue = normalizeText(formData.get("testNumber"));
    const uploadYearValue = normalizeText(formData.get("uploadYear"));
    const fileEntry = formData.get("file");

    const testNumber = parseInteger(testNumberValue);
    const uploadYear = parseInteger(uploadYearValue);
    const currentYear = new Date().getFullYear();

    if (!isValidClassName(className)) {
      return NextResponse.json({ error: "Bitte eine gültige Klasse auswählen." }, { status: 400 });
    }

    if (!isValidSubjectForClass(className, subject)) {
      return NextResponse.json({ error: "Bitte ein gültiges Fach auswählen." }, { status: 400 });
    }

    if (!isValidTeacherForClassSubject(className, subject, teacher)) {
      return NextResponse.json({ error: "Bitte einen gültigen Lehrer auswählen." }, { status: 400 });
    }

    if (!testNumber || !isValidTestNumber(testNumber)) {
      return NextResponse.json({ error: "Bitte Testnummer 1 bis 4 auswählen." }, { status: 400 });
    }

    if (!uploadYear || uploadYear < 2000 || uploadYear > currentYear + 1) {
      return NextResponse.json({ error: "Bitte ein gültiges Upload-Jahr angeben." }, { status: 400 });
    }

    if (!(fileEntry instanceof File) || fileEntry.size <= 0) {
      return NextResponse.json({ error: "Bitte eine ZIP-Datei auswählen." }, { status: 400 });
    }

    if (!isZipFile(fileEntry)) {
      return NextResponse.json({ error: "Nur ZIP-Dateien sind erlaubt." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());

    const savedTest = await createPastTest({
      className,
      subject,
      teacher,
      testNumber,
      uploadYear,
      fileName: fileEntry.name,
      fileData: fileBuffer,
    });

    return NextResponse.json({ test: savedTest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/past-tests failed", error);
    return NextResponse.json({ error: "Test konnte nicht hochgeladen werden." }, { status: 500 });
  }
}
