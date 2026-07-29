/**
 * Lightweight input validation & sanitization helpers.
 * Kept dependency-free to stay in the platform constraints.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 160 && EMAIL_RE.test(value);
}

export function cleanString(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  // Strip control chars and collapse whitespace; trim to max length.
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export function toInt(value: unknown, { min = 0, max = Number.MAX_SAFE_INTEGER, def = 0 } = {}): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function toBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function validateRegister(body: Record<string, unknown>): ValidationResult<{
  username: string;
  email: string;
  password: string;
  country: string;
}> {
  const username = cleanString(body.username, 30);
  const email = cleanString(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const country = cleanString(body.country, 60) || "US";

  if (username.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  if (username.length > 30) return { ok: false, error: "Username is too long." };
  if (!isEmail(email)) return { ok: false, error: "Please enter a valid email address." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (password.length > 100) return { ok: false, error: "Password is too long." };

  return { ok: true, data: { username, email, password, country } };
}

export function validateLogin(body: Record<string, unknown>): ValidationResult<{
  email: string;
  password: string;
}> {
  const email = cleanString(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!isEmail(email) || password.length === 0) {
    return { ok: false, error: "Email and password are required." };
  }
  return { ok: true, data: { email, password } };
}
