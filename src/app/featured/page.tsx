"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductGrid } from "@/components/product/ProductGrid"
import { getFeaturedProducts } from "@/lib/data"
import { cn } from "@/lib/utils"

interface FeaturedProduct {
  id: string
  slug: string
  name: string
  nameUrdu: string
  category: string
  categoryUrdu: string
  description: string
  descriptionUrdu: string
  images: string[]
  videoUrl?: string
  basePrice: number
  featured: boolean
  soldOut: boolean
  variants: { id: string; name: string; nameUrdu: string; sku: string; price: number; stock: number }[]
}

export default function FeaturedPage() {
  const { locale, t } = useLanguage()
  const [dbProducts, setDbProducts] = useState<FeaturedProduct[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: FeaturedProduct[] | { error: string }) => {
        if (!active) return
        if (Array.isArray(data)) {
          setDbProducts(data.filter((p) => p.featured))
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const featured = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) return dbProducts
    return getFeaturedProducts()
  }, [dbProducts])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1 }}
            className={`mb-4 text-xs font-semibold uppercase text-gold-dark ${
              locale === "ur" ? "font-urdu text-sm tracking-normal" : ""
            }`}
          >
            ✦ {t("common.featured")} ✦
          </motion.p>
          <h1
            className={`text-5xl font-bold text-maroon md:text-6xl ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {locale === "ur" ? "نمایاں اشیاء" : "Featured Items"}
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
          <p className={`mt-5 inline-flex items-center gap-2 text-ink-soft ${
            locale === "ur" ? "font-urdu text-lg" : ""
          }`}>
            <Sparkles className="h-4 w-4 text-gold" />
            {locale === "ur"
              ? "ہمارے منتخب کردہ بہترین برتن دیکھیں"
              : "Handpicked pieces from our collection"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(loading && dbProducts === null ? "opacity-40" : "")}
        >
          {featured.length > 0 ? (
            <ProductGrid products={featured as never} />
          ) : (
            <p className={`py-20 text-center text-ink-soft ${
              locale === "ur" ? "font-urdu text-lg" : ""
            }`}>
              {locale === "ur" ? "کوئی نمایاں اشیاء نہیں" : "No featured items yet"}
            </p>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  )
}