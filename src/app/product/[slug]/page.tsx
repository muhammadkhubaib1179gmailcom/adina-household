"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Heart, Truck, ShieldCheck, MinusCircle, Check } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { ProductGrid } from "@/components/product/ProductGrid"
import { getProductBySlug, getProductsByCategory, type Variant, type Product } from "@/lib/data"
import { formatPrice, cn } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"

export default function ProductPage() {
  const params = useParams<{ slug: string }>()
  const { locale, t } = useLanguage()
  const addItem = useCartStore((s) => s.addItem)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeImage, setActiveImage] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cartState, setCartState] = useState<"idle" | "loading" | "success">("idle")
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data)
          setSelectedVariant(data.variants[0] ?? null)
        } else {
          const fallback = getProductBySlug(params.slug)
          setProduct(fallback || null)
          setSelectedVariant(fallback?.variants[0] ?? null)
        }
      } catch {
        const fallback = getProductBySlug(params.slug)
        setProduct(fallback || null)
        setSelectedVariant(fallback?.variants[0] ?? null)
      }
      setLoading(false)
    }
    loadProduct()
  }, [params.slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-maroon border-t-transparent"></div>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center py-32">
          <h1 className="text-4xl font-bold text-plum">404</h1>
          <p className={`mt-4 text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
            {locale === "ur" ? "مصنوعہ نہیں ملی" : "Product not found"}
          </p>
          <Link href="/shop" className="mt-6">
            <Button>{t("common.back")}</Button>
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const outOfStock = product.soldOut || selectedVariant?.stock === 0
  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (outOfStock || !selectedVariant) return
    setCartState("loading")
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      nameUrdu: product.nameUrdu,
      variantName: selectedVariant.name,
      variantNameUrdu: selectedVariant.nameUrdu,
      image: product.images[0],
      price: selectedVariant.price,
      stock: selectedVariant.stock,
    }, quantity)
    setTimeout(() => {
      setCartState("success")
      setTimeout(() => setCartState("idle"), 2000)
    }, 600)
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className={`transition-colors hover:text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {t("nav.home")}
          </Link>
          <span>/</span>
          <Link
            href={`/shop/${product.category}`}
            className={`transition-colors hover:text-maroon ${locale === "ur" ? "font-urdu" : ""}`}
          >
            {locale === "ur" ? product.categoryUrdu : product.category}
          </Link>
          <span>/</span>
          <span className={`font-medium text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {locale === "ur" ? product.nameUrdu : product.name}
          </span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* ===== GALLERY ===== */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl bg-cream-light shadow-lg"
            >
              <div className="relative aspect-square">
                <AnimatePresence mode="wait">
                  {showVideo && product.videoUrl ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <video
                        src={product.videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={product.images[activeImage]}
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <span className="rounded-full bg-danger px-6 py-3 text-lg font-bold text-white shadow-xl">
                    {t("product.outOfStock")}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-3">
              {product.videoUrl && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowVideo(true)
                    setActiveImage(-1)
                  }}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all md:h-24 md:w-24",
                    showVideo
                      ? "border-maroon shadow-lg shadow-maroon/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  aria-label="Play video"
                >
                  <video
                    src={product.videoUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <svg className="h-5 w-5 text-maroon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              )}
              {product.images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveImage(i)
                    setShowVideo(false)
                  }}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all md:h-24 md:w-24",
                    activeImage === i && !showVideo
                      ? "border-maroon shadow-lg shadow-maroon/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  aria-label={`Image ${i + 1}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="96px" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* ===== INFO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Category */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">
              {locale === "ur" ? product.categoryUrdu : product.category}
            </p>

            {/* Title */}
            <h1
              className={`text-3xl font-bold leading-tight tracking-tight text-plum md:text-4xl ${
                locale === "ur" ? "heading-urdu text-4xl md:text-5xl" : "font-serif-display"
              }`}
            >
              {locale === "ur" ? product.nameUrdu : product.name}
            </h1>

            {/* Price */}
            <motion.div
              key={selectedVariant?.price}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center gap-4"
            >
              <span
                className={`text-3xl font-bold text-maroon ${locale === "ur" ? "font-urdu" : "font-serif-display"}`}
              >
                {formatPrice(selectedVariant?.price ?? product.basePrice, locale)}
              </span>
              {selectedVariant?.size && (
                <span className={`rounded-full bg-rose-light/50 px-3 py-1 text-sm text-plum ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur"
                    ? `سائز: ${selectedVariant.size}`
                    : `Size: ${selectedVariant.size}`}
                </span>
              )}
            </motion.div>

            {/* Stock status */}
            <div className="mt-4 flex items-center gap-2">
              {outOfStock ? (
                <span className={`flex items-center gap-1.5 text-sm font-medium text-danger ${locale === "ur" ? "font-urdu" : ""}`}>
                  <MinusCircle className="h-4 w-4" />
                  {t("product.outOfStock")}
                </span>
              ) : selectedVariant && selectedVariant.stock <= 5 ? (
                <span className={`flex items-center gap-1.5 text-sm font-medium text-danger ${locale === "ur" ? "font-urdu" : ""}`}>
                  <span className={`h-2 w-2 rounded-full bg-danger ${locale === "ur" ? "" : ""}`} />
                  {locale === "ur"
                    ? `صرف ${selectedVariant.stock} باقی`
                    : t("product.lowStock", { n: selectedVariant.stock })}
                </span>
              ) : (
                <span className={`flex items-center gap-1.5 text-sm font-medium text-success ${locale === "ur" ? "font-urdu" : ""}`}>
                  <Check className="h-4 w-4" />
                  {t("product.inStock")}
                </span>
              )}
            </div>

            {/* Variant selector */}
            {product.variants.length > 1 && (
              <div className="mt-8">
                <h3
                  className={`mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum ${
                    locale === "ur" ? "font-urdu tracking-normal text-base" : ""
                  }`}
                >
                  {t("product.chooseVariant")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <motion.button
                      key={variant.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedVariant(variant)
                        setQuantity(1)
                      }}
                      className={cn(
                        "rounded-2xl border-2 px-5 py-3 text-start transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-maroon bg-maroon text-white shadow-lg shadow-maroon/20"
                          : "border-line bg-white text-plum hover:border-rose"
                      )}
                    >
                      <span className={locale === "ur" ? "font-urdu" : "font-medium"}>
                        {locale === "ur" ? variant.nameUrdu : variant.name}
                      </span>
                      <span className={`block text-sm opacity-70 ${locale === "ur" ? "font-urdu" : ""}`}>
                        {formatPrice(variant.price, locale)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center rounded-full border-2 border-line bg-white">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center text-plum"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </motion.button>
                <motion.span
                  key={quantity}
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`w-10 text-center text-lg font-bold text-plum ${locale === "ur" ? "font-urdu" : ""}`}
                >
                  {quantity}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, selectedVariant?.stock ?? 99))
                  }
                  className="flex h-12 w-12 items-center justify-center text-plum"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Add to cart */}
              <motion.div className="flex-1" whileHover={outOfStock ? {} : { scale: 1.02 }}>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={outOfStock || cartState !== "idle"}
                  whileTap={outOfStock ? {} : { scale: 0.96 }}
                  className={`relative flex w-full items-center justify-center overflow-hidden rounded-full py-3.5 text-base font-semibold text-white shadow-xl transition-colors ${
                    outOfStock
                      ? "cursor-not-allowed bg-plum/30"
                      : cartState === "success"
                      ? "bg-success"
                      : "bg-maroon hover:bg-maroon-dark"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {cartState === "idle" && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        {locale === "ur" ? "ٹوکری میں شامل کریں" : t("product.addToCart")}
                      </motion.span>
                    )}
                    {cartState === "loading" && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.span
                          className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.span>
                    )}
                    {cartState === "success" && (
                      <motion.span
                        key="success"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5" />
                        {t("cart.added")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setWishlisted(!wishlisted)}
                aria-label="Add to wishlist"
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                  wishlisted
                    ? "border-danger bg-danger text-white"
                    : "border-line bg-white text-plum hover:border-danger hover:text-danger"
                }`}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"
              >
                <Truck className="h-6 w-6 shrink-0 text-maroon" />
                <span className={`text-sm text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur" ? "پاکستان بھر میں ترسیل" : "Ships across Pakistan"}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"
              >
                <ShieldCheck className="h-6 w-6 shrink-0 text-gold-dark" />
                <span className={`text-sm text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur" ? "جاز کیش، ایزی پیسہ" : "JazzCash & EasyPaisa"}
                </span>
              </motion.div>
            </div>

            {/* Description */}
            <div className="mt-10">
              <h3
                className={`mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-plum ${
                  locale === "ur" ? "font-urdu tracking-normal text-base" : ""
                }`}
              >
                {t("product.description")}
              </h3>
              <p className={`leading-relaxed text-ink-soft ${locale === "ur" ? "heading-urdu text-lg" : ""}`}>
                {locale === "ur" ? product.descriptionUrdu : product.description}
              </p>
            </div>

            {/* SKU */}
            {selectedVariant && (
              <p className="mt-6 text-sm text-ink-soft/70">
                {t("product.sku")}: <span className="font-mono">{selectedVariant.sku}</span>
              </p>
            )}
          </motion.div>
        </div>

        {/* ===== RELATED ===== */}
        {related.length > 0 && (
          <section className="mt-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`mb-8 text-center text-3xl font-semibold text-plum md:text-4xl ${
                locale === "ur" ? "heading-urdu" : "font-serif-display"
              }`}
            >
              {t("product.related")}
            </motion.h2>
            <ProductGrid products={related} />
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}