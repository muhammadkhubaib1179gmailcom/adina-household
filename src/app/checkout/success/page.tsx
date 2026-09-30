"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Home, ShoppingBag, Package, Wallet } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"

interface OrderData {
  order_number: string
  full_name: string
  city: string
  payment_method: string
  payment_status: string
  total: number
  status: string
  created_at: string
  items: { product_name: string; variant_title: string; price: number; quantity: number; image: string | null }[]
}

const paymentLabel: Record<string, { en: string; ur: string }> = {
  jazzcash: { en: "JazzCash", ur: "جاز کیش" },
  easypaisa: { en: "EasyPaisa", ur: "ایزی پیسہ" },
  bank: { en: "Bank Transfer", ur: "بینک ٹرانسفر" },
  cod: { en: "Cash on Delivery", ur: "ڈیلیوری پر ادائیگی" },
}

function OrderSuccessContent() {
  const { locale, t } = useLanguage()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const paymentParam = searchParams.get("payment")
  const errorParam = searchParams.get("error")
  const [order, setOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    if (!orderNumber) return
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => { if (d.order) setOrder(d.order) })
      .catch(() => {})
  }, [orderNumber])

  const displayNumber = orderNumber ?? "ADH-00000"

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="h-24 w-24 text-success" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-8 text-5xl font-bold text-maroon ${
            locale === "ur" ? "heading-urdu" : "font-serif-display"
          }`}
        >
          {t("checkout.orderSuccess")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-4 max-w-md text-ink-soft ${locale === "ur" ? "font-urdu text-lg" : "text-lg"}`}
        >
          {locale === "ur"
            ? "آپ کا آرڈر کامیابی سے دے دیا گیا ہے۔ ہم جلد ہی آپ سے رابطہ کریں گے۔"
            : "Your order has been successfully placed. We will contact you shortly."}
        </motion.p>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl border border-line bg-white px-8 py-4"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            {t("checkout.orderNumber")}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-maroon">{displayNumber}</p>
        </motion.div>

        {/* Payment status banner — JazzCash online payments + COD status show up here */}
        {order && order.payment_status === "unpaid" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 w-full max-w-md rounded-2xl border border-amber bg-amber/10 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className={`font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                  {locale === "ur" ? "ادائیگی ابھی باقی ہے" : "Payment pending"}
                </p>
                <p className={`text-sm text-ink-soft ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                  {order.payment_method === "jazzcash"
                    ? locale === "ur"
                      ? "جاز کیش کے ذریعے آن لائن ادائیگی کریں"
                      : "Pay online with JazzCash to complete your order"
                    : locale === "ur"
                      ? "ہم آپ کی ادائیگی وصول کرنے کے منتظر ہیں"
                      : "We are awaiting your payment to confirm the order"}
                </p>
              </div>
            </div>
            {order.payment_method === "jazzcash" && (
              <Link
                href={`/checkout/return-to-pay?order=${order.order_number}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-maroon hover:text-plum"
              >
                <Wallet className={`h-4 w-4 ${locale === "ur" ? "ml-1" : "mr-1"}`} />
                {locale === "ur" ? "ابھی ادائیگی کریں" : "Pay now"}
              </Link>
            )}
          </motion.div>
        )}
        {order && order.payment_status === "paid" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 flex w-full max-w-md items-center gap-3 rounded-2xl border border-success bg-success/10 px-5 py-4 text-left"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className={`font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                {locale === "ur" ? "ادائیگی مکمل" : "Payment received"}
              </p>
              <p className={`text-sm text-ink-soft ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                {locale === "ur"
                  ? "آپ کا آرڈر تصدیق شدہ ہے — ہم اسے بھیج رہے ہیں"
                  : "Your order is confirmed — we are processing it for delivery."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 w-full max-w-md rounded-2xl border border-line bg-white p-6 text-left"
          >
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-maroon" />
              <h3 className={`font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                {locale === "ur" ? "آرڈر کی تفصیلات" : "Order Details"}
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">{locale === "ur" ? "ناизм" : "Name"}</span>
                <span className="font-medium text-plum">{order.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">{locale === "ur" ? "شہر" : "City"}</span>
                <span className="font-medium text-plum">{order.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">{locale === "ur" ? "ادائیگی" : "Payment"}</span>
                <span className="font-medium text-plum">
                  {paymentLabel[order.payment_method][locale]} —{" "}
                  {order.payment_status === "paid"
                    ? locale === "ur"
                      ? "ادائیگی مکمل"
                      : "Paid"
                    : locale === "ur"
                      ? "ادائیگی باقی"
                      : "Unpaid"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">{locale === "ur" ? "کل رقم" : "Total"}</span>
                <span className="font-bold text-maroon">{formatPrice(order.total, locale)}</span>
              </div>
            </div>
            {order.items.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className={`mb-2 text-xs uppercase tracking-wider text-ink-soft ${locale === "ur" ? "font-urdu text-sm" : ""}`}>
                  {locale === "ur" ? "اشیاء" : "Items"}
                </p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className={`text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                        {locale === "ur" ? item.product_name : item.product_name} ×{item.quantity}
                      </span>
                      <span className="font-medium text-plum">{formatPrice(item.price * item.quantity, locale)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex gap-4"
        >
          <Link href="/">
            <Button variant="ghost" size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              {t("nav.home")}
            </Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t("nav.shop")}
            </Button>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <OrderSuccessContent />
    </Suspense>
  )
}