import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Admin auth — stateless, password-based session cookie.
 *
 * Flow:
 *  - POST /api/admin/login checks the password (ADMIN_PASSWORD) and, if ok,
 *    sets an HttpOnly session cookie holding a signed token.
 *  - Every admin API route + the /admin app layout calls `requireAdmin()`
 *    / `isAdminAuthed()` which re-verifies the signature + expiry.
 *
 * The token is `payload.signature` where
 *   payload    = base64url(hmac(password, "adina-admin:" + issuedAt))|issuedAt|nonce
 *   signature  = hmac(payload, ADMIN_PASSWORD)
 * So only someone who knows ADMIN_PASSWORD can mint or forge a session, and
 * nothing is stored server-side (no session table needed).
 *
 * Fail-soft: if ADMIN_PASSWORD is unset, every check returns false (admin is
 * locked out unless a password is configured) — never accidentally open.
 */

const SESSION_COOKIE = "adina_admin_session"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url")
}

function hmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url")
}

function deriveSecret(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return ""
  return hmac(pw, "adina-store:admin-secret-v1") // salt the derived key
}

function buildToken(payloadData: string): string {
  const secret = deriveSecret()
  const payload = b64url(payloadData)
  const signature = hmac(payload, secret)
  return `${payload}.${signature}`
}

function parseToken(token: string): { payload: string; issuedAt: number } | null {
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  // verify signature before trusting anything
  const secret = deriveSecret()
  if (!secret) return null
  const expected = hmac(payload, secret)
  const a = Buffer.from(signature, "base64url")
  const b = Buffer.from(expected, "base64url")
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  let issuedAt: number
  try {
    issuedAt = parseInt(Buffer.from(payload, "base64url").toString("utf8").split("|")[1] ?? "", 10)
  } catch {
    return null
  }
  if (!Number.isFinite(issuedAt)) return null
  return { payload, issuedAt }
}

/** Is an admin password configured? */
export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8)
}

/** Validate a submitted password against ADMIN_PASSWORD (constant-time-ish). */
export function passwordMatches(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const a = Buffer.from(submitted)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Check the expiry + signature of a raw session token. */
export function isValidAdminToken(token: string): boolean {
  const parsed = parseToken(token)
  if (!parsed) return false
  return Date.now() - parsed.issuedAt < SESSION_TTL_MS
}

/** Server-side guard used by admin API routes. Returns a 401 nextResponse if not authed. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token || !isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized — please log in to the admin panel" }, { status: 401 })
  }
  return null
}

/** Bladeguard for the /admin application layout (server component). */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return Boolean(token && isValidAdminToken(token))
}

/** Called by /api/admin/login — issues the HttpOnly session cookie. */
export async function setAdminSessionCookie() {
  const store = await cookies()
  const payloadData = `adina-admin:${Date.now()}|${Date.now()}|${Math.random().toString(36).slice(2)}`
  const token = buildToken(payloadData)
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  })
}

/** Called by /api/admin/logout. */
export async function clearAdminSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
}
