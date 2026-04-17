"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AHITN_CLASS_OPTIONS,
  SCHOOL_LEVEL_OPTIONS,
  TEST_NUMBER_OPTIONS,
  getSubjectsForSchoolLevel,
  getTeachersForSubject,
} from "@/lib/past-tests-catalog";

type PastTest = {
  id: number;
  school_level: string;
  class_name: string;
  subject: string;
  teacher: string;
  test_number: number;
  upload_year: number;
  file_name: string;
  created_at: string;
};

const currentYear = new Date().getFullYear();
const defaultSchoolLevel = SCHOOL_LEVEL_OPTIONS[0];
const defaultUploaderClass = AHITN_CLASS_OPTIONS[0];
const defaultSubject = getSubjectsForSchoolLevel(defaultSchoolLevel)[0] ?? "";
const defaultTeacher = getTeachersForSubject(defaultSchoolLevel, defaultSubject)[0] ?? "";

type UploadFormState = {
  schoolLevel: string;
  className: string;
  subject: string;
  teacher: string;
  testNumber: string;
  uploadYear: string;
  file: File | null;
};

type FilterState = {
  schoolLevel: string;
  subject: string;
  teacher: string;
  testNumber: string;
};

function toFilterQuery(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.schoolLevel) {
    params.set("schoolLevel", filters.schoolLevel);
  }

  if (filters.subject) {
    params.set("subject", filters.subject);
  }

  if (filters.teacher) {
    params.set("teacher", filters.teacher);
  }

  if (filters.testNumber) {
    params.set("testNumber", filters.testNumber);
  }

  return params.toString();
}

