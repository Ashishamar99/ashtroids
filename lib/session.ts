import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_NAME = "admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET env variable is not set");
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expires}`;
  return `${payload}:${sign(payload)}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [role, expiresStr, sig] = parts;
  const payload = `${role}:${expiresStr}`;

  if (sign(payload) !== sig) return false;
  if (Date.now() > parseInt(expiresStr, 10)) return false;

  return true;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_NAME)?.value;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySessionToken(token);
}
