import { NextResponse } from "next/server";
import { createPastTest, deletePastTest, getPastTestFile, listPastTests } from "@/lib/past-tests";
import {
  isValidDepartment,
  isValidSchoolLevel,
  isValidSubjectForSchoolLevel,
  isValidTeacherForSchoolLevelSubject,
  isValidTestNumber,
  toClassNameFromSchoolLevelDepartment,
} from "@/lib/past-tests-catalog";
import { isAdminRequest } from "@/lib/admin-auth";

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

  const schoolLevel = (searchParams.get("schoolLevel") ?? "").trim();
  const department = (searchParams.get("department") ?? "").trim();
  const subject = (searchParams.get("subject") ?? "").trim();
  const teacher = (searchParams.get("teacher") ?? "").trim();
  const testNumberValue = (searchParams.get("testNumber") ?? "").trim();

  const testNumber = testNumberValue ? parseInteger(testNumberValue) : null;

  if (schoolLevel && !isValidSchoolLevel(schoolLevel)) {
    return NextResponse.json({ error: "Ungültige Schulstufe." }, { status: 400 });
  }

  if (department && !isValidDepartment(department)) {
    return NextResponse.json({ error: "Ungültige Abteilung." }, { status: 400 });
  }

  if (subject && !schoolLevel) {
    return NextResponse.json(
      { error: "Bitte zuerst eine Schulstufe auswählen, bevor Sie nach Fach filtern." },
      { status: 400 },
    );
  }

  if (subject && !isValidSubjectForSchoolLevel(schoolLevel, subject)) {
    return NextResponse.json({ error: "Ungültiges Fach für die gewählte Schulstufe." }, { status: 400 });
  }

  if (
    teacher &&
    (!schoolLevel || !subject || !isValidTeacherForSchoolLevelSubject(schoolLevel, subject, teacher))
  ) {
    return NextResponse.json({ error: "Ungültiger Lehrer für das gewählte Fach." }, { status: 400 });
  }

  if (testNumberValue && (!testNumber || !isValidTestNumber(testNumber))) {
    return NextResponse.json({ error: "Ungültige Testnummer." }, { status: 400 });
  }

  try {
    const tests = await listPastTests({
      department: department || undefined,
      schoolLevel: schoolLevel || undefined,
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

    const schoolLevel = normalizeText(formData.get("schoolLevel"));
    const department = normalizeText(formData.get("department"));
    const subject = normalizeText(formData.get("subject"));
    const teacher = normalizeText(formData.get("teacher"));
    const testNumberValue = normalizeText(formData.get("testNumber"));
    const uploadYearValue = normalizeText(formData.get("uploadYear"));
    const topicSummary = normalizeText(formData.get("topicSummary"));
    const fileEntry = formData.get("file");

    const testNumber = parseInteger(testNumberValue);
    const uploadYear = parseInteger(uploadYearValue);
    const currentYear = new Date().getFullYear();

    if (!isValidSchoolLevel(schoolLevel)) {
      return NextResponse.json({ error: "Bitte eine gültige Schulstufe auswählen." }, { status: 400 });
    }

    if (!isValidDepartment(department)) {
      return NextResponse.json({ error: "Bitte eine gültige Abteilung auswählen." }, { status: 400 });
    }

    if (!isValidSubjectForSchoolLevel(schoolLevel, subject)) {
      return NextResponse.json({ error: "Bitte ein gültiges Fach auswählen." }, { status: 400 });
    }

    if (!isValidTeacherForSchoolLevelSubject(schoolLevel, subject, teacher)) {
      return NextResponse.json({ error: "Bitte einen gültigen Lehrer auswählen." }, { status: 400 });
    }

    if (!testNumber || !isValidTestNumber(testNumber)) {
      return NextResponse.json({ error: "Bitte Testnummer 1 bis 4 auswählen." }, { status: 400 });
    }

    if (!uploadYear || uploadYear < 2000 || uploadYear > currentYear + 1) {
      return NextResponse.json({ error: "Bitte ein gültiges Upload-Jahr angeben." }, { status: 400 });
    }

    if (!topicSummary) {
      return NextResponse.json(
        { error: "Bitte eine kurze stichwortartige Beschreibung des Stoffs angeben." },
        { status: 400 },
      );
    }

    if (!(fileEntry instanceof File) || fileEntry.size <= 0) {
      return NextResponse.json({ error: "Bitte eine ZIP-Datei auswählen." }, { status: 400 });
    }

    if (!isZipFile(fileEntry)) {
      return NextResponse.json({ error: "Nur ZIP-Dateien sind erlaubt." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());

    const savedTest = await createPastTest({
      schoolLevel,
      department,
      className: toClassNameFromSchoolLevelDepartment(schoolLevel, department),
      subject,
      teacher,
      testNumber,
      uploadYear,
      topicSummary,
      fileName: fileEntry.name,
      fileData: fileBuffer,
    });

    return NextResponse.json({ test: savedTest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/past-tests failed", error);
    return NextResponse.json({ error: "Test konnte nicht hochgeladen werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: unknown };
    const id = parseInteger(typeof body.id === "string" || typeof body.id === "number" ? String(body.id) : "");

    if (!id || id <= 0) {
      return NextResponse.json({ error: "Ungültige Test-ID." }, { status: 400 });
    }

    const deleted = await deletePastTest(id);

    if (!deleted) {
      return NextResponse.json({ error: "Test nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/past-tests failed", error);
    return NextResponse.json({ error: "Test konnte nicht gelöscht werden." }, { status: 500 });
  }
}
