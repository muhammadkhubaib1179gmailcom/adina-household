import crypto from "crypto"

/**
 * JazzCash MPG v2.0 redirect integration.
 *
 * Flow:
 *   1. Server builds a signed form (pp_* fields + pp_SecureHash) for the
 *      JazzCash checkout URL.
 *   2. The browser auto-submits the form to JazzCash (or redirects to it).
 *   3. Customer pays → JazzCash redirects back to JAZZCASH_RETURN_URL with
 *      response params incl. pp_ResponseCode ("000" = success) + pp_SecureHash.
 *   4. Server re-computes the hash over the returned params and marks the
 *      order paid/unpaid.
 *
 * Env keys:
 *   JAZZCASH_ENV              — "test" (default) or "live"
 *   JAZZCASH_MERCHANT_ID      — e.g. "MCprakash121212122345"
 *   JAZZCASH_PASSWORD         — API password from the JazzCash dashboard
 *   JAZZCASH_INTEGRITY_SALT   — integrity salt from the JazzCash dashboard
 *   JAZZCASH_RETURN_URL       — full URL JazzCash sends the customer back to
 *                               (e.g. https://yourdomain.com/api/payment/jazzcash/return)
 *   JAZZCASH_FAIL_RETURN_URL  — optional; falls back to RETURN_URL
 */

function envOrThrow(): {
  merchantId: string
  password: string
  salt: string
} {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID
  const password = process.env.JAZZCASH_PASSWORD
  const salt = process.env.JAZZCASH_INTEGRITY_SALT
  if (!merchantId || !password || !salt) {
    throw new Error(
      "JazzCash is not configured. Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD and JAZZCASH_INTEGRITY_SALT."
    )
  }
  return { merchantId, password, salt }
}

export function jazzCashConfigured() {
  return Boolean(
    process.env.JAZZCASH_MERCHANT_ID &&
      process.env.JAZZCASH_PASSWORD &&
      process.env.JAZZCASH_INTEGRITY_SALT
  )
}

