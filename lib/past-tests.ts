import { ensurePastTestsSchema, query } from "@/lib/db";

export type PastTest = {
  id: number;
  school_level: string;
  class_name: string;
  subject: string;
  teacher: string;
  test_number: number;
  upload_year: number;
  topic_summary: string;
  file_name: string;
  created_at: string;
};

type PastTestWithData = PastTest & {
  file_data: unknown;
};

function toBuffer(data: unknown) {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  if (typeof data === "string") {
    if (data.startsWith("\\x")) {
      return Buffer.from(data.slice(2), "hex");
    }

    return Buffer.from(data, "base64");
  }

  return null;
}

export async function listPastTests(filters: {
  schoolLevel?: string;
  subject?: string;
  teacher?: string;
  testNumber?: number;
}) {
  await ensurePastTestsSchema();

  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.schoolLevel) {
    values.push(filters.schoolLevel);
    // Legacy rows used class_name values like "1ahitn"; fallback reads the first character as school level.
    // Rows without a numeric prefix simply won't match valid level filters ("1".."5").
    conditions.push(`COALESCE(school_level, LEFT(class_name, 1)) = $${values.length}`);
  }

  if (filters.subject) {
    values.push(filters.subject);
    conditions.push(`subject = $${values.length}`);
  }

  if (filters.teacher) {
    values.push(filters.teacher);
    conditions.push(`teacher = $${values.length}`);
  }

  if (typeof filters.testNumber === "number") {
    values.push(filters.testNumber);
    conditions.push(`test_number = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query<PastTest>(
    `SELECT id,
            COALESCE(school_level, LEFT(class_name, 1)) AS school_level,
            class_name,
            subject,
            teacher,
            test_number,
            upload_year,
            topic_summary,
            file_name,
            created_at
     FROM past_tests
     ${whereClause}
     ORDER BY created_at DESC;`,
    values,
  );

  return result.rows;
}

export async function createPastTest(input: {
  schoolLevel: string;
  className: string;
  subject: string;
  teacher: string;
  testNumber: number;
  uploadYear: number;
  topicSummary: string;
  fileName: string;
  fileData: Buffer;
}) {
  await ensurePastTestsSchema();

  const result = await query<PastTest>(
    `INSERT INTO past_tests (class_name, school_level, subject, teacher, test_number, upload_year, topic_summary, file_name, file_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id,
               COALESCE(school_level, LEFT(class_name, 1)) AS school_level,
               class_name,
               subject,
               teacher,
               test_number,
               upload_year,
               topic_summary,
               file_name,
               created_at;`,
    [
      input.className,
      input.schoolLevel,
      input.subject,
      input.teacher,
      input.testNumber,
      input.uploadYear,
      input.topicSummary,
      input.fileName,
      input.fileData,
    ],
  );

  return result.rows[0];
}

export async function getPastTestFile(id: number) {
  await ensurePastTestsSchema();

  const result = await query<PastTestWithData>(
    `SELECT id,
            COALESCE(school_level, LEFT(class_name, 1)) AS school_level,
            class_name,
            subject,
            teacher,
            test_number,
            upload_year,
            topic_summary,
            file_name,
            file_data,
            created_at
     FROM past_tests
     WHERE id = $1
     LIMIT 1;`,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const fileData = toBuffer(row.file_data);

  if (!fileData) {
    return null;
  }

  return {
    id: row.id,
    school_level: row.school_level,
    class_name: row.class_name,
    subject: row.subject,
    teacher: row.teacher,
    test_number: row.test_number,
    upload_year: row.upload_year,
    topic_summary: row.topic_summary,
    file_name: row.file_name,
    file_data: fileData,
    created_at: row.created_at,
  };
}