export default function PastTestsPage() {
  const [tests, setTests] = useState<PastTest[]>([]);
  const [allTests, setAllTests] = useState<PastTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    schoolLevel: "",
    subject: "",
    teacher: "",
    testNumber: "",
  });
  const [hierarchySelection, setHierarchySelection] = useState("");
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    schoolLevel: defaultSchoolLevel,
    className: defaultUploaderClass,
    subject: defaultSubject,
    teacher: defaultTeacher,
    testNumber: String(TEST_NUMBER_OPTIONS[0]),
    uploadYear: String(currentYear),
    file: null,
  });

  const filterSubjectOptions = useMemo(() => {
    if (!filters.schoolLevel) {
      return [];
    }

    return getSubjectsForSchoolLevel(filters.schoolLevel);
  }, [filters.schoolLevel]);

  const filterTeacherOptions = useMemo(() => {
    if (!filters.schoolLevel || !filters.subject) {
      return [];
    }

    return getTeachersForSubject(filters.schoolLevel, filters.subject);
  }, [filters.schoolLevel, filters.subject]);

  const uploadSubjectOptions = useMemo(
    () => getSubjectsForSchoolLevel(uploadForm.schoolLevel),
    [uploadForm.schoolLevel],
  );

  const uploadTeacherOptions = useMemo(
    () => getTeachersForSubject(uploadForm.schoolLevel, uploadForm.subject),
    [uploadForm.schoolLevel, uploadForm.subject],
  );

  const hierarchyOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];

    for (const schoolLevel of SCHOOL_LEVEL_OPTIONS) {
      options.push({ value: `level|${schoolLevel}`, label: `${schoolLevel}. Schulstufe` });

      const subjects = getSubjectsForSchoolLevel(schoolLevel);
      for (const subject of subjects) {
        options.push({ value: `subject|${schoolLevel}|${subject}`, label: `└ ${subject}` });

        const teachers = getTeachersForSubject(schoolLevel, subject);
        for (const teacher of teachers) {
          options.push({ value: `teacher|${schoolLevel}|${subject}|${teacher}`, label: `   └ ${teacher}` });

          for (const testNumber of TEST_NUMBER_OPTIONS) {
            options.push({
              value: `test|${schoolLevel}|${subject}|${teacher}|${testNumber}`,
              label: `      └ ${testNumber}. Test`,
            });

            const uploads = allTests.filter(
              (test) =>
                test.school_level === schoolLevel &&
                test.subject === subject &&
                test.teacher === teacher &&
                test.test_number === testNumber,
            );

            for (const upload of uploads) {
              options.push({
                value: `upload|${upload.id}`,
                label: `         └ ${upload.upload_year}: ${upload.file_name}`,
              });
            }
          }
        }
      }
    }

    return options;
  }, [allTests]);

  const loadTests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = toFilterQuery(filters);
      const url = query ? `/api/past-tests?${query}` : "/api/past-tests";
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Alte Tests konnten nicht geladen werden.");
      }

      const payload = (await response.json()) as { tests: PastTest[] };
      setTests(payload.tests);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Alte Tests konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadAllTests = useCallback(async () => {
    try {
      const response = await fetch("/api/past-tests", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { tests: PastTest[] };
      setAllTests(payload.tests);
    } catch {
      // keep existing list when refresh fails
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    loadAllTests();
  }, [loadAllTests]);

  const onFilterSchoolLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const schoolLevel = event.target.value;
    setHierarchySelection("");
    setSelectedUploadId(null);

    setFilters({
      schoolLevel,
      subject: "",
      teacher: "",
      testNumber: "",
    });
  };

  const onFilterSubjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;
    setHierarchySelection("");
    setSelectedUploadId(null);

    setFilters((current) => ({
      ...current,
      subject,
      teacher: "",
      testNumber: "",
    }));
  };

  const onHierarchySelectionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setHierarchySelection(value);
    setSelectedUploadId(null);

    if (!value) {
      setFilters({ schoolLevel: "", subject: "", teacher: "", testNumber: "" });
      return;
    }

    const [kind, ...parts] = value.split("|");

    if (kind === "level") {
      setFilters({ schoolLevel: parts[0] ?? "", subject: "", teacher: "", testNumber: "" });
      return;
    }

    if (kind === "subject") {
      setFilters({ schoolLevel: parts[0] ?? "", subject: parts[1] ?? "", teacher: "", testNumber: "" });
      return;
    }

    if (kind === "teacher") {
      setFilters({
        schoolLevel: parts[0] ?? "",
        subject: parts[1] ?? "",
        teacher: parts[2] ?? "",
        testNumber: "",
      });
      return;
    }

    if (kind === "test") {
      setFilters({
        schoolLevel: parts[0] ?? "",
        subject: parts[1] ?? "",
        teacher: parts[2] ?? "",
        testNumber: parts[3] ?? "",
      });
      return;
    }

    if (kind === "upload") {
      const uploadId = Number.parseInt(parts[0] ?? "", 10);
      if (Number.isNaN(uploadId)) {
        setError("Der ausgewählte Upload ist ungültig.");
        return;
      }

      const upload = allTests.find((test) => test.id === uploadId);
      if (!upload) {
        setError("Der ausgewählte Upload wurde nicht gefunden.");
        return;
      }

      setSelectedUploadId(upload.id);
      setFilters({
        schoolLevel: upload.school_level,
        subject: upload.subject,
        teacher: upload.teacher,
        testNumber: String(upload.test_number),
      });
    }
  };

  const onUploadClassChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const className = event.target.value;

    setUploadForm((current) => ({
      ...current,
      className,
    }));
  };

  const onUploadSchoolLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const schoolLevel = event.target.value;
    const subjects = getSubjectsForSchoolLevel(schoolLevel);
    const subject = subjects[0] ?? "";
    const teachers = getTeachersForSubject(schoolLevel, subject);
    const teacher = teachers[0] ?? "";

    setUploadForm((current) => ({
      ...current,
      schoolLevel,
      subject,
      teacher,
    }));
  };

  const onUploadSubjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;
    const teachers = getTeachersForSubject(uploadForm.schoolLevel, subject);
    const teacher = teachers[0] ?? "";

    setUploadForm((current) => ({
      ...current,
      subject,
      teacher,
    }));
  };

  const onUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setUploadForm((current) => ({
      ...current,
      file,
    }));
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!uploadForm.file) {
      setError("Bitte eine ZIP-Datei auswählen.");
      return;
    }

    const payload = new FormData();
    payload.set("schoolLevel", uploadForm.schoolLevel);
    payload.set("className", uploadForm.className);
    payload.set("subject", uploadForm.subject);
    payload.set("teacher", uploadForm.teacher);
    payload.set("testNumber", uploadForm.testNumber);
    payload.set("uploadYear", uploadForm.uploadYear);
    payload.set("file", uploadForm.file);

    setSubmitting(true);

    try {
      const response = await fetch("/api/past-tests", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Test konnte nicht hochgeladen werden.");
      }

      setUploadForm((current) => ({
        ...current,
        uploadYear: String(currentYear),
        file: null,
      }));

      const fileInput = document.getElementById("past-test-file") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }

      await Promise.all([loadTests(), loadAllTests()]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Test konnte nicht hochgeladen werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedTests = selectedUploadId ? tests.filter((test) => test.id === selectedUploadId) : tests;

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Alte Tests</h1>
          <p className="mt-3 text-slate-700">
            Filtere nach Schulstufe, Fach, Lehrer und Testnummer oder lade einen neuen Test als ZIP hoch.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Tests durchsuchen</h2>
          <div className="mt-4 grid gap-3">
            <select
              value={hierarchySelection}
              onChange={onHierarchySelectionChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="">Nach Hierarchie filtern: Schulstufe → Fach → Lehrer → Test → Upload</option>
              {hierarchyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="grid gap-3 md:grid-cols-4">
            <select
              value={filters.schoolLevel}
              onChange={onFilterSchoolLevelChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="">Alle Schulstufen</option>
              {SCHOOL_LEVEL_OPTIONS.map((schoolLevel) => (
                <option key={schoolLevel} value={schoolLevel}>
                  {schoolLevel}. Schulstufe
                </option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={onFilterSubjectChange}
              disabled={!filters.schoolLevel}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Alle Fächer</option>
              {filterSubjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={filters.teacher}
              onChange={(event) => {
                setHierarchySelection("");
                setSelectedUploadId(null);
                setFilters((current) => ({ ...current, teacher: event.target.value }));
              }}
              disabled={!filters.schoolLevel || !filters.subject}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Alle Lehrer</option>
              {filterTeacherOptions.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>

            <select
              value={filters.testNumber}
              onChange={(event) => {
                setHierarchySelection("");
                setSelectedUploadId(null);
                setFilters((current) => ({ ...current, testNumber: event.target.value }));
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="">Alle Testnummern</option>
              {TEST_NUMBER_OPTIONS.map((number) => (
                <option key={number} value={number}>
                  {number}. Test
                </option>
              ))}
            </select>
            </div>
          </div>

          {loading ? <p className="mt-4 text-slate-600">Tests werden geladen...</p> : null}

          {!loading && displayedTests.length === 0 ? (
            <p className="mt-4 text-slate-600">Keine Tests für die aktuelle Auswahl gefunden.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {displayedTests.map((test) => (
                <li key={test.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {test.school_level}. Schulstufe · {test.subject} · {test.teacher} · {test.test_number}. Test
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Absenderklasse: {test.class_name} · Upload-Jahr: {test.upload_year} · Datei: {test.file_name}
                  </p>
                  <a
                    href={`/api/past-tests?downloadId=${test.id}`}
                    className="mt-3 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    ZIP herunterladen
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Test hochladen</h2>

          <form onSubmit={handleUpload} className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1 text-sm text-slate-700">
                Absenderklasse
                <select
                  value={uploadForm.className}
                  onChange={onUploadClassChange}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {AHITN_CLASS_OPTIONS.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm text-slate-700">
                Schulstufe des Tests
                <select
                  value={uploadForm.schoolLevel}
                  onChange={onUploadSchoolLevelChange}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {SCHOOL_LEVEL_OPTIONS.map((schoolLevel) => (
                    <option key={schoolLevel} value={schoolLevel}>
                      {schoolLevel}. Schulstufe
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm text-slate-700">
                Fach
                <select
                  value={uploadForm.subject}
                  onChange={onUploadSubjectChange}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {uploadSubjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm text-slate-700">
                Lehrer
                <select
                  value={uploadForm.teacher}
                  onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      teacher: event.target.value,
                    }))
                  }
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {uploadTeacherOptions.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-700">
                Testnummer
                <select
                  value={uploadForm.testNumber}
                  onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      testNumber: event.target.value,
                    }))
                  }
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {TEST_NUMBER_OPTIONS.map((number) => (
                    <option key={number} value={number}>
                      {number}. Test
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm text-slate-700">
                Upload-Jahr
                <input
                  type="number"
                  min={2000}
                  max={currentYear + 1}
                  value={uploadForm.uploadYear}
                  onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      uploadYear: event.target.value,
                    }))
                  }
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm text-slate-700">
              ZIP-Datei
              <input
                id="past-test-file"
                type="file"
                accept=".zip,application/zip"
                required
                onChange={onUploadFileChange}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Wird hochgeladen..." : "Test hochladen"}
            </button>
          </form>

          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </section>
      </div>
    </div>
  );
}
