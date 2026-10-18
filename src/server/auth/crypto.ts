import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Opaque random token (sent to the client) — only its SHA-256 hash is stored. */
export function newToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
