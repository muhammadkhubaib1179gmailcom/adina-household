"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useCartStore } from "@/store/cartStore"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const { locale, t } = useLanguage()
  const { items, removeItem, updateQuantity, subtotal } = useCartStore()
  const total = subtotal()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
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
            {t("cart.title")}
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-line bg-white p-16 text-center"
          >
            <motion.p
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-2 text-5xl"
            >
              🛒
            </motion.p>
            <p className={`mt-6 text-xl font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
              {t("cart.empty")}
            </p>
            <p className={`mt-2 text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
              {t("cart.emptyHint")}
            </p>
            <Link href="/shop" className="mt-8 inline-block">
              <Button size="lg">
                {t("cart.startShopping")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Items */}
            <div className="space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.variantId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.3 } }}
                    className="flex gap-5 rounded-2xl border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
                      <Image
                        src={item.image}
                        alt={locale === "ur" ? item.nameUrdu : item.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                          {locale === "ur" ? item.variantNameUrdu : item.variantName}
                        </p>
                        <h3
                          className={`mt-1 line-clamp-1 text-base font-semibold text-plum ${
                            locale === "ur" ? "heading-urdu" : "font-serif-display text-lg"
                          }`}
                        >
                          {locale === "ur" ? item.nameUrdu : item.name}
                        </h3>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-4">
                        <div className="flex items-center rounded-full border border-line">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center text-plum hover:text-maroon"
                            aria-label="Decrease"
                          >
                            <Minus className="h-4 w-4" />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`w-8 text-center font-bold ${locale === "ur" ? "font-urdu text-base" : "text-sm"}`}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center text-plum hover:text-maroon"
                            aria-label="Increase"
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className={`font-bold text-maroon ${locale === "ur" ? "font-urdu text-lg" : "text-lg"}`}>
                            {formatPrice(item.price * item.quantity, locale)}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 8 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => removeItem(item.variantId)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-danger/10 hover:text-danger"
                            aria-label={t("cart.remove")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
                {locale === "ur" ? "آرڈر کا خلاصہ" : "Order Summary"}
              </h3>

              <div className="space-y-4 border-b border-line pb-4">
                <div className={`flex justify-between text-sm text-ink-soft ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                  <span>{t("cart.subtotal")}</span>
                  <span className="font-medium text-plum">{formatPrice(total, locale)}</span>
                </div>
                <div className={`flex justify-between text-sm text-ink-soft ${locale === "ur" ? "font-urdu text-base" : ""}`}>
                  <span>{t("cart.delivery")}</span>
                  <span className="font-medium text-plum">{locale === "ur" ? "اخراجات میں شامل" : "Calculated at checkout"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-5">
                <span className={`font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                  {t("cart.total")}
                </span>
                <span className={`text-xl font-bold text-maroon ${locale === "ur" ? "font-urdu text-2xl" : ""}`}>
                  {formatPrice(total, locale)}
                </span>
              </div>

              <Link href="/checkout">
                <Button className="w-full gap-2" size="lg">
                  {t("cart.checkout")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link
                href="/shop"
                className={`mt-4 block text-center text-sm text-ink-soft hover:text-maroon ${locale === "ur" ? "font-urdu text-base" : ""}`}
              >
                {t("cart.continueShopping")}
              </Link>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}