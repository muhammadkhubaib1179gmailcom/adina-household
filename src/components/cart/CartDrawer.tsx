"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { locale, t, dir } = useLanguage()
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCartStore()
  const total = subtotal()
  const count = itemCount()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line p-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-maroon" />
                <h2 className={`text-lg font-semibold text-plum ${locale === "ur" ? "heading-urdu text-xl" : ""}`}>
                  {t("cart.title")}
                </h2>
                <span className="rounded-full bg-maroon/10 px-2.5 py-0.5 text-sm font-bold text-maroon">
                  {count}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-plum hover:bg-rose-light/40"
                aria-label="Close cart"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.p
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl"
                  >
                    🛒
                  </motion.p>
                  <p className={`mt-4 font-semibold text-plum ${locale === "ur" ? "heading-urdu" : ""}`}>
                    {t("cart.empty")}
                  </p>
                  <p className={`mt-2 text-sm text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                    {t("cart.emptyHint")}
                  </p>
                  <Link href="/shop" onClick={onClose} className="mt-6">
                    <Button>{t("cart.startShopping")}</Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.variantId}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    className="relative rounded-2xl border border-line bg-white p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-dark">
                            {locale === "ur" ? item.variantNameUrdu : item.variantName}
                          </p>
                          <h3 className={`line-clamp-1 text-sm font-semibold text-plum ${locale === "ur" ? "heading-urdu text-base" : ""}`}>
                            {locale === "ur" ? item.nameUrdu : item.name}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-line">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center text-plum"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className={`w-7 text-center text-sm font-bold ${locale === "ur" ? "font-urdu" : ""}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center text-plum"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className={`text-sm font-bold text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
                            {formatPrice(item.price * item.quantity, locale)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-ink-soft/50 hover:bg-danger/10 hover:text-danger"
                      aria-label={t("cart.remove")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-line p-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-ink-soft ${locale === "ur" ? "font-urdu" : "text-sm"}`}>
                    {t("cart.subtotal")}
                  </span>
                  <span className={`font-bold text-maroon ${locale === "ur" ? "font-urdu text-xl" : "text-lg"}`}>
                    {formatPrice(total, locale)}
                  </span>
                </div>
                <p className={`mb-4 text-xs text-ink-soft/70 ${locale === "ur" ? "font-urdu" : ""}`}>
                  {t("cart.delivery")}: {locale === "ur" ? "اخراجات میں شامل" : "at checkout"}
                </p>
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="mb-2 w-full">
                    {t("cart.title")}
                  </Button>
                </Link>
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full gap-2">
                    {t("cart.checkout")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}