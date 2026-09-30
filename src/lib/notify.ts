import nodemailer from "nodemailer"

/**
 * Notifications — WhatsApp (Meta Cloud API) + Gmail (SMTP app password).
 *
 * Both channels are configured purely through environment variables and are
 * fail-soft: if credentials are missing, `sendNewOrderAlert`/`sendPaymentAlert`
 * log what would have been sent instead of throwing. A single Gmail/WhatsApp
 * config covers the whole store.
 *
 * Env keys:
 *   GMAIL_USER             — the Gmail address that sends (e.g. adina@gmail.com)
 *   GMAIL_APP_PASSWORD     — 16-char Gmail app password (no spaces)
 *   GMAIL_TO               — where store alerts go (defaults to GMAIL_USER)
 *   WHATSAPP_TOKEN         — Meta Cloud API access token
 *   WHATSAPP_PHONE_ID      — Meta phone-number-id (sender)
 *   WHATSAPP_TO            — where store alerts go: "923001234567" (defaults to WhatsApp Business account number if not set)
 *   WHATSAPP_TEMPLATE      — approved template name for store alerts (optional; falls back to raw text)
 */

const gmailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
const whatsAppConfigured = Boolean(
  process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID
)

const transporter = gmailConfigured
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null

function mask(s?: string) {
  if (!s) return "(not set)"
  return `${s.slice(0, 3)}…${s.slice(-3)}`
}

export function notificationStatus() {
  return {
    gmail: gmailConfigured
      ? { configured: true }
      : {
          configured: false,
          missing: [
            ...(process.env.GMAIL_USER ? [] : ["GMAIL_USER"]),
            ...(process.env.GMAIL_APP_PASSWORD ? [] : ["GMAIL_APP_PASSWORD"]),
          ],
        },
    whatsapp: whatsAppConfigured
      ? { configured: true }
      : {
          configured: false,
          missing: [
            ...(process.env.WHATSAPP_TOKEN ? [] : ["WHATSAPP_TOKEN"]),
            ...(process.env.WHATSAPP_PHONE_ID ? [] : ["WHATSAPP_PHONE_ID"]),
          ],
        },
    envPreview: {
      GMAIL_USER: mask(process.env.GMAIL_USER),
      WHATSAPP_PHONE_ID: mask(process.env.WHATSAPP_PHONE_ID),
      WHATSAPP_TO: mask(process.env.WHATSAPP_TO),
    },
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    console.warn(`[notify] Gmail not configured — would email "${subject}" to ${to}`)
    return
  }
  try {
    await transporter.sendMail({
      from: `"Adina Household Store" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[notify] Gmail sent: ${subject}`)
  } catch (err) {
    console.error("[notify] Gmail send failed:", err)
  }
}

async function sendWhatsApp(
  to: string,
  message: string,
  template?: { name: string; body: { [key: string]: string }[] }
): Promise<void> {
  if (!whatsAppConfigured) {
    console.warn(`[notify] WhatsApp not configured — would message ${to}: ${message}`)
    return
  }
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`
    const payload =
      template && process.env.WHATSAPP_TEMPLATE
        ? {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
              name: process.env.WHATSAPP_TEMPLATE,
              language: { code: "en" },
              components: [{ type: "body", parameters: template.body }],
            },
          }
        : {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: message },
          }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(`WhatsApp API ${res.status}: ${JSON.stringify(data)}`)
    }
    console.log(`[notify] WhatsApp sent to ${to}`)
  } catch (err) {
    console.error("[notify] WhatsApp send failed:", err)
  }
}

function money(n: number) {
  return `PKR ${(n ?? 0).toLocaleString("en-PK")}`
}

function itemsHtml(items: { productName: string; variantTitle: string; quantity: number; price: number }[]) {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">${esc(i.productName)} — ${esc(
          i.variantTitle
        )} × ${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${money(
          i.price * i.quantity
        )}</td></tr>`
    )
    .join("")
}

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

