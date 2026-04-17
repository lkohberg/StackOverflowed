import { ensurePastTestsSchema, query } from "@/lib/db";

export type PastTest = {
  id: number;
  class_name: string;
  subject: string;
  teacher: string;
  test_number: number;
  upload_year: number;
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
  className?: string;
  subject?: string;
  teacher?: string;
  testNumber?: number;
}) {
  await ensurePastTestsSchema();

  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.className) {
    values.push(filters.className);
    conditions.push(`class_name = $${values.length}`);
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
    `SELECT id, class_name, subject, teacher, test_number, upload_year, file_name, created_at
     FROM past_tests
     ${whereClause}
     ORDER BY created_at DESC;`,
    values,
  );

  return result.rows;
}

export async function createPastTest(input: {
  className: string;
  subject: string;
  teacher: string;
  testNumber: number;
  uploadYear: number;
  fileName: string;
  fileData: Buffer;
}) {
  await ensurePastTestsSchema();

  const result = await query<PastTest>(
    `INSERT INTO past_tests (class_name, subject, teacher, test_number, upload_year, file_name, file_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, class_name, subject, teacher, test_number, upload_year, file_name, created_at;`,
    [
      input.className,
      input.subject,
      input.teacher,
      input.testNumber,
      input.uploadYear,
      input.fileName,
      input.fileData,
    ],
  );

  return result.rows[0];
}

export async function getPastTestFile(id: number) {
  await ensurePastTestsSchema();

  const result = await query<PastTestWithData>(
    `SELECT id, class_name, subject, teacher, test_number, upload_year, file_name, file_data, created_at
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
    class_name: row.class_name,
    subject: row.subject,
    teacher: row.teacher,
    test_number: row.test_number,
    upload_year: row.upload_year,
    file_name: row.file_name,
    file_data: fileData,
    created_at: row.created_at,
  };
}