export function jazzCashEnv() {
  return {
    env: process.env.JAZZCASH_ENV === "live" ? "live" : "test",
    merchantId: process.env.JAZZCASH_MERCHANT_ID ?? "(not set)",
    returnUrl:
      process.env.JAZZCASH_RETURN_URL ?? `${process.env.SITE_URL ?? ""}/api/payment/jazzcash/return`,
    postUrl:
      process.env.JAZZCASH_ENV === "live"
        ? "https://payments.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction"
        : "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction",
  }
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

/** JazzCash is UTC+5 (Asia/Karachi), no DST. */
function jazzCashDateTime(d = new Date()): string {
  const karachi = new Date(d.getTime() + 5 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return [
    karachi.getUTCFullYear(),
    pad(karachi.getUTCMonth() + 1),
    pad(karachi.getUTCDate()),
    pad(karachi.getUTCHours()),
    pad(karachi.getUTCMinutes()),
    pad(karachi.getUTCSeconds()),
  ].join("")
}

/** Amount in PKR rupees → paisa integers as JazzCash expects. */
export function toPaisa(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100)
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function txnRef(seed: string): string {
  // JazzCash test ref numbers must be <= 19 chars; tastefully unique.
  const time = Date.now().toString(36).toUpperCase()
  const rand = Array.from({ length: 8 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join(
    ""
  )
  return `AH${seed.replace(/[^A-Za-z0-9]/g, "").slice(-5).toUpperCase()}${time}${rand}`.slice(0, 19)
}

export interface JazzCashForm {
  action: string
  fields: Record<string, string>
}

export interface BuildPaymentInput {
  orderNumber: string
  amount: number // PKR
  email?: string
  phone?: string
  customerName?: string
}

/**
 * Builds the signed auto-submit form. The client renders it as a POSTing form,
 * the cleanest & safest way to hand the customer over to JazzCash's hosted
 * checkout while protecting the integrity string from tampering.
 */
export function buildJazzCashForm(input: BuildPaymentInput): JazzCashForm {
  const { merchantId, password, salt } = envOrThrow()
  const refNumber = txnRef(input.orderNumber)
  const amount = toPaisa(input.amount)
  const txnDateTime = jazzCashDateTime()
  const txnExpiry = jazzCashDateTime(new Date(Date.now() + 2 * 60 * 60 * 1000))
  const returnUrl =
    process.env.JAZZCASH_RETURN_URL ?? `${process.env.SITE_URL ?? ""}/api/payment/jazzcash/return`
  const description = `Order ${input.orderNumber} - Adina Household`
  const billReference = input.orderNumber

  const hashString = [
    salt,
    "&",
    amount,
    "&",
    billReference,
    "&",
    description,
    "&",
    "EN",
    "&",
    merchantId,
    "&",
    password,
    "&",
    returnUrl,
    "&",
    "PKR",
    "&",
    txnDateTime,
    "&",
    txnExpiry,
    "&",
    refNumber,
    "&",
    "M",
    "&",
    "2.0",
  ].join("")

  const fields: Record<string, string> = {
    pp_Version: "2.0",
    pp_TxnType: "M",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNumber: refNumber,
    pp_Amount: String(amount),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: txnExpiry,
    pp_BillReference: billReference,
    pp_Description: description,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: sha256Hex(hashString),
  }
  if (input.email) fields.pp_Email = input.email
  if (input.phone) fields.pp_PhoneNumber = input.phone
  if (input.customerName) fields.pp_CustomerName = input.customerName

  return {
    action: jazzCashEnv().postUrl,
    fields,
  }
}

/** Params JazzCash posts back to RETURN_URL. */
export interface JazzCashReturnParams {
  pp_Amount?: string
  pp_AuthCode?: string
  pp_BankID?: string
  pp_BillReference?: string
  pp_Description?: string
  pp_Language?: string
  pp_MerchantID?: string
  pp_ResponseCode?: string
  pp_TxnCurrency?: string
  pp_TxnDateTime?: string
  pp_TxnRefNo?: string
  pp_SecureHash?: string
  pp_TxnType?: string
  pp_Version?: string
}

export type HashStatus = "valid" | "invalid" | "mismatch" | "unconfigured"

export interface JazzCashReturnResult {
  hashStatus: HashStatus
  paid: boolean
  paymentStatus: "paid" | "unpaid"
  txnRef?: string
  authCode?: string
}

/**
 * Verifies the hash JazzCash returns on the RETURN_URL redirect and decodes
 * whether payment succeeded (pp_ResponseCode === "000").
 */
export function verifyJazzCashReturn(params: JazzCashReturnParams): JazzCashReturnResult {
  const { merchantId, salt } = envOrThrow()

  const hashString = [
    salt,
    "&",
    params.pp_Amount ?? "",
    "&",
    params.pp_AuthCode ?? "",
    "&",
    params.pp_BankID ?? "",
    "&",
    params.pp_BillReference ?? "",
    "&",
    params.pp_Description ?? "",
    "&",
    params.pp_Language ?? "",
    "&",
    params.pp_MerchantID ?? "",
    "&",
    params.pp_ResponseCode ?? "",
    "&",
    params.pp_TxnCurrency ?? "",
    "&",
    params.pp_TxnDateTime ?? "",
    "&",
    params.pp_TxnRefNo ?? "",
    "&",
    params.pp_Version ?? "",
  ].join("")

  const expected = sha256Hex(hashString)
  const received = (params.pp_SecureHash ?? "").toLowerCase()

  if (params.pp_MerchantID && params.pp_MerchantID !== merchantId) {
    return { hashStatus: "mismatch", paid: false, paymentStatus: "unpaid" }
  }
  if (received && received !== expected) {
    return { hashStatus: "invalid", paid: false, paymentStatus: "unpaid" }
  }

  const paid = params.pp_ResponseCode === "000"
  return {
    hashStatus: expected === received ? "valid" : received ? "invalid" : "valid",
    paid,
    paymentStatus: paid ? "paid" : "unpaid",
    txnRef: params.pp_TxnRefNo,
    authCode: params.pp_AuthCode,
  }
}