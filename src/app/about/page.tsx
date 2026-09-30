"use client"

import { motion } from "framer-motion"
import { Heart, Sparkles, Home, Users } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { SectionHeader } from "@/components/ui/SectionHeader"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function AboutPage() {
  const { locale, t } = useLanguage()

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-light/40 to-cream py-24">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark"
            >
              {locale === "ur" ? "ہمارا سفر" : "Our Story"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-5xl font-bold text-maroon md:text-6xl ${
                locale === "ur" ? "heading-urdu" : "font-serif-display"
              }`}
            >
              {locale === "ur" ? "ادینہ ہاؤس ہولڈ کے بارے میں" : "About Adina Household"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 text-lg leading-relaxed text-ink-soft md:text-xl ${
                locale === "ur" ? "heading-urdu" : "font-serif-display"
              }`}
            >
              {locale === "ur"
                ? "ہم خوبصورت اشیاء لاتے ہیں جو گھر کو گھر بناتی ہیں۔"
                : "Bringing beauty to every home, one object at a time."}
            </motion.p>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader
            eyebrow="✦ ✦ ✦"
            title={locale === "ur" ? "ہماری اقدار" : "What We Value"}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: locale === "ur" ? "دل سے بنایا" : "Crafted with Love",
                desc:
                  locale === "ur"
                    ? "ہر ٹکڑا آپ کے گھر میں خوبصورتی اور نفاست لانے کے لیے احتیاط سے منتخب کیا گیا ہے۔"
                    : "Every piece is carefully curated to bring elegance and warmth to your home.",
              },
              {
                icon: Users,
                title: locale === "ur" ? "پاکستانی برانڈ" : "Proudly Pakistani",
                desc:
                  locale === "ur"
                    ? "پاکستان میں قائم، دنیا کی بہترین دستکاری ملک کی خوبصورتی کے ساتھ۔"
                    : "Born in Pakistan, bringing the world's finest craftsmanship together with local beauty.",
              },
              {
                icon: Sparkles,
                title: locale === "ur" ? "معیار کی ضمانت" : "Quality Guaranteed",
                desc:
                  locale === "ur"
                    ? "ہم صرف اعلیٰ درجے کا سیرامکس اور گلاس ویئر پیش کرتے ہیں جو برسوں چلتا ہے۔"
                    : "We only offer premium ceramics and glassware built to last for years.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-line bg-white p-8 text-center shadow-sm hover:shadow-xl hover:shadow-maroon/10"
              >
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-maroon to-rose text-white"
                >
                  <value.icon className="h-8 w-8" />
                </motion.div>
                <h3 className={`text-xl font-semibold text-plum ${locale === "ur" ? "heading-urdu" : "font-serif-display"}`}>
                  {value.title}
                </h3>
                <p className={`mt-3 text-ink-soft ${locale === "ur" ? "font-urdu" : ""}`}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-20 text-center md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-4xl font-semibold text-plum md:text-5xl ${
              locale === "ur" ? "heading-urdu" : "font-serif-display"
            }`}
          >
            {locale === "ur" ? "ہمارے مجموعے دیکھیں" : "Explore our collections"}
          </motion.h2>
          <Link href="/shop" className="mt-8 inline-block">
            <Button size="lg">{t("hero.cta")}</Button>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}