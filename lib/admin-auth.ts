import { timingSafeEqual } from "crypto";

const DEFAULT_ADMIN_PASSWORD_HASH = "48a3c4542c34b11e89f22e81013f8c6d746a4f970791615c4ecb49b9263b00bc";
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/;

function normalizeHash(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isSha256Hash(value: string) {
  return SHA256_HEX_PATTERN.test(value);
}

function getExpectedAdminPasswordHash() {
  return normalizeHash(process.env.ADMIN_PASSWORD_HASH) || DEFAULT_ADMIN_PASSWORD_HASH;
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAuthorizedAdminHash(passwordHash: unknown) {
  const providedHash = normalizeHash(passwordHash);
  const expectedHash = getExpectedAdminPasswordHash();

  if (!isSha256Hash(providedHash) || !isSha256Hash(expectedHash)) {
    return false;
  }

  return safeEquals(providedHash, expectedHash);
}

export function isAdminRequest(request: Request) {
  const passwordHash = request.headers.get("x-admin-hash");
  return isAuthorizedAdminHash(passwordHash);
}
