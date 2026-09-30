"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Check, CreditCard, Banknote, Truck, Building2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useCartStore } from "@/store/cartStore"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { formatPrice, deliveryCities, cn } from "@/lib/utils"

type PaymentMethod = "jazzcash" | "easypaisa" | "bank" | "cod"

export default function CheckoutPage() {
  const { locale, t } = useLanguage()
  const { items, subtotal, clearCart } = useCartStore()
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState(deliveryCities[0])
  const [payment, setPayment] = useState<PaymentMethod>("jazzcash")
  const [placing, setPlacing] = useState(false)
  const [placingError, setPlacingError] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
  })
  const updateForm = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const subtotalVal = subtotal()
  const deliveryCharge = selectedCity.charge
  const total = subtotalVal + deliveryCharge

  const paymentMethods = [
    { id: "jazzcash" as PaymentMethod, icon: CreditCard, label: t("checkout.jazzcash") },
    { id: "easypaisa" as PaymentMethod, icon: Banknote, label: t("checkout.easypaisa") },
    { id: "bank" as PaymentMethod, icon: Building2, label: t("checkout.bankTransfer") },
    { id: "cod" as PaymentMethod, icon: Truck, label: t("checkout.cod") },
  ]

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address) {
      setPlacingError(locale === "ur" ? "براہ کرم تمام معلومات درج کریں" : "Please fill in all required fields")
      return
    }
    setPlacing(true)
    setPlacingError(null)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          city: selectedCity.city,
          address: form.address,
          province: form.province || selectedCity.province,
          paymentMethod: payment,
          paymentProvider: payment === "jazzcash" ? "jazzcash" : undefined,
          subtotal: subtotalVal,
          deliveryCharge,
          total,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            productNameUrdu: item.nameUrdu,
            variantTitle: item.variantName,
            variantTitleUrdu: item.variantNameUrdu,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to place order")
      }
      const { order } = await res.json()
      clearCart()
      if (payment === "jazzcash") {
        router.push(`/checkout/pay?order=${order.id}`)
      } else {
        router.push(`/checkout/success?order=${order.order_number}`)
      }
    } catch (err) {
      setPlacingError(
        locale === "ur"
          ? "آرڈر دینے میں خرابی ہوئی۔ دوبارہ کوشش کریں۔"
          : (err as Error).message || "Something went wrong. Please try again."
      )
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center py-32">
          <p className="text-5xl">📦</p>
          <p className={`mt-6 text-xl font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
            {locale === "ur" ? "ٹوکری خالی ہے" : "Your cart is empty"}
          </p>
          <Link href="/shop" className="mt-6">
            <Button>{t("cart.startShopping")}</Button>
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
            ✦ ✦ ✦
          </p>
          <h1
            className={`text-5xl font-bold text-maroon ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {t("checkout.title")}
          </h1>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div className="space-y-10">
            {/* Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-line bg-white p-6 md:p-8"
            >
              <h2
                className={`mb-6 text-xl font-semibold text-plum ${
                  locale === "ur" ? "heading-urdu text-2xl" : "font-serif-display"
                }`}
              >
                {t("checkout.shippingInfo")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: t("checkout.fullName"), placeholder: "John Doe", colSpan: true },
                  { label: t("checkout.phone"), placeholder: "+92 3XX XXXXXXX", colSpan: true },
                  { label: t("checkout.email"), placeholder: "name@email.com", colSpan: false },
                  { label: t("checkout.address"), placeholder: "House #, Street, Area", colSpan: false },
                  { label: t("checkout.city"), placeholder: "Karachi", colSpan: true, isCitySelect: true },
                  { label: t("checkout.province"), placeholder: "Sindh", colSpan: false },
                ].map((field, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-1.5",
                      field.colSpan && "sm:col-span-2"
                    )}
                  >
                    <label
                      className={`text-sm font-medium text-plum ${locale === "ur" ? "font-urdu" : ""}`}
                    >
                      {field.label}
                    </label>
                    {field.isCitySelect ? (
                      <select
                        value={selectedCity.city}
                        onChange={(e) => {
                          const c = deliveryCities.find((d) => d.city === e.target.value)
                          if (c) setSelectedCity(c)
                        }}
                        className="rounded-xl border border-line bg-cream-light px-4 py-3 text-plum focus:border-maroon focus:outline-none"
                      >
                        {deliveryCities.map((city) => (
                          <option key={city.city} value={city.city}>
                            {city.city} — {locale === "ur" ? "ترسیل" : "Delivery"}: {city.charge} {locale === "ur" ? "روپے" : "PKR"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.label === t("checkout.email") ? "email" : field.label === t("checkout.phone") ? "tel" : "text"}
                        placeholder={field.placeholder}
                        value={field.label === t("checkout.fullName") ? form.fullName
                          : field.label === t("checkout.phone") ? form.phone
                          : field.label === t("checkout.email") ? form.email
                          : field.label === t("checkout.address") ? form.address
                          : field.label === t("checkout.province") ? form.province
                          : ""}
                        onChange={(e) => {
                          if (field.label === t("checkout.fullName")) updateForm("fullName", e.target.value)
                          else if (field.label === t("checkout.phone")) updateForm("phone", e.target.value)
                          else if (field.label === t("checkout.email")) updateForm("email", e.target.value)
                          else if (field.label === t("checkout.address")) updateForm("address", e.target.value)
                          else if (field.label === t("checkout.province")) updateForm("province", e.target.value)
                        }}
                        className="rounded-xl border border-line bg-cream-light px-4 py-3 text-plum placeholder:text-ink-soft/40 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon/10"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className={`mt-4 rounded-xl bg-gold/10 px-4 py-2 text-sm text-gold-dark ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                ℹ️ {t("checkout.deliveryNote")}
              </p>
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-line bg-white p-6 md:p-8"
            >
              <h2
                className={`mb-6 text-xl font-semibold text-plum ${
                  locale === "ur" ? "heading-urdu text-2xl" : "font-serif-display"
                }`}
              >
                {t("checkout.paymentMethod")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPayment(method.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 p-4 text-start transition-colors",
                      payment === method.id
                        ? "border-maroon bg-maroon/5 shadow-md"
                        : "border-line bg-white hover:border-rose"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        payment === method.id ? "bg-maroon text-white" : "bg-rose-light text-plum"
                      )}
                    >
                      <method.icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        locale === "ur" && "font-urdu text-base",
                        payment === method.id ? "text-maroon" : "text-plum"
                      )}
                    >
                      {method.label}
                    </span>
                    {payment === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check className="h-5 w-5 text-maroon" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-fit rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8"
          >
            <h3
              className={`mb-6 text-lg font-semibold text-plum ${
                locale === "ur" ? "heading-urdu" : ""
              }`}
            >
              {t("checkout.orderSummary")}
            </h3>

            {/* Items */}
            <div className="max-h-64 space-y-3 overflow-y-auto pb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`line-clamp-1 text-sm font-medium text-plum ${locale === "ur" ? "heading-urdu text-base" : ""}`}>
                      {locale === "ur" ? item.nameUrdu : item.name}
                    </p>
                    <p className="text-xs text-ink-soft">{item.variantName}</p>
                  </div>
                  <p className={`text-sm font-semibold text-plum ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                    {formatPrice(item.price * item.quantity, locale)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-line pt-4">
              <div className={`flex justify-between text-sm ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                <span className="text-ink-soft">{t("cart.subtotal")}</span>
                <span className="font-medium text-plum">{formatPrice(subtotalVal, locale)}</span>
              </div>
              <div className={`flex justify-between text-sm ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                <span className="text-ink-soft">{t("cart.delivery")} ({selectedCity.city})</span>
                <span className="font-medium text-plum">{formatPrice(deliveryCharge, locale)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className={`font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                  {t("cart.total")}
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`text-2xl font-bold text-maroon ${locale === "ur" ? "font-urdu text-3xl" : ""}`}
                >
                  {formatPrice(total, locale)}
                </motion.span>
              </div>
            </div>

            <motion.div className="mt-6">
              {placingError && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger ${locale === "ur" ? "font-urdu text-base" : ""}`}
                >
                  {placingError}
                </motion.p>
              )}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? (
                  <motion.span
                    className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {t("checkout.placeOrder")}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}