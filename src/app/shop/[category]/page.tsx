"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductGrid } from "@/components/product/ProductGrid"
import { categories, getProductsByCategory, products } from "@/lib/data"

export default function CategoryPage() {
  const params = useParams<{ category: string }>()
  const { locale, t } = useLanguage()
  const slug = params.category
  const category = categories.find((c) => c.slug === slug)
  const categoryProducts = category ? getProductsByCategory(category.slug) : []
  const related = products
    .filter((p) => p.category !== slug)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 4)

  const name = category
    ? locale === "ur"
      ? category.nameUrdu
      : category.name
    : locale === "ur"
    ? "زمرہ"
    : "Category"

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-maroon to-rose p-10 text-center md:p-16"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-20"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold"
          >
            ✦ ✦ ✦
          </motion.p>
          <h1
            className={`text-5xl font-bold text-white drop-shadow-lg md:text-6xl ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {name}
          </h1>
          <p className={`mt-4 text-cream/90 ${locale === "ur" ? "font-urdu text-lg" : ""}`}>
            {locale === "ur"
              ? `${categoryProducts.length} مصنوعات دستیاب`
              : `${categoryProducts.length} products available`}
          </p>
        </motion.div>

        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink-soft">
          <a href="/" className={`transition-colors hover:text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {t("nav.home")}
          </a>
          <span>/</span>
          <a href="/shop" className={`transition-colors hover:text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {t("nav.shop")}
          </a>
          <span>/</span>
          <span className={`font-medium text-maroon ${locale === "ur" ? "font-urdu" : ""}`}>
            {name}
          </span>
        </nav>

        <ProductGrid products={categoryProducts} />

        {/* Related */}
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