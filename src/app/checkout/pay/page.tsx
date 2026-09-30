import Link from "next/link"
import { getOrder } from "@/lib/db"
import {
  buildJazzCashForm,
  jazzCashConfigured,
  jazzCashEnv,
} from "@/lib/payment/jazzcash"
import { Button } from "@/components/ui/Button"

export const dynamic = "force-dynamic"

export default async function JazzCashRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderId } = await searchParams

  if (!orderId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <p className="text-4xl">🚫</p>
        <h1 className="mt-6 font-serif-display text-3xl font-bold text-maroon">
          Missing order
        </h1>
        <p className="mt-3 text-ink-soft">No order was referenced.</p>
        <Link href="/checkout" className="mt-6">
          <Button>Back to checkout</Button>
        </Link>
      </main>
    )
  }

  const order = getOrder(orderId)
  if (!order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <p className="text-4xl">🤔</p>
        <h1 className="mt-6 font-serif-display text-3xl font-bold text-maroon">
          Order not found
        </h1>
        <p className="mt-3 text-ink-soft">We could not find that order.</p>
        <Link href="/checkout" className="mt-6">
          <Button>Back to checkout</Button>
        </Link>
      </main>
    )
  }

  // Already settled — don't re-bill.
  if (order.payment_status === "paid") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <p className="text-4xl">✅</p>
        <h1 className="mt-6 font-serif-display text-3xl font-bold text-maroon">
          Already paid
        </h1>
        <p className="mt-3 text-ink-soft">
          Order {order.order_number} has already been paid.
        </p>
        <Link href={`/checkout/success?order=${order.order_number}`} className="mt-6">
          <Button>View order</Button>
        </Link>
      </main>
    )
  }

  if (!jazzCashConfigured()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <p className="text-4xl">🔧</p>
        <h1 className="mt-6 font-serif-display text-3xl font-bold text-maroon">
          Payments not yet connected
        </h1>
        <p className="mt-3 max-w-md text-ink-soft">
          JazzCash payment is not configured on this store yet. Please contact the
          store owner to complete your order.
        </p>
        <p className="mt-2 rounded-xl bg-gold/10 px-4 py-2 text-xs font-mono text-gold-dark">
          Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT
        </p>
        <Link href="/" className="mt-6">
          <Button>Back to home</Button>
        </Link>
      </main>
    )
  }

  const form = buildJazzCashForm({
    orderNumber: order.order_number,
    amount: order.total,
    email: order.email ?? undefined,
    phone: order.phone,
    customerName: order.full_name,
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <p className="text-4xl">💳</p>
      <h1 className="mt-6 font-serif-display text-3xl font-bold text-maroon">
        Redirecting to JazzCash
      </h1>
      <p className="mt-3 text-ink-soft">
        Completing secure payment for order{" "}
        <span className="font-semibold text-maroon">{order.order_number}</span>
      </p>
      <p className="mt-1 text-sm text-ink-soft/70">
        Total: <span className="font-semibold">PKR {order.total.toLocaleString("en-PK")}</span> · If
        nothing happens, tap the button below.
      </p>

      <form action={form.action} method="POST" className="mt-8">
        {Object.entries(form.fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <Button type="submit" size="lg" className="gap-2">
          Pay with JazzCash →
        </Button>
      </form>

      <noscript>
        <p className="mt-4 text-sm text-danger">
          JavaScript is off — the button above is your only way through.
        </p>
      </noscript>
    </main>
  )
}