import crypto from "node:crypto";

/**
 * Centralized environment access.
 *
 * Design goals:
 *  - NEVER hard-crash the running app just because an optional secret is unset.
 *    A missing JWT_SECRET should degrade gracefully (auto-generate one + warn),
 *    not take down every route that imports auth.
 *  - DATABASE_URL is the only truly required value; without it the app cannot work.
 *  - We do NOT throw at import time (Next evaluates modules during `next build`).
 */

const isProd = process.env.NODE_ENV === "production";

// A per-process fallback secret. If JWT_SECRET is not provided we generate a
// strong random one so tokens are still signed securely for this instance.
// (Sessions won't survive a restart or span multiple instances — set
// JWT_SECRET in production to make sessions durable and shared.)
let generatedSecret: string | null = null;
let warnedAboutSecret = false;

function resolveJwtSecret(): string {
  const provided = process.env.JWT_SECRET;
  if (provided && provided.length >= 32) return provided;

  if (provided && provided.length > 0 && provided.length < 32) {
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn(
        "[env] JWT_SECRET is shorter than 32 characters; using it anyway. " +
          "Use a longer secret in production."
      );
    }
    return provided;
  }

  // No usable secret provided.
  if (isProd && !warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      "[env] JWT_SECRET is not set. Falling back to a randomly generated, " +
        "per-instance secret. Sessions will not persist across restarts or " +
        "multiple instances. Set JWT_SECRET for durable sessions."
    );
  }
  if (!generatedSecret) {
    generatedSecret = crypto.randomBytes(48).toString("base64");
  }
  return generatedSecret;
}

let warnedAboutDb = false;

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  // Fallback placeholder connection string.
  // This prevents Next.js from crashing at build-time/import-time when DATABASE_URL is unset.
  if (!warnedAboutDb) {
    warnedAboutDb = true;
    console.warn(
      "[env] DATABASE_URL is not set. Falling back to a placeholder connection string. " +
        "You must configure a valid PostgreSQL connection string in your environment before querying the database."
    );
  }
  return "postgresql://dummy_user:dummy_pass@127.0.0.1:5432/dummy_db";
}

export const env = {
  isProd,
  get databaseUrl() {
    return resolveDatabaseUrl();
  },
  get jwtSecret() {
    return resolveJwtSecret();
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Puzzle Universe",
} as const;