interface OrderForNotify {
  order_number: string
  full_name: string
  phone: string
  email: string | null
  city: string
  address: string
  payment_method: string
  payment_status: string
  total: number
  items: { productName: string; variantTitle: string; quantity: number; price: number }[]
}

const recipientEmail = () => process.env.GMAIL_TO ?? process.env.GMAIL_USER ?? "store@example.com"
const recipientWhatsApp = () => process.env.WHATSAPP_TO ?? ""

function toWhatsAppNumber(a: string) {
  // Accept multiple +92/03 forms; return E.164 without "+"
  let n = a.replace(/\D/g, "")
  if (n.startsWith("92")) return n
  if (n.startsWith("0")) return `92${n.slice(1)}`
  return `92${n}`
}

export async function sendNewOrderAlert(order: OrderForNotify): Promise<void> {
  const items = order.items
    .map((i) => `${i.productName} (${i.variantTitle}) × ${i.quantity} = ${money(i.price * i.quantity)}`)
    .join("\n")
  const statusLine =
    order.payment_status === "paid" ? "✅ PAID — payment completed online" : "⏳ UNPAID — awaiting payment"

  const emailHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3d1f2e;">
      <h2 style="color:#3d1f2e;">New Order ${esc(order.order_number)}</h2>
      <p style="font-size:15px;">
        <strong>${esc(order.full_name)}</strong> · ${esc(order.phone)}<br/>
        ${esc(order.address)}, ${esc(order.city)}<br/>
        ${order.email ? `Email: ${esc(order.email)}<br/>` : ""}
        Payment: <strong>${esc(order.payment_method)}</strong> — ${statusLine}
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml(order.items)}
        <tr><td style="padding-top:10px;font-weight:bold;">Total</td><td style="padding-top:10px;font-weight:bold;text-align:right;">${money(order.total)}</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:24px;">
        Update this order in the <a href="${process.env.SITE_URL ?? "/"}admin/orders">admin dashboard</a>.
      </p>
    </div>`

  await Promise.allSettled([
    sendEmail(recipientEmail(), `New Order ${order.order_number} — ${order.full_name}`, emailHtml),
    (async () => {
      const phone = recipientWhatsApp()
      if (!phone) {
        console.warn("[notify] WhatsApp recipient not set (WHATSAPP_TO). Skipping WhatsApp alert.")
        return
      }
      await sendWhatsApp(
        toWhatsAppNumber(phone),
        `New Order ${order.order_number}\n${order.full_name} · ${order.phone}\n${items}\nTotal: ${money(order.total)}\nPayment: ${order.payment_method} — ${statusLine}`
      )
    })(),
  ])
}

export async function sendPaymentAlert(order: OrderForNotify): Promise<void> {
  const paid = order.payment_status === "paid"
  const emoji = paid ? "✅" : "⏳"
  const subject = `${emoji} Payment ${paid ? "Received" : "Pending"} — Order ${order.order_number}`

  const emailHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3d1f2e;">
      <h2 style="color:#3d1f2e;">${emoji} Payment ${paid ? "Received" : "Pending"}</h2>
      <p style="font-size:15px;">
        Order <strong>${esc(order.order_number)}</strong> — ${esc(order.full_name)}<br/>
        Amount: <strong>${money(order.total)}</strong><br/>
        Payment method: ${esc(order.payment_method)}<br/>
        Status: <strong>${esc(order.payment_status)}</strong>
      </p>
    </div>`

  await Promise.allSettled([
    sendEmail(recipientEmail(), subject, emailHtml),
    (async () => {
      const phone = recipientWhatsApp()
      if (!phone) {
        console.warn("[notify] WhatsApp recipient not set (WHATSAPP_TO). Skipping WhatsApp alert.")
        return
      }
      await sendWhatsApp(
        toWhatsAppNumber(phone),
        `${emoji} Payment ${paid ? "received" : "pending"} for order ${order.order_number}\nCustomer: ${order.full_name}\nAmount: ${money(order.total)}\nStatus: ${order.payment_status}`
      )
    })(),
  ])
}