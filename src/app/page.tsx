"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Truck, Palette, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Button } from "@/components/ui/Button"
import { ProductGrid } from "@/components/product/ProductGrid"
import { CategoryCard } from "@/components/product/CategoryCard"
import { categories, getFeaturedProducts, products } from "@/lib/data"

export default function Home() {
  const { locale, t } = useLanguage()
  const featured = getFeaturedProducts().slice(0, 8)
  const storageCategory = categories.find((c) => c.slug === "storage")

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 160])

  return (
    <>
      <Header />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
{/* Hero background: set1.png - middle section only, vivid but readable */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: 'url("/crockery/set1.png")',
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              opacity: 0.5,
            }}
          />
          {/* Overlay for better text contrast - made more subtle */}
          <div className="absolute inset-0 -z-5 bg-white/20" />

          {/* Hero content with scroll parallax */}
          <motion.div
            style={{ y: heroY }}
            className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-32 md:px-8 md:pt-24 md:pb-44"
          >
            {/* Hero content - centered over the plate area */}
            <div className="flex flex-col items-center text-center">
              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, letterSpacing: "0.3em" }}
                transition={{ duration: 1 }}
                className={`mb-4 text-xs font-semibold uppercase text-gold-dark ${locale === "ur" ? "font-urdu text-sm tracking-normal" : ""}`}
              >
                ✦ {t("hero.featured")} ✦
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl lg:text-8xl ${
                  locale === "ur" ? "heading-urdu" : "font-serif-display"
                } bg-gradient-to-r from-maroon-dark via-maroon-light to-maroon-dark bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)]`}
              >
                {t("hero.title")}
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
              />

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={`mt-6 max-w-2xl text-xl font-medium text-maroon-light md:text-2xl ${
                  locale === "ur" ? "heading-urdu" : "font-serif-display"
                }`}
              >
                {t("hero.tagline")}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className={`mt-4 max-w-xl text-sm text-ink-soft md:text-base ${
                  locale === "ur" ? "font-urdu" : ""
                }`}
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
              >
                <Link href="/shop">
                  <Button size="lg" className="gap-2">
                    {t("hero.cta")}
                    <motion.span
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="inline-flex"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </Button>
                </Link>
                <Link href="/featured" className="inline-block">
<Button size="lg" variant="ghost" className="gap-2 text-maroon">
                  <motion.span
                    animate={{
                      scale: [1, 1.12, 1],
                      textShadow: [
                        "0 0 0px rgba(212,175,55,0)",
                        "0 0 16px rgba(212,175,55,0.9)",
                        "0 0 0px rgba(212,175,55,0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 text-gold" />
                    {locale === "ur" ? "نمایاں اشیاء" : "Featured Items"}
                  </motion.span>
                </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Marquee strip */}
          <div className="border-y border-line bg-cream/45 py-4 backdrop-blur-sm">
            <div className="flex overflow-hidden">
              <motion.div
                className="flex shrink-0 gap-8 whitespace-nowrap px-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex shrink-0 items-center gap-8">
                    {categories.map((c) => (
                      <span
                        key={`${i}-${c.slug}`}
                        className={`text-sm uppercase tracking-[0.25em] text-maroon/70 ${locale === "ur" ? "font-urdu tracking-normal text-base" : ""}`}
                      >
                        ✦ {locale === "ur" ? c.nameUrdu : c.name}
                      </span>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader
            eyebrow={t("common.explore")}
            title={t("sections.categories")}
            description={
              locale === "ur"
                ? "ہر زمرے کو دریافت کریں — ہاتھ سے بنے سیرامکس سے لے کر نفیس گلاس ویئر تک۔"
                : "Discover each collection — from handcrafted ceramics to refined glassware."
            }
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {categories.slice(0, 6).map((cat, i) => (
              <CategoryCard
                key={cat.slug}
                slug={cat.slug}
                name={cat.name}
                nameUrdu={cat.nameUrdu}
                image={cat.image}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* ===== BEST SELLERS ===== */}
        <section className="bg-gradient-to-b from-cream/45 to-cream/70 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeader
              eyebrow="✦ ✦ ✦"
              title={t("sections.bestSellers")}
              description={
                locale === "ur"
                  ? "ہمارے سب سے زیادہ پسند کیے جانے والے برتن — جو ہر گھر کو خوبصورت بناتے ہیں۔"
                  : "Our most loved pieces — objects that bring beauty to every home."
              }
            />
            <ProductGrid products={featured} />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-14 text-center"
            >
              <Link href="/shop">
                <Button variant="outline" size="lg">
                  {t("common.viewAll")} <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ===== STORAGE PROMO ===== */}
        <section className="relative overflow-hidden py-20">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-maroon)_0%,_var(--color-plum)_70%)]"
          />
          <motion.div
            className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 md:flex-row md:px-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full md:w-1/2">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
                <div className="relative aspect-[4/5] md:aspect-square">
                  <Image
                    src="https://cdn.shopify.com/s/files/1/0980/0469/7401/files/E8DD2FE4-1B2C-44B5-B624-19FA511A9331.jpg?v=1775126052&width=900"
                    alt={locale === "ur" ? "اسٹوریج" : "Storage"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-maroon/20" />
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-5 -right-5 flex h-24 w-24 items-center justify-center rounded-full bg-gold text-center shadow-xl"
              >
                <span className={`text-sm font-bold text-plum ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur" ? "نئی آمد" : "New"}
                </span>
              </motion.div>
            </div>

            <div className="w-full text-center md:w-1/2 md:text-start">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-rose"
              >
                {locale === "ur" ? "ذخیرہ کرنے کے ساتھ" : "Storage collection"}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`text-4xl font-bold leading-tight text-white md:text-5xl ${
                  locale === "ur" ? "heading-urdu" : "font-serif-display"
                }`}
              >
                {locale === "ur" ? "سوچ سمجھ کر ذخیرہ" : "Storage with intention"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className={`mt-5 leading-relaxed text-rose ${locale === "ur" ? "font-urdu text-xl" : ""}`}
              >
                {locale === "ur"
                  ? "سیرامک جار سے لے کر گلاس کنٹینرز تک، یہ مجموعہ ترتیب اور خوبصورتی کو اکٹھا کرتا ہے۔ فعال اشیاء جو دکھانے کے قابل ہیں۔"
                  : t("sections.storagePromo")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Link href={storageCategory ? `/shop/${storageCategory.slug}` : "/shop"}>
                  <Button variant="gold" size="lg" className="gap-2">
                    {t("sections.discover")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ===== WHY US ===== */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader
            eyebrow={t("common.explore")}
            title={t("sections.whyUs")}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Palette, title: t("whyUs.quality"), urdu: "پریمیم معیاری برتن" },
              { icon: Truck, title: t("whyUs.delivery"), urdu: "پاکستان بھر میں ترسیل" },
              { icon: Sparkles, title: t("whyUs.design"), urdu: "خوبصورت ڈیزائن" },
              { icon: ShieldCheck, title: t("whyUs.secure"), urdu: "محفوظ ادائیگی" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group rounded-3xl border border-line bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-maroon/10"
              >
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-maroon to-rose text-white shadow-lg shadow-maroon/20"
                >
                  <feature.icon className="h-8 w-8" />
                </motion.div>
                <h3
                  className={`text-lg font-semibold text-plum ${
                    locale === "ur" ? "heading-urdu" : ""
                  }`}
                >
                  {locale === "ur" ? feature.urdu : feature.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== ALL PRODUCTS TEASER ===== */}
        <section className="bg-cream/45 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeader
              eyebrow="✦ ✦ ✦"
              title={t("sections.newArrivals")}
              description={
                locale === "ur"
                  ? "تازہ ترین اضافے دیکھیں — ہر نفاست کے لیے کچھ جدید۔"
                  : "Explore the latest additions — something new for every taste."
              }
            />
            <ProductGrid products={products.slice(0, 4)} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}