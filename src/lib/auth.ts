import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "adina_admin_session"
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days
const COOKIE_MAX_AGE = SESSION_TTL_SECONDS

/**
 * Admin auth — stateless HMAC-signed session cookie.
 *
 * The plaintext token is `<passwordHash>.<issuedAt>.<random>`, and the cookie
 * value is that token plus an HMAC-SHA256 signature so it can't be forged.
 * Verifying only requires the password (from ADMIN_PASSWORD env), so no
 * session table or running-auth infra is needed. Fail-soft: if ADMIN_PASSWORD
 * is unset, every check returns false (admin is locked out, nothing leaks).
 */

export function adminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD)
}

/**
 * Constant-time comparison of a submitted login username against ADMIN_USERNAME
 * (dev default "admin"). Mirrors passwordMatches so a bad username is rejected
 * immediately without ever minting a session.
 */
export function usernameMatches(submitted: string) {
  const expected = usernameConfigured()
  if (!expected || !submitted || submitted.length !== expected.length) return false
  return timingSafeEqual(
    Buffer.from(submitted),
    Buffer.from(expected),
  )
}

/** Dev-friendly username default — override with ADMIN_USERNAME. */
export function usernameConfigured() {
  return process.env.ADMIN_USERNAME ?? "admin"
}

/**
 * Constant-time comparison of a submitted login password against
 * ADMIN_PASSWORD (dev default "admin"). This is the ONLY place a raw password
 * is ever matched — createAdminSession() must NOT be reached with a wrong
 * password, because the session token alone doesn't encode password validity.
 */
export function passwordMatches(submitted: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "admin"
  if (!expected || !submitted || submitted.length !== expected.length) return false
  return timingSafeEqual(
    Buffer.from(submitted),
    Buffer.from(expected),
  )
}
function sha256(input: string) {
  return createHmac("sha256", "adina-admin-v1").update(input).digest("hex")
}

function signMessage(message: string) {
  const secret =
    process.env.ADMIN_PASSWORD ?? "adina-admin-fallback-secret-never-used-in-prod"
  return createHmac("sha256", secret).update(message).digest("hex")
}

function buildToken(password: string) {
  return `${sha256(password)}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`
}

function tokenPartsPresent(token: string) {
  const parts = token.split(".")
  return parts.length >= 3 && parts.every(Boolean)
}

export async function createAdminSession(password: string) {
  const token = buildToken(password)
  const signed = `${token}.${signMessage(token)}`

  const store = await cookies()
  store.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })
  return signed
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password || !tokenPartsPresent(token)) return false

  const lastDot = token.lastIndexOf(".")
  if (lastDot < 0) return false
  const message = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  const expected = signMessage(message)
  const a = Buffer.from(signature, "hex")
  const b = Buffer.from(expected, "hex")
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const issuedAt = Number(message.split(".")[1])
  if (!Number.isFinite(issuedAt)) return false
  return Date.now() - issuedAt < SESSION_TTL_SECONDS * 1000
}

/** True when the request carries a valid admin session. */
export async function hasAdminSessionToken(req: {
  cookies: ReturnType<typeof cookies>
}): Promise<boolean> {
  const store = await req.cookies
  const raw = store.get(SESSION_COOKIE)?.value
  return raw ? verifyAdminSession(raw) : false
}

/** Compact guard for client-side (server component) checks. */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  return raw ? verifyAdminSession(raw) : false
}

/** API-route guard. Returns a 401 response if not authed, else null. */
export async function requireAdmin(req: NextRequest | { cookies: () => Promise<unknown> }): Promise<NextResponse | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value && (await verifyAdminSession((await cookies()).get(SESSION_COOKIE)?.value ?? ""))
    ? null
    : NextResponse.json({ error: "Unauthorized — please log in to the admin panel" }, { status: 401 })
}

/** Deletes the admin session cookie (logout). Safe to call when unset. */
export async function clearAdminSession(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
}
