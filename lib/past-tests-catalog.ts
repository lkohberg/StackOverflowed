export const CLASS_OPTIONS = ["1ahitn", "2ahitn", "3ahitn", "4ahitn", "5ahitn"] as const;

export const TEST_NUMBER_OPTIONS = [1, 2, 3, 4] as const;

export type ClassName = (typeof CLASS_OPTIONS)[number];

export type SubjectTeachers = {
  subject: string;
  teachers: string[];
};

const firstYearSubjects: SubjectTeachers[] = [
  { subject: "SEW", teachers: ["RATP", "PRAG"] },
  { subject: "SYT", teachers: ["SCHH"] },
  { subject: "Physik", teachers: ["HORF"] },
  { subject: "Geografie", teachers: ["RABS"] },
  { subject: "ITSI", teachers: ["ROMO"] },
  { subject: "NWT", teachers: ["PUSC"] },
  { subject: "AM", teachers: ["HOTA", "SCAN"] },
  { subject: "MEDT", teachers: ["SAMC"] },
];

const secondYearSubjects: SubjectTeachers[] = [
  { subject: "SEW", teachers: ["RATP", "PRAG"] },
  { subject: "SYT", teachers: ["SCHH"] },
  { subject: "Chemie", teachers: ["CATD"] },
  { subject: "Geschichte", teachers: ["CATD"] },
  { subject: "ITSI", teachers: ["ROMO"] },
  { subject: "NWT", teachers: ["PUSC", "REWO"] },
  { subject: "AM", teachers: ["HOTA", "SCAN"] },
  { subject: "MEDT", teachers: ["SAMC", "RATP"] },
  { subject: "ITP2", teachers: ["PRAG", "REMO"] },
];

const thirdYearSubjects: SubjectTeachers[] = [
  { subject: "SEW", teachers: ["RATP", "PRAG"] },
  { subject: "SYT", teachers: ["SCHH"] },
  { subject: "Physik", teachers: ["HORF"] },
  { subject: "Chemie", teachers: ["CATD"] },
  { subject: "Geschichte", teachers: ["CATD"] },
  { subject: "ITSI", teachers: ["ROMO"] },
  { subject: "NWT", teachers: ["PUSC", "REWO"] },
  { subject: "AM", teachers: ["HOTA", "SCAN"] },
  { subject: "MEDT", teachers: ["SAMC"] },
  { subject: "ITP2", teachers: ["SAMC"] },
];

export const PAST_TESTS_CATALOG: Record<ClassName, SubjectTeachers[]> = {
  "1ahitn": firstYearSubjects,
  "2ahitn": secondYearSubjects,
  "3ahitn": thirdYearSubjects,
  "4ahitn": thirdYearSubjects,
  "5ahitn": thirdYearSubjects,
};

export function isValidClassName(value: string): value is ClassName {
  return CLASS_OPTIONS.includes(value as ClassName);
}

export function getSubjectsForClass(className: string) {
  if (!isValidClassName(className)) {
    return [];
  }

  return PAST_TESTS_CATALOG[className].map((entry) => entry.subject);
}

export function getTeachersForSubject(className: string, subject: string) {
  if (!isValidClassName(className)) {
    return [];
  }

  const match = PAST_TESTS_CATALOG[className].find((entry) => entry.subject === subject);
  return match?.teachers ?? [];
}

export function isValidSubjectForClass(className: string, subject: string) {
  return getSubjectsForClass(className).includes(subject);
}

export function isValidTeacherForClassSubject(className: string, subject: string, teacher: string) {
  return getTeachersForSubject(className, subject).includes(teacher);
}

export function isValidTestNumber(value: number) {
  return TEST_NUMBER_OPTIONS.includes(value as (typeof TEST_NUMBER_OPTIONS)[number]);
}
