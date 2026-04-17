"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  CLASS_OPTIONS,
  TEST_NUMBER_OPTIONS,
  getSubjectsForClass,
  getTeachersForSubject,
} from "@/lib/past-tests-catalog";

type PastTest = {
  id: number;
  class_name: string;
  subject: string;
  teacher: string;
  test_number: number;
  upload_year: number;
  file_name: string;
  created_at: string;
};

const currentYear = new Date().getFullYear();
const defaultClassName = CLASS_OPTIONS[0];
const defaultSubject = getSubjectsForClass(defaultClassName)[0] ?? "";
const defaultTeacher = getTeachersForSubject(defaultClassName, defaultSubject)[0] ?? "";

type UploadFormState = {
  className: string;
  subject: string;
  teacher: string;
  testNumber: string;
  uploadYear: string;
  file: File | null;
};

type FilterState = {
  className: string;
  subject: string;
  teacher: string;
  testNumber: string;
};

function toFilterQuery(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.className) {
    params.set("className", filters.className);
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    className: "",
    subject: "",
    teacher: "",
    testNumber: "",
  });
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    className: defaultClassName,
    subject: defaultSubject,
    teacher: defaultTeacher,
    testNumber: String(TEST_NUMBER_OPTIONS[0]),
    uploadYear: String(currentYear),
    file: null,
  });

  const filterSubjectOptions = useMemo(() => {
    if (!filters.className) {
      return [];
    }

    return getSubjectsForClass(filters.className);
  }, [filters.className]);

  const filterTeacherOptions = useMemo(() => {
    if (!filters.className || !filters.subject) {
      return [];
    }

    return getTeachersForSubject(filters.className, filters.subject);
  }, [filters.className, filters.subject]);

  const uploadSubjectOptions = useMemo(
    () => getSubjectsForClass(uploadForm.className),
    [uploadForm.className],
  );

  const uploadTeacherOptions = useMemo(
    () => getTeachersForSubject(uploadForm.className, uploadForm.subject),
    [uploadForm.className, uploadForm.subject],
  );

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

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const onFilterClassChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const className = event.target.value;

    setFilters({
      className,
      subject: "",
      teacher: "",
      testNumber: "",
    });
  };

  const onFilterSubjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;

    setFilters((current) => ({
      ...current,
      subject,
      teacher: "",
      testNumber: "",
    }));
  };

  const onUploadClassChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const className = event.target.value;
    const subjects = getSubjectsForClass(className);
    const subject = subjects[0] ?? "";
    const teachers = getTeachersForSubject(className, subject);
    const teacher = teachers[0] ?? "";

    setUploadForm((current) => ({
      ...current,
      className,
      subject,
      teacher,
    }));
  };

  const onUploadSubjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;
    const teachers = getTeachersForSubject(uploadForm.className, subject);
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

      await loadTests();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Test konnte nicht hochgeladen werden.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Alte Tests</h1>
          <p className="mt-3 text-slate-700">
            Filtere nach Klasse, Fach, Lehrer und Testnummer oder lade einen neuen Test als ZIP hoch.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Tests durchsuchen</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              value={filters.className}
              onChange={onFilterClassChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="">Alle Klassen</option>
              {CLASS_OPTIONS.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={onFilterSubjectChange}
              disabled={!filters.className}
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
              onChange={(event) => setFilters((current) => ({ ...current, teacher: event.target.value }))}
              disabled={!filters.className || !filters.subject}
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
              onChange={(event) => setFilters((current) => ({ ...current, testNumber: event.target.value }))}
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

          {loading ? <p className="mt-4 text-slate-600">Tests werden geladen...</p> : null}

          {!loading && tests.length === 0 ? (
            <p className="mt-4 text-slate-600">Keine Tests für die aktuelle Auswahl gefunden.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {tests.map((test) => (
                <li key={test.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {test.class_name} · {test.subject} · {test.teacher} · {test.test_number}. Test
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload-Jahr: {test.upload_year} · Datei: {test.file_name}
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
                Klasse
                <select
                  value={uploadForm.className}
                  onChange={onUploadClassChange}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                >
                  {CLASS_OPTIONS.map((className) => (
                    <option key={className} value={className}>
                      {className}
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
