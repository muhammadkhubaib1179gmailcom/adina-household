"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Phone, Heart } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { categories } from "@/lib/data"

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M23.4871 28H5.51294C3.02916 28 1 25.9708 1 23.4871V5.51294C1 3.02916 3.02916 1 5.51294 1H23.4871C25.9708 1 28 3.02916 28 5.51294V23.4871C28 25.9819 25.9819 28 23.4871 28Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.60453 19.4066C10.913 20.715 12.6538 21.4357 14.5056 21.4357C16.3573 21.4357 18.0871 20.715 19.4066 19.4066C20.715 18.0982 21.4357 16.3573 21.4357 14.5056C21.4357 12.6538 20.715 10.9129 19.4066 9.60453C18.0982 8.29611 16.3573 7.57537 14.5056 7.57537C12.6538 7.57537 10.913 8.29611 9.60453 9.60453C8.29612 10.9129 7.57538 12.6538 7.57538 14.5056C7.57538 16.3573 8.29612 18.0982 9.60453 19.4066Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22.7866 7.34763C23.5214 7.34763 24.1172 6.75188 24.1172 6.017C24.1172 5.28211 23.5214 4.68637 22.7866 4.68637C22.0517 4.68637 21.4559 5.28211 21.4559 6.017C21.4559 6.75188 22.0517 7.34763 22.7866 7.34763Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Footer() {
  const { locale, t } = useLanguage()

  const collections = categories.map((c) => ({
    href: `/shop/${c.slug}`,
    label: locale === "ur" ? c.nameUrdu : c.name,
  }))

  const helpLinks = [
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/shop", label: t("nav.shop") },
  ]

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-24 bg-plum text-cream"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/40">
                <span className="font-serif-display text-2xl font-bold text-gold">A</span>
              </div>
              <div>
                <p className="font-serif-display text-2xl font-bold text-white">
                  {locale === "ur" ? "ادینہ ہاؤس ہولڈ" : "Adina Household"}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-rose">{t("footer.tagline")}</p>
              </div>
            </div>
            <p className={`mt-6 max-w-sm text-sm leading-relaxed text-rose ${locale === "ur" ? "font-urdu" : ""}`}>
              {locale === "ur"
                ? "خوبصورت سرامک پیالے، مگ، چائے کے کپ، اسٹوریج جار اور میٹھے کے برتن — ہم آپ کے گھر میں خوبصورتی لاتے ہیں۔"
                : "Beautiful ceramic bowls, mugs, tea cups, storage jars and dessert servers — we bring beauty to every home."}
            </p>
          </div>

          {/* Collections */}
          <div>
            <h3 className={`mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gold ${locale === "ur" ? "font-urdu tracking-normal text-base" : ""}`}>
              {t("footer.collections")}
            </h3>
            <ul className="space-y-3">
              {collections.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-cream/80 transition-all hover:text-gold hover:pl-1 ${locale === "ur" ? "font-urdu text-base" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className={`mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gold ${locale === "ur" ? "font-urdu tracking-normal text-base" : ""}`}>
              {t("footer.help")}
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-cream/80 transition-all hover:text-gold hover:pl-1 ${locale === "ur" ? "font-urdu text-base" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/923249680850"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-plum"
            >
              <Phone className="h-4 w-4" />
              +92 324 9680850
            </a>
          </div>

          {/* Instagram */}
          <div>
            <h3 className={`mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gold ${locale === "ur" ? "font-urdu tracking-normal text-base" : ""}`}>
              {t("footer.follow")}
            </h3>
            <a
              href="https://www.instagram.com/adina.household/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl border border-cream/15 bg-white/5 px-5 py-4 transition-all hover:border-gold/50 hover:bg-white/10"
            >
              <motion.span whileHover={{ scale: 1.2, rotate: 12 }}>
                <InstagramIcon className="h-6 w-6 text-rose" />
              </motion.span>
              <span>
                <span className={`block text-sm font-semibold text-white ${locale === "ur" ? "font-urdu" : ""}`}>
                  @adina.household
                </span>
                <span className={`text-xs text-rose ${locale === "ur" ? "font-urdu" : ""}`}>
                  {locale === "ur" ? "50K+ پیروکار" : "50K+ followers"}
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-cream/10 pt-8 md:flex-row md:justify-between">
          <p className={`text-xs text-cream/50 ${locale === "ur" ? "font-urdu text-sm" : ""}`}>
            © 2026 Adina Household. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-4 text-xs text-cream/50">
            <Link href="/admin" className="hover:text-cream/80 transition-colors">
              Admin
            </Link>
            <Heart className="h-3.5 w-3.5 text-gold" />
            <span className={`${locale === "ur" ? "font-urdu text-sm" : ""}`}>
              {locale === "ur" ? "پاکستان سے محبت کے ساتھ" : "Made with love in Pakistan"}
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}