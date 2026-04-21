export const AHITN_CLASS_OPTIONS = ["1ahitn", "2ahitn", "3ahitn", "4ahitn", "5ahitn"] as const;
export const SCHOOL_LEVEL_OPTIONS = ["1", "2", "3", "4", "5"] as const;

export const TEST_NUMBER_OPTIONS = [1, 2, 3, 4] as const;

export type AhitnClassName = (typeof AHITN_CLASS_OPTIONS)[number];
export type SchoolLevel = (typeof SCHOOL_LEVEL_OPTIONS)[number];

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

const fourthYearSubjects: SubjectTeachers[] = [
  { subject: "SEW", teachers: ["RATP", "PRAG"] },
  { subject: "Physik", teachers: ["HORF"] },
  { subject: "Chemie", teachers: ["CATD"] },
  { subject: "Geschichte", teachers: ["CATD"] },
  { subject: "ITSI", teachers: ["ROMO"] },
  { subject: "NWT", teachers: ["REWO", "ROMO", "RATP"] },
  { subject: "AM", teachers: ["HOTA", "SCAN"] },
  { subject: "MEDT", teachers: ["SAMC"] },
  { subject: "ITP2", teachers: ["SAMC"] },
  { subject: "Biologie", teachers: ["LINA"] },
  { subject: "WIR", teachers: ["HILS"] },
  { subject: "INSY", teachers: ["RATP", "SCHH"] },
];

export const PAST_TESTS_CATALOG: Record<SchoolLevel, SubjectTeachers[]> = {
  "1": firstYearSubjects,
  "2": secondYearSubjects,
  "3": thirdYearSubjects,
  "4": fourthYearSubjects,
  "5": thirdYearSubjects,
};

export function isValidAhitnClassName(value: string): value is AhitnClassName {
  return AHITN_CLASS_OPTIONS.includes(value as AhitnClassName);
}

export function isValidSchoolLevel(value: string): value is SchoolLevel {
  return SCHOOL_LEVEL_OPTIONS.includes(value as SchoolLevel);
}

export function getSubjectsForSchoolLevel(schoolLevel: string) {
  if (!isValidSchoolLevel(schoolLevel)) {
    return [];
  }

  return PAST_TESTS_CATALOG[schoolLevel].map((entry) => entry.subject);
}

export function getTeachersForSubject(schoolLevel: string, subject: string) {
  if (!isValidSchoolLevel(schoolLevel)) {
    return [];
  }

  const match = PAST_TESTS_CATALOG[schoolLevel].find((entry) => entry.subject === subject);
  return match?.teachers ?? [];
}

export function isValidSubjectForSchoolLevel(schoolLevel: string, subject: string) {
  return getSubjectsForSchoolLevel(schoolLevel).includes(subject);
}

export function isValidTeacherForSchoolLevelSubject(schoolLevel: string, subject: string, teacher: string) {
  return getTeachersForSubject(schoolLevel, subject).includes(teacher);
}

export function isValidTestNumber(value: number) {
  return TEST_NUMBER_OPTIONS.includes(value as (typeof TEST_NUMBER_OPTIONS)[number]);
}
