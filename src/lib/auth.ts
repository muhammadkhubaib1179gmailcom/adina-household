import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "adina_admin_session"
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days
const COOKIE_MAX_AGE = SESSION_TTL_SECONDS

/**
 * Non-secret domain-separation label. This is a fixed *message* fed to the KDF,
 * never key material — the signing key itself is derived from ADMIN_PASSWORD.
 */
const SESSION_KEY_CONTEXT = "adina-admin-session-v1"

/**
 * Admin auth — stateless HMAC-signed session cookie.
 *
 * The plaintext token is `<issuedAt>.<randomNonce>` and the cookie value is that
 * token plus an HMAC-SHA256 signature, so it can't be forged. No password-derived
 * material is ever placed in the cookie.
 *
 * Credentials are read ONLY from the environment (ADMIN_USERNAME,
 * ADMIN_PASSWORD). There are no built-in defaults and no fallback secrets. If a
 * variable is unset, matching fails and no session can be minted, so a
 * misconfigured deployment locks the admin panel closed rather than open.
 */

function adminUsername(): string {
  return process.env.ADMIN_USERNAME ?? ""
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? ""
}

export function adminPasswordConfigured() {
  return Boolean(adminPassword())
}

/**
 * Constant-time comparison of a submitted login username against ADMIN_USERNAME.
 * Mirrors passwordMatches so a bad username is rejected immediately without ever
 * minting a session. Fails closed when ADMIN_USERNAME is unset.
 */
export function usernameMatches(submitted: string) {
  const expected = usernameConfigured()
  if (!expected || !submitted || submitted.length !== expected.length) return false
  return timingSafeEqual(
    Buffer.from(submitted),
    Buffer.from(expected),
  )
}

/** The configured admin username, or "" when unset. */
export function usernameConfigured() {
  return adminUsername()
}

/**
 * Constant-time comparison of a submitted login password against ADMIN_PASSWORD.
 * This is the ONLY place a raw password is ever matched — createAdminSession()
 * must NOT be reached with a wrong password, because the session token alone
 * doesn't encode password validity. Fails closed when ADMIN_PASSWORD is unset.
 */
export function passwordMatches(submitted: string) {
  const expected = adminPassword()
  if (!expected || !submitted || submitted.length !== expected.length) return false
  return timingSafeEqual(
    Buffer.from(submitted),
    Buffer.from(expected),
  )
}

/**
 * Derives the session-signing key from ADMIN_PASSWORD. Returns "" when no
 * password is configured, which makes every signature check fail closed.
 */
function sessionSecret(): string {
  const password = adminPassword()
  if (!password) return ""
  return createHmac("sha256", password).update(SESSION_KEY_CONTEXT).digest("hex")
}

function signMessage(message: string) {
  const secret = sessionSecret()
  if (!secret) return ""
  return createHmac("sha256", secret).update(message).digest("hex")
}

function buildToken() {
  return `${Date.now()}.${randomBytes(16).toString("hex")}`
}

function tokenPartsPresent(token: string) {
  const parts = token.split(".")
  return parts.length >= 3 && parts.every(Boolean)
}

export async function createAdminSession() {
  if (!sessionSecret()) return null

  const token = buildToken()
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
  if (!sessionSecret() || !tokenPartsPresent(token)) return false

  const lastDot = token.lastIndexOf(".")
  if (lastDot < 0) return false
  const message = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  const expected = signMessage(message)
  const a = Buffer.from(signature, "hex")
  const b = Buffer.from(expected, "hex")
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const issuedAt = Number(message.split(".")[0])
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
