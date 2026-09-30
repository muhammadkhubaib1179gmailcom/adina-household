"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Button } from "@/components/ui/Button"
import { categories, products } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function ShopPage() {
  const { locale, t } = useLanguage()
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<string>("featured")
  const [priceRange, setPriceRange] = useState<string>("all")
  const [mobileFilters, setMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]
    if (category !== "all") list = list.filter((p) => p.category === category)
    if (priceRange === "under-2000") list = list.filter((p) => p.basePrice < 2000)
    if (priceRange === "2000-5000") list = list.filter((p) => p.basePrice >= 2000 && p.basePrice <= 5000)
    if (priceRange === "over-5000") list = list.filter((p) => p.basePrice > 5000)

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.basePrice - b.basePrice)
        break
      case "price-high":
        list.sort((a, b) => b.basePrice - a.basePrice)
        break
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured))
    }
    return list
  }, [category, sort, priceRange])

  const filters = (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h4 className={`mb-4 text-lg font-black uppercase tracking-[0.15em] text-maroon ${locale === "ur" ? "font-urdu tracking-normal" : ""}`}>
          {locale === "ur" ? "زمرہ" : "Category"}
        </h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "w-full rounded-xl px-4 py-2.5 text-start text-sm font-semibold transition-all",
                locale === "ur" && "font-urdu",
                category === "all"
                  ? "bg-gradient-to-r from-maroon via-maroon-dark to-gold text-white shadow-lg shadow-maroon/30"
                  : "bg-gradient-to-r from-maroon/10 via-maroon/5 to-gold/15 text-ink hover:from-maroon/25 hover:to-gold/30 hover:text-maroon"
              )}
            >
              {t("common.all")}
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "w-full rounded-xl px-4 py-2.5 text-start text-sm font-semibold transition-all",
                  locale === "ur" && "font-urdu",
                  category === c.slug
                    ? "bg-gradient-to-r from-maroon via-maroon-dark to-gold text-white shadow-lg shadow-maroon/30"
                    : "bg-gradient-to-r from-maroon/10 via-maroon/5 to-gold/15 text-ink hover:from-maroon/25 hover:to-gold/30 hover:text-maroon"
                )}
              >
                {locale === "ur" ? c.nameUrdu : c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h4 className={`mb-4 text-lg font-black uppercase tracking-[0.15em] text-maroon ${locale === "ur" ? "font-urdu tracking-normal" : ""}`}>
          {locale === "ur" ? "قیمت" : "Price"}
        </h4>
        <ul className="space-y-2">
          {[
            { value: "all", label: locale === "ur" ? "سب" : "All" },
            { value: "under-2000", label: locale === "ur" ? "2,000 سے کم" : "Under PKR 2,000" },
            { value: "2000-5000", label: locale === "ur" ? "2,000 - 5,000" : "PKR 2,000 - 5,000" },
            { value: "over-5000", label: locale === "ur" ? "5,000 سے زیادہ" : "Over PKR 5,000" },
          ].map((range) => (
            <li key={range.value}>
              <button
                onClick={() => setPriceRange(range.value)}
                className={cn(
                  "w-full rounded-xl px-4 py-2.5 text-start text-sm transition-all",
                  locale === "ur" && "font-urdu",
                  priceRange === range.value
                    ? "bg-gradient-to-r from-maroon via-maroon-dark to-gold text-white shadow-md shadow-maroon/30"
                    : "bg-gradient-to-r from-maroon/10 via-maroon/5 to-gold/15 text-ink hover:from-maroon/25 hover:to-gold/30 hover:text-maroon"
                )}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Page header — same gradient + animation as category header bar */}
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
          <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            ✦ ✦ ✦
          </p>
          <h1
            className={`relative text-5xl font-bold text-white drop-shadow-lg md:text-6xl ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {locale === "ur" ? "تمام اشیاء" : "All Products"}
          </h1>
          <p className={`relative mt-4 text-cream/90 ${locale === "ur" ? "font-urdu" : ""}`}>
            {locale === "ur"
              ? `${filtered.length} مصنوعات دستیاب`
              : `Showing ${filtered.length} products`}
          </p>
        </motion.div>

        {/* Mobile filter toggle */}
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4 lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setMobileFilters(!mobileFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
            {t("common.filter")}
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm"
          >
            <option value="featured">{t("common.featured")}</option>
            <option value="price-low">{t("common.priceLow")}</option>
            <option value="price-high">{t("common.priceHigh")}</option>
          </select>
        </div>

        <div className="flex gap-10">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden w-64 shrink-0 lg:block"
          >
            <div className="sticky top-28">{filters}</div>
          </motion.aside>

          {/* Mobile filters drawer */}
          <AnimatePresence>
            {mobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileFilters(false)}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed right-0 bottom-0 left-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6 lg:hidden"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t("common.filter")}</h3>
                    <button
                      onClick={() => setMobileFilters(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-rose-light/40"
                      aria-label="Close"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  {filters}
                  <div className="mt-6">
                    <Button className="w-full" onClick={() => setMobileFilters(false)}>
                      {locale === "ur" ? "دکھائیں" : "Apply"}
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products */}
          <div className="flex-1">
            {/* Sort for desktop */}
            <div className="mb-8 hidden items-center justify-end lg:flex">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-plum focus:border-maroon focus:outline-none"
              >
                <option value="featured">{t("common.featured")}</option>
                <option value="price-low">{t("common.priceLow")}</option>
                <option value="price-high">{t("common.priceHigh")}</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={category + sort + priceRange}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductGrid products={filtered} />
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className={`text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur"
                    ? "کوئی مصنوعہ نہیں ملی۔ فلٹر تبدیل کریں۔"
                    : "No products found. Try adjusting your filters."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}