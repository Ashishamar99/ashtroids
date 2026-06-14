import crypto from "crypto";

interface OTPEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OTPEntry>();
const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 60 * 1000; // 1 minute between sends

export function generateOTP(email: string): { code: string; cooldown: boolean } {
  const existing = store.get(email);
  if (existing && existing.expiresAt - OTP_TTL_MS + COOLDOWN_MS > Date.now()) {
    return { code: "", cooldown: true };
  }

  const code = crypto.randomInt(100000, 999999).toString();
  store.set(email, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
  return { code, cooldown: false };
}

export function verifyOTP(
  email: string,
  code: string
): { valid: boolean; error?: string } {
  const entry = store.get(email);
  if (!entry) return { valid: false, error: "No OTP requested" };
  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return { valid: false, error: "OTP expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email);
    return { valid: false, error: "Too many attempts" };
  }

  entry.attempts++;

  if (entry.code !== code) {
    return { valid: false, error: "Invalid code" };
  }

  store.delete(email);
  return { valid: true };
}
